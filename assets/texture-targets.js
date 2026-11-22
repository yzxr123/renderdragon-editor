(function (global) {
  "use strict";

  const TARGETS = Object.freeze({
    opengl: {
      name: "OpenGL / FIO",
      format: "FIO 四分区",
      suffix: "_OP_FIO",
    },
    renderdragon: {
      name: "渲染龙专用",
      format: "材质文件组",
      suffix: "_RD_MERS",
    },
  });
  const DEFAULTS = Object.freeze({
    metal: 0,
    emissive: 0,
    roughness: 255,
    sub: 0,
  });
  function normalize(value) {
    if (value === "op" || value === "gl" || value === "fio") value = "opengl";
    if (!Object.hasOwn(TARGETS, value))
      throw new Error("请选择 OpenGL / FIO或渲染龙专用");
    return value;
  }
  function shape(w, h) {
    if (
      !Number.isInteger(w) ||
      !Number.isInteger(h) ||
      w < 2 ||
      h < 2 ||
      w * h * 4 > 16777216
    )
      throw new Error("四分区纹理尺寸无效或超过 1600 万像素");
  }
  function sample(image, x, y, w, h, channel, fallback) {
    if (!image) return fallback;
    if (!image.data || image.data.length !== image.width * image.height * 4)
      throw new Error("四合一输入像素不完整");
    return image.data[
      (Math.floor((y * image.height) / h) * image.width +
        Math.floor((x * image.width) / w)) *
        4 +
        channel
    ];
  }
  // 与已记录 FPBR isfio 的 DETMOD 和 RG 回退寻址对应  不是任意装饰线
  function markerAt(frame, x, y) {
    const get = (xx, yy) => {
      if (xx < 0 || yy < 0 || xx >= frame.width || yy >= frame.height)
        return null;
      const o = (yy * frame.width + xx) * 4;
      return frame.data.subarray(o, o + 4);
    };
    const isMark = (p) => p && p[0] === 255 && p[1] === 255 && p[3] === 127;
    let p = get(x, y);
    if (isMark(p)) return true;
    if (!p || p[2] !== 0 || (p[0] !== 255 && p[1] !== 255)) return false;
    return !!isMark(
      get(x - Math.floor(p[0] / 255), y - Math.floor(p[1] / 255)),
    );
  }
  function detectFIO(frame) {
    if (
      !frame ||
      frame.width % 2 ||
      frame.height % 2 ||
      frame.width < 4 ||
      frame.height < 4
    )
      return false;
    const w = frame.width / 2,
      h = frame.height / 2;
    // 全部检测区通过才分区  不根据紫色或 terrain quad 字段猜测
    for (let y = h; y < frame.height; y++)
      for (let x = w; x < frame.width; x++)
        if (!markerAt(frame, x, y)) return false;
    return true;
  }
  function packFIO(layers, w = layers.color?.width, h = layers.color?.height) {
    w = Number(w);
    h = Number(h);
    shape(w, h);
    const out = new ImageData(w * 2, h * 2),
      d = out.data,
      ow = w * 2;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const base = (y * ow + x) * 4,
          mat = (y * ow + x + w) * 4,
          norm = ((y + h) * ow + x) * 4,
          mark = ((y + h) * ow + x + w) * 4;
        for (let c = 0; c < 4; c++) {
          d[base + c] = sample(layers.color, x, y, w, h, c, c === 3 ? 255 : 0);
          d[norm + c] = sample(
            layers.normal,
            x,
            y,
            w,
            h,
            c,
            c === 2 || c === 3 ? 255 : 128,
          );
        }
        const rough = sample(layers.roughness, x, y, w, h, 0, 255);
        d[mat] = 255 - rough;
        d[mat + 1] = sample(layers.metal, x, y, w, h, 0, 0);
        // FIO 兼容编码保留 B  对导入 FIO 的未知 B 数据原样携带
        d[mat + 2] = sample(layers.fioBlue, x, y, w, h, 0, rough);
        d[mat + 3] = 255 - sample(layers.emissive, x, y, w, h, 0, 0);
        d.set([255, 255, 255, 127], mark);
        if (x === w - 1) d.set([255, 0, 0, 255], mark);
        if (y === h - 1) d.set([0, 255, 0, 255], mark);
        if (x === w - 1 && y === h - 1) d.set([255, 255, 0, 255], mark);
      }
    return out;
  }
  function unpackFIO(frame) {
    if (!detectFIO(frame))
      throw new Error("未识别到完整 FPBR 检测区  不会擅自裁切四宫格");
    const w = frame.width / 2,
      h = frame.height / 2,
      keys = [
        "color",
        "normal",
        "metal",
        "emissive",
        "roughness",
        "sub",
        "height",
        "fioBlue",
      ],
      out = {};
    for (const key of keys) out[key] = new ImageData(w, h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4,
          b = (y * frame.width + x) * 4,
          n = ((y + h) * frame.width + x) * 4,
          m = (y * frame.width + x + w) * 4;
        out.color.data.set(frame.data.subarray(b, b + 4), o);
        out.normal.data.set(frame.data.subarray(n, n + 4), o);
        for (const [key, v] of [
          ["metal", frame.data[m + 1]],
          ["emissive", 255 - frame.data[m + 3]],
          ["roughness", 255 - frame.data[m]],
          ["sub", 0],
          ["height", 128],
          ["fioBlue", frame.data[m + 2]],
        ])
          out[key].data.set([v, v, v, 255], o);
      }
    return out;
  }
  function pack(target, layers, w, h) {
    return normalize(target) === "opengl"
      ? packFIO(layers, w, h)
      : global.RenderDragonMERS.pack(layers, w, h, DEFAULTS);
  }
  function preview(target, frame) {
    return normalize(target) === "renderdragon"
      ? global.RenderDragonMERS.opaquePreview(frame)
      : new ImageData(
          new Uint8ClampedArray(frame.data),
          frame.width,
          frame.height,
        );
  }
  async function encode(target, layers, w, h) {
    return global.RenderDragonPNG.encode(pack(target, layers, w, h));
  }
  global.RenderDragonTargets = {
    TARGETS,
    DEFAULTS,
    normalize,
    packFIO,
    unpackFIO,
    detectFIO,
    markerAt,
    pack,
    preview,
    encode,
  };
})(window);
