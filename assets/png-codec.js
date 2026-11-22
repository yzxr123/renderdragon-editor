/* RenderDragon data-texture PNG IO
 * Independent RGB and alpha channels  Never round-trip MER/MERS through a premultiplied canvas
 * Supports PNG colour types 0 2 3 4 6 and Adam7  Output is RGBA8
 */
(function (global) {
  "use strict";

  const SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const TABLE = Uint32Array.from(
    {
      length: 256,
    },
    (_, n) => {
      for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
      return n >>> 0;
    },
  );
  function crc(bytes) {
    let n = 0xffffffff;
    for (const b of bytes) n = TABLE[(n ^ b) & 255] ^ (n >>> 8);
    return (n ^ 0xffffffff) >>> 0;
  }
  function u32(bytes, at) {
    return new DataView(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength,
    ).getUint32(at);
  }
  function put32(bytes, at, n) {
    new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).setUint32(
      at,
      n,
    );
  }
  function concat(items) {
    const out = new Uint8Array(items.reduce((n, x) => n + x.length, 0));
    let p = 0;
    for (const x of items) {
      out.set(x, p);
      p += x.length;
    }
    return out;
  }
  function paeth(a, b, c) {
    const p = a + b - c,
      aa = Math.abs(p - a),
      bb = Math.abs(p - b),
      cc = Math.abs(p - c);
    return aa <= bb && aa <= cc ? a : bb <= cc ? b : c;
  }
  async function streamBytes(bytes, compression, limit) {
    const stream = new Blob([bytes]).stream().pipeThrough(compression),
      reader = stream.getReader(),
      parts = [];
    let total = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > limit) {
        await reader.cancel();
        throw new Error("PNG 解压数据超过图像声明尺寸");
      }
      parts.push(value);
    }
    return concat(parts);
  }
  async function decode(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.length < 33 || !SIGNATURE.every((x, i) => bytes[i] === x))
      throw new Error("PNG 文件头损坏");
    let w = 0,
      h = 0,
      depth = 0,
      type = 0,
      interlace = 0,
      palette = null,
      transparency = null,
      seenHeader = false,
      seenEnd = false;
    const idat = [];
    for (let at = 8; at + 12 <= bytes.length;) {
      const n = u32(bytes, at);
      if (at + n + 12 > bytes.length) throw new Error("PNG 数据块被截断");
      const name = String.fromCharCode(...bytes.subarray(at + 4, at + 8)),
        data = bytes.subarray(at + 8, at + 8 + n);
      if (crc(bytes.subarray(at + 4, at + 8 + n)) !== u32(bytes, at + 8 + n))
        throw new Error("PNG 校验失败 " + name);
      if (name === "IHDR") {
        if (seenHeader || n !== 13) throw new Error("PNG IHDR 无效");
        seenHeader = true;
        w = u32(data, 0);
        h = u32(data, 4);
        depth = data[8];
        type = data[9];
        interlace = data[12];
        const allowed = {
          0: [1, 2, 4, 8, 16],
          2: [8, 16],
          3: [1, 2, 4, 8],
          4: [8, 16],
          6: [8, 16],
        };
        if (
          !w ||
          !h ||
          w * h > 16777216 ||
          !allowed[type]?.includes(depth) ||
          data[10] ||
          data[11] ||
          interlace > 1
        )
          throw new Error("PNG 尺寸或编码不受支持");
      } else if (!seenHeader) throw new Error("PNG 缺少 IHDR");
      else if (name === "PLTE") palette = data;
      else if (name === "tRNS") transparency = data;
      else if (name === "IDAT") idat.push(data);
      else if (name === "IEND") {
        seenEnd = true;
        break;
      } else if ((bytes[at + 4] & 32) === 0)
        throw new Error("不支持的 PNG 关键数据块 " + name);
      at += n + 12;
    }
    if (!seenHeader || !seenEnd || !idat.length)
      throw new Error("PNG 文件不完整");
    if (type === 3 && (!palette || palette.length % 3))
      throw new Error("PNG 调色板无效");
    const channels = {
        0: 1,
        2: 3,
        3: 1,
        4: 2,
        6: 4,
      }[type],
      bpp = Math.max(1, Math.ceil((channels * depth) / 8));
    const passes = interlace
      ? [
          [0, 0, 8, 8],
          [4, 0, 8, 8],
          [0, 4, 4, 8],
          [2, 0, 4, 4],
          [0, 2, 2, 4],
          [1, 0, 2, 2],
          [0, 1, 1, 2],
        ]
      : [[0, 0, 1, 1]];
    const geometry = passes.map(([x, y, dx, dy]) => ({
      x,
      y,
      dx,
      dy,
      pw: Math.max(0, Math.ceil((w - x) / dx)),
      ph: Math.max(0, Math.ceil((h - y) / dy)),
    }));
    const expected = geometry.reduce(
      (n, p) =>
        n +
        (p.pw && p.ph
          ? (Math.ceil((p.pw * channels * depth) / 8) + 1) * p.ph
          : 0),
      0,
    );
    const raw = await streamBytes(
      concat(idat),
      new DecompressionStream("deflate"),
      expected,
    );
    if (raw.length !== expected) throw new Error("PNG 扫描行数据长度错误");
    const out = new Uint8ClampedArray(w * h * 4),
      max = (1 << Math.min(depth, 16)) - 1;
    let cursor = 0;
    function sample(row, index) {
      if (depth === 8) return row[index];
      if (depth === 16) return row[index * 2] * 256 + row[index * 2 + 1];
      const bit = index * depth;
      return (row[bit >> 3] >> (8 - depth - (bit & 7))) & max;
    }
    const scale = (v) => Math.round((v * 255) / max),
      t = transparency;
    for (const pass of geometry) {
      if (!pass.pw || !pass.ph) continue;
      const stride = Math.ceil((pass.pw * channels * depth) / 8);
      let previous = new Uint8Array(stride);
      for (let y = 0; y < pass.ph; y++) {
        const filter = raw[cursor++],
          row = raw.slice(cursor, cursor + stride);
        cursor += stride;
        if (filter > 4) throw new Error("PNG 行过滤器无效");
        for (let i = 0; i < stride; i++) {
          const a = i >= bpp ? row[i - bpp] : 0,
            b = previous[i],
            c = i >= bpp ? previous[i - bpp] : 0;
          row[i] =
            (row[i] +
              (filter === 1
                ? a
                : filter === 2
                  ? b
                  : filter === 3
                    ? Math.floor((a + b) / 2)
                    : filter === 4
                      ? paeth(a, b, c)
                      : 0)) &
            255;
        }
        for (let x = 0; x < pass.pw; x++) {
          const pos = ((pass.y + y * pass.dy) * w + pass.x + x * pass.dx) * 4,
            j = x * channels;
          if (type === 3) {
            const v = sample(row, j),
              offset = v * 3;
            if (offset + 2 >= palette.length)
              throw new Error("PNG 调色板索引超出范围");
            out[pos] = palette[offset];
            out[pos + 1] = palette[offset + 1];
            out[pos + 2] = palette[offset + 2];
            out[pos + 3] = t && v < t.length ? t[v] : 255;
          } else if (type === 0 || type === 4) {
            const v = sample(row, j);
            out[pos] = out[pos + 1] = out[pos + 2] = scale(v);
            out[pos + 3] =
              type === 4
                ? scale(sample(row, j + 1))
                : t && t.length >= 2 && v === t[0] * 256 + t[1]
                  ? 0
                  : 255;
          } else {
            const r = sample(row, j),
              g = sample(row, j + 1),
              b = sample(row, j + 2);
            out[pos] = scale(r);
            out[pos + 1] = scale(g);
            out[pos + 2] = scale(b);
            out[pos + 3] =
              type === 6
                ? scale(sample(row, j + 3))
                : t &&
                    t.length >= 6 &&
                    r === t[0] * 256 + t[1] &&
                    g === t[2] * 256 + t[3] &&
                    b === t[4] * 256 + t[5]
                  ? 0
                  : 255;
          }
        }
        previous = row;
      }
    }
    return new ImageData(out, w, h);
  }
  function chunk(name, data) {
    const out = new Uint8Array(data.length + 12);
    put32(out, 0, data.length);
    out.set(
      [...name].map((x) => x.charCodeAt(0)),
      4,
    );
    out.set(data, 8);
    put32(out, data.length + 8, crc(out.subarray(4, data.length + 8)));
    return out;
  }
  async function encode(image, options = {}) {
    const { width: w, height: h, data } = image,
      type = options.colorType ?? 6,
      channels = {
        0: 1,
        2: 3,
        6: 4,
      }[type];
    if (!w || !h || w * h > 16777216 || data.length !== w * h * 4 || !channels)
      throw new Error("PNG 输出图像无效");
    const stride = w * channels,
      raw = new Uint8Array((stride + 1) * h);
    // 高度图输出单通道灰度  MER MERS 和基色保持独立通道且不经过预乘透明度
    for (let y = 0; y < h; y++) {
      const pos = y * (stride + 1);
      raw[pos] = 1;
      for (let x = 0; x < w; x++)
        for (let c = 0; c < channels; c++) {
          const at = (y * w + x) * 4 + c,
            previous = x ? data[at - 4] : 0;
          raw[pos + 1 + x * channels + c] = (data[at] - previous) & 255;
        }
    }
    const packed = await streamBytes(
      raw,
      new CompressionStream("deflate"),
      raw.length + Math.ceil(raw.length / 100) + 1024,
    );
    const ihdr = new Uint8Array(13);
    put32(ihdr, 0, w);
    put32(ihdr, 4, h);
    ihdr[8] = 8;
    ihdr[9] = type;
    return new Blob(
      [
        SIGNATURE,
        chunk("IHDR", ihdr),
        chunk("IDAT", packed),
        chunk("IEND", new Uint8Array()),
      ],
      {
        type: "image/png",
      },
    );
  }
  function inspect(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.length < 33 || !SIGNATURE.every((x, i) => bytes[i] === x))
      throw new Error("PNG 文件头损坏");
    let width = 0,
      height = 0,
      depth = 0,
      type = -1,
      header = false,
      ended = false,
      dataSeen = false,
      palette = false,
      transparency = false;
    for (let at = 8; at + 12 <= bytes.length;) {
      const length = u32(bytes, at);
      if (at + length + 12 > bytes.length) throw new Error("PNG 数据块被截断");
      const name = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
      if (
        crc(bytes.subarray(at + 4, at + 8 + length)) !==
        u32(bytes, at + 8 + length)
      )
        throw new Error("PNG 校验失败 " + name);
      if (!header && name !== "IHDR") throw new Error("PNG 缺少 IHDR");
      if (name === "IHDR") {
        if (header || length !== 13) throw new Error("PNG IHDR 无效");
        width = u32(bytes, at + 8);
        height = u32(bytes, at + 12);
        depth = bytes[at + 16];
        type = bytes[at + 17];
        header = true;
        if (
          !width ||
          !height ||
          !{
            0: [1, 2, 4, 8, 16],
            2: [8, 16],
            3: [1, 2, 4, 8],
            4: [8, 16],
            6: [8, 16],
          }[type]?.includes(depth) ||
          bytes[at + 18] ||
          bytes[at + 19] ||
          bytes[at + 20] > 1
        )
          throw new Error("PNG 尺寸或编码不受支持");
      } else if (name === "PLTE") {
        if (!length || length % 3 || length > 768)
          throw new Error("PNG 调色板无效");
        palette = true;
      } else if (name === "tRNS") {
        if (
          dataSeen ||
          !length ||
          (type === 2 && length !== 6) ||
          (type === 0 && length !== 2) ||
          (type === 3 && length > 256) ||
          type === 4 ||
          type === 6
        )
          throw new Error("PNG 透明表无效");
        transparency = true;
      } else if (name === "IDAT") dataSeen = true;
      else if (name === "IEND") {
        if (length) throw new Error("PNG IEND 无效");
        ended = true;
        break;
      }
      at += length + 12;
    }
    if (!header || !ended || !dataSeen || (type === 3 && !palette))
      throw new Error("PNG 文件不完整");
    const hasAlpha = type === 4 || type === 6 || transparency;
    const channels =
      type === 0 || type === 4 ? (hasAlpha ? 2 : 1) : hasAlpha ? 4 : 3;
    return {
      format: "png",
      width,
      height,
      bitDepth: depth,
      colorType: type,
      channels,
      hasAlpha,
      indexed: type === 3,
      transparency,
    };
  }
  global.RenderDragonPNG = {
    decode,
    encode,
    inspect,
  };
})(window);
