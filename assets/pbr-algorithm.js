(function installPBRAlgorithm(global) {
  "use strict";

  const VERSION = "Universal-PBR-1.3";
  const RESOLUTIONS = [16, 32, 64, 128, 256, 512, 1024];
  const DEFAULTS = {
    resolution: 128,
    detailStrength: 0.72,
    colorRelief: 0.34,
    structureThreshold: 0.12,
    structureSmooth: 0.62,
    geometryDepth: 1.0,
    bevelWidth: 0.28,
    normalStrength: 1.0,
    normalContrast: 1.3,
    stainSuppression: 0.78,
    grayWhiteAuto: true,
    grayWhiteGain: 1.55,
    roughnessBase: -1,
    roughnessContrast: 1.0,
    roughnessStructure: 0.58,
    metalnessAuto: 0.22,
    metalnessBias: 0.0,
    emissiveAuto: 0.82,
    emissiveThreshold: 0.8,
    emissiveStrength: 1.0,
    previewExposure: 1.0,
    previewLightX: -0.46,
    previewLightY: -0.56,
    previewLightZ: 0.69,
  };
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function mix(a, b, t) {
    return a + (b - a) * t;
  }
  function smoothstep(a, b, x) {
    x = clamp((x - a) / (b - a || 1), 0, 1);
    return x * x * (3 - 2 * x);
  }
  function copyPreset(p = {}) {
    if (!p || typeof p !== "object" || Array.isArray(p))
      throw new Error("算法配置必须是对象");
    const preset = {
      ...DEFAULTS,
    };
    for (const key of Object.keys(DEFAULTS)) {
      if (!Object.hasOwn(p, key)) continue;
      if (
        typeof p[key] !== typeof DEFAULTS[key] ||
        (typeof p[key] === "number" && !Number.isFinite(p[key]))
      )
        throw new Error("算法参数无效 " + key);
      preset[key] = p[key];
    }
    return preset;
  }
  function frame(w, h, data) {
    return {
      width: w,
      height: h,
      data: data,
    };
  }
  function get(src, x, y, c) {
    x = (x + src.width) % src.width;
    y = (y + src.height) % src.height;
    return src.data[(y * src.width + x) * 4 + c];
  }
  function lumAt(src, x, y) {
    return (
      (get(src, x, y, 0) * 0.2126 +
        get(src, x, y, 1) * 0.7152 +
        get(src, x, y, 2) * 0.0722) /
      255
    );
  }
  function satAt(src, x, y) {
    const r = get(src, x, y, 0) / 255,
      g = get(src, x, y, 1) / 255,
      b = get(src, x, y, 2) / 255;
    const hi = Math.max(r, g, b),
      lo = Math.min(r, g, b);
    return hi <= 1e-6 ? 0 : (hi - lo) / hi;
  }
  function hash2(x, y) {
    let n = (x * 374761393 + y * 668265263) >>> 0;
    n = ((n ^ (n >>> 13)) * 1274126177) >>> 0;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }
  function analyze(src, preset) {
    const w = src.width,
      h = src.height,
      n = w * h;
    const luminance = new Float32Array(n),
      saturation = new Float32Array(n),
      localDeviation = new Float32Array(n),
      edge = new Float32Array(n);
    let ml = 0,
      ms = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x,
          l = lumAt(src, x, y),
          s = satAt(src, x, y);
        luminance[i] = l;
        saturation[i] = s;
        ml += l;
        ms += s;
      }
    ml /= n;
    ms /= n;
    let varL = 0,
      edgeMean = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x,
          l = luminance[i];
        varL += (l - ml) * (l - ml);
        const gx = Math.abs(lumAt(src, x + 1, y) - lumAt(src, x - 1, y)) * 0.5;
        const gy = Math.abs(lumAt(src, x, y + 1) - lumAt(src, x, y - 1)) * 0.5;
        const e = Math.max(gx, gy);
        edge[i] = e;
        edgeMean += e;
        const vals = [
          lumAt(src, x, y),
          lumAt(src, x - 1, y),
          lumAt(src, x + 1, y),
          lumAt(src, x, y - 1),
          lumAt(src, x, y + 1),
        ];
        const m = vals.reduce((a, b) => a + b, 0) / 5;
        let vv = 0;
        for (const q of vals) vv += (q - m) * (q - m);
        localDeviation[i] = Math.sqrt(vv / 5);
      }
    varL = Math.sqrt(varL / n);
    edgeMean /= n;
    const grayWhite =
      !!preset.grayWhiteAuto && ml > 0.67 && ms < 0.18 && varL < 0.18;
    let analysisL = luminance;
    if (grayWhite) {
      analysisL = new Float32Array(n);
      const gain = clamp(Number(preset.grayWhiteGain) || 1.55, 1, 3);
      for (let i = 0; i < n; i++)
        analysisL[i] = clamp(ml + (luminance[i] - ml) * gain, 0, 1);
    }
    const contrast = varL;
    const structural = clamp(edgeMean * 4.5 + contrast * 2.0, 0, 1);
    const darkSmooth =
      clamp((0.42 - ml) / 0.42, 0, 1) * clamp(1 - edgeMean * 8, 0, 1);
    return {
      L: luminance,
      S: saturation,
      V: localDeviation,
      edge,
      analysisL,
      meanL: ml,
      meanS: ms,
      stdL: varL,
      edgeMean,
      grayWhite,
      structural,
      darkSmooth,
    };
  }
  function robustGrid(src, an, p) {
    const w = src.width,
      h = src.height,
      n = w * h;
    let cur = new Float32Array(an.analysisL);
    const iter = p.stainSuppression > 0.66 ? 2 : 1;
    for (let it = 0; it < iter; it++) {
      const next = new Float32Array(n);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const vals = [
            cur[y * w + x],
            cur[y * w + ((x + w - 1) % w)],
            cur[y * w + ((x + 1) % w)],
            cur[((y + h - 1) % h) * w + x],
            cur[((y + 1) % h) * w + x],
          ].sort((a, b) => a - b);
          const med = vals[2],
            orig = an.analysisL[y * w + x];
          const robustBlend = clamp(
            clamp(p.stainSuppression, 0, 1) * 0.56 +
              clamp(p.structureSmooth, 0, 1) * 0.38,
            0,
            0.94,
          );
          next[y * w + x] = mix(orig, med, robustBlend);
        }
      cur = next;
    }
    return cur;
  }
  function nearestResolution(v) {
    v = Number(v) || 16;
    return RESOLUTIONS.includes(v)
      ? v
      : RESOLUTIONS.reduce(
          (a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a),
          RESOLUTIONS[0],
        );
  }
  function areaResizeFrame(src, tw, th) {
    tw = Math.max(1, tw | 0);
    th = Math.max(1, th | 0);
    if (tw === src.width && th === src.height)
      return frame(src.width, src.height, new Uint8ClampedArray(src.data));
    const out = new Uint8ClampedArray(tw * th * 4),
      sx = src.width / tw,
      sy = src.height / th;
    for (let ty = 0; ty < th; ty++)
      for (let tx = 0; tx < tw; tx++) {
        const x0 = Math.floor(tx * sx),
          x1 = Math.max(x0 + 1, Math.ceil((tx + 1) * sx));
        const y0 = Math.floor(ty * sy),
          y1 = Math.max(y0 + 1, Math.ceil((ty + 1) * sy));
        let pr = 0,
          pg = 0,
          pb = 0,
          aa = 0,
          n = 0;
        for (let y = y0; y < Math.min(src.height, y1); y++)
          for (let x = x0; x < Math.min(src.width, x1); x++) {
            const o = (y * src.width + x) * 4,
              a = src.data[o + 3] / 255;
            pr += src.data[o] * a;
            pg += src.data[o + 1] * a;
            pb += src.data[o + 2] * a;
            aa += a;
            n++;
          }
        const d = (ty * tw + tx) * 4,
          am = n ? aa / n : 0;
        if (aa > 1e-8) {
          out[d] = clamp(Math.round(pr / aa), 0, 255);
          out[d + 1] = clamp(Math.round(pg / aa), 0, 255);
          out[d + 2] = clamp(Math.round(pb / aa), 0, 255);
        } else out[d] = out[d + 1] = out[d + 2] = 0;
        out[d + 3] = clamp(Math.round(am * 255), 0, 255);
      }
    return frame(tw, th, out);
  }
  function prepareSource(src, p) {
    const tw = nearestResolution(p.resolution || src.width);
    if (tw >= src.width)
      return {
        src,
        target: tw,
      };
    const th = Math.max(1, Math.round((src.height * tw) / src.width));
    return {
      src: areaResizeFrame(src, tw, th),
      target: tw,
    };
  }
  function targetSize(src, p) {
    let tw = nearestResolution(p.resolution || src.width);
    if (tw < src.width) tw = src.width;
    let scale = tw / src.width;
    if (Math.abs(scale - Math.round(scale)) > 1e-6) {
      scale = Math.max(1, Math.round(scale));
      tw = src.width * scale;
    }
    const s = Math.max(1, Math.round(scale));
    return {
      w: src.width * s,
      h: src.height * s,
      scale: s,
    };
  }
  function squareCellDetail(x, y, xx, yy, s, activity, detail, stain) {
    if (s <= 1 || detail <= 0) return 0;
    let total = 0,
      weight = 0;
    const levels = [2, 4, 8];
    for (let li = 0; li < levels.length; li++) {
      const q = Math.min(levels[li], s);
      if (q < 2) continue;
      let mean = 0;
      for (let by = 0; by < q; by++)
        for (let bx = 0; bx < q; bx++)
          mean += hash2(
            x * 131 + bx * 17 + li * 977,
            y * 137 + by * 19 + li * 991,
          );
      mean /= q * q;
      const bx = Math.min(q - 1, Math.floor(((xx + 0.5) * q) / s)),
        by = Math.min(q - 1, Math.floor(((yy + 0.5) * q) / s));
      const v =
        hash2(x * 131 + bx * 17 + li * 977, y * 137 + by * 19 + li * 991) -
        mean;
      const w = li === 0 ? 0.62 : li === 1 ? 0.27 : 0.11;
      total += v * w;
      weight += w;
    }
    const amp =
      0.026 *
      detail *
      (0.22 + 0.78 * activity) *
      (1 - clamp(stain, 0, 1) * 0.62);
    return weight ? (total / weight) * amp : 0;
  }
  function squareCellRelief(x, y, xx, yy, s, an, p) {
    if (s <= 1 || Number(p.colorRelief) <= 0) return 0;
    const w = an.analysisL.length
      ? Math.round(Math.sqrt(an.analysisL.length))
      : 0;
    const sw = p.__reliefW || w,
      sh =
        p.__reliefH ||
        Math.max(1, Math.round(an.analysisL.length / Math.max(1, sw)));
    const i = y * sw + x,
      g0 = an.analysisL[i],
      gl = an.analysisL[y * sw + ((x + sw - 1) % sw)],
      gr = an.analysisL[y * sw + ((x + 1) % sw)],
      gt = an.analysisL[((y + sh - 1) % sh) * sw + x],
      gb = an.analysisL[((y + 1) % sh) * sw + x];
    const bw = Math.max(
      1,
      s * clamp(Number(p.bevelWidth) * 0.88 + 0.08, 0.08, 0.46),
    );
    const th = Math.max(0.008, (Number(p.structureThreshold) || 0.12) * 0.34);
    const local = clamp(
      an.structural * 0.58 + an.edge[i] * 2.4 + an.V[i] * 2.0,
      0,
      1,
    );
    const edges = [
      [xx + 0.5, g0 - gl, 0.92],
      [s - xx - 0.5, g0 - gr, -0.7],
      [yy + 0.5, g0 - gt, 1.0],
      [s - yy - 0.5, g0 - gb, -0.78],
    ];
    let best = 0,
      bmag = 0;
    for (let k = 0; k < edges.length; k++) {
      const dist = edges[k][0],
        depth = edges[k][1];
      if (dist >= bw || Math.abs(depth) < th) continue;
      const t = 1 - dist / bw,
        val = depth * edges[k][2] * t * t;
      if (Math.abs(val) > bmag) {
        best = val;
        bmag = Math.abs(val);
      }
    }
    return best * clamp(Number(p.colorRelief) || 0, 0, 1.5) * local * 0.68;
  }
  function upscaleAlbedo(src, an, p, ts) {
    const out = new Uint8ClampedArray(ts.w * ts.h * 4),
      s = ts.scale,
      w = src.width,
      h = src.height;
    p.__reliefW = w;
    p.__reliefH = h;
    const cellDelta = new Float32Array(Math.max(1, s * s));
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x,
          detail = clamp(p.detailStrength, 0, 2),
          activity = clamp(an.V[i] * 5.2 + an.edge[i] * 1.15, 0, 1);
        let mean = 0,
          n = 0;
        for (let yy = 0; yy < s; yy++)
          for (let xx = 0; xx < s; xx++) {
            const micro = squareCellDetail(
              x,
              y,
              xx,
              yy,
              s,
              activity,
              detail,
              p.stainSuppression,
            );
            const relief = squareCellRelief(x, y, xx, yy, s, an, p);
            const d = micro + relief;
            cellDelta[n++] = d;
            mean += d;
          }
        mean /= Math.max(1, n);
        n = 0;
        for (let yy = 0; yy < s; yy++)
          for (let xx = 0; xx < s; xx++) {
            const delta = (cellDelta[n++] - mean) * 255,
              so = i * 4,
              doff = ((y * s + yy) * ts.w + (x * s + xx)) * 4;
            out[doff] = clamp(Math.round(src.data[so] + delta), 0, 255);
            out[doff + 1] = clamp(Math.round(src.data[so + 1] + delta), 0, 255);
            out[doff + 2] = clamp(Math.round(src.data[so + 2] + delta), 0, 255);
            out[doff + 3] = src.data[so + 3];
          }
      }
    delete p.__reliefW;
    delete p.__reliefH;
    return frame(ts.w, ts.h, out);
  }
  function buildHeight(src, an, p, ts) {
    const w = src.width,
      h = src.height,
      s = ts.scale,
      grid = robustGrid(src, an, p),
      out = new Float32Array(ts.w * ts.h);
    let gm = 0;
    for (let i = 0; i < grid.length; i++) gm += grid[i];
    gm /= grid.length;
    const th = Math.max(0.015, Number(p.structureThreshold) || 0.12);
    const bevel = clamp(Number(p.bevelWidth), 0, 0.5);
    const bw = s * bevel;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x,
          g0 = grid[i],
          gl = grid[y * w + ((x + w - 1) % w)],
          gr = grid[y * w + ((x + 1) % w)],
          gt = grid[((y + h - 1) % h) * w + x],
          gb = grid[((y + 1) % h) * w + x];
        const gx = (gr - gl) * 0.5,
          gy = (gb - gt) * 0.5;
        const edgeLocal = Math.max(
          Math.abs(g0 - gl),
          Math.abs(g0 - gr),
          Math.abs(g0 - gt),
          Math.abs(g0 - gb),
        );
        const hard = smoothstep(th * 0.65, th * 1.8, edgeLocal);
        const plateau = mix(0.18, 1.0, hard * an.structural);
        for (let yy = 0; yy < s; yy++)
          for (let xx = 0; xx < s; xx++) {
            const fx = ((xx + 0.5) / s - 0.5) * 2,
              fy = ((yy + 0.5) / s - 0.5) * 2;
            let v = g0 + (gx * fx + gy * fy) * (1 - plateau) * 0.42;
            if (bw > 1e-6) {
              const cands = [];
              const dl = xx + 0.5,
                dr = s - xx - 0.5,
                dt = yy + 0.5,
                db = s - yy - 0.5;
              if (dl < bw && Math.abs(gl - g0) > th)
                cands.push([
                  (gl - g0) * 0.5 * (1 - dl / bw),
                  Math.abs(gl - g0),
                ]);
              if (dr < bw && Math.abs(gr - g0) > th)
                cands.push([
                  (gr - g0) * 0.5 * (1 - dr / bw),
                  Math.abs(gr - g0),
                ]);
              if (dt < bw && Math.abs(gt - g0) > th)
                cands.push([
                  (gt - g0) * 0.5 * (1 - dt / bw),
                  Math.abs(gt - g0),
                ]);
              if (db < bw && Math.abs(gb - g0) > th)
                cands.push([
                  (gb - g0) * 0.5 * (1 - db / bw),
                  Math.abs(gb - g0),
                ]);
              if (cands.length) {
                cands.sort((a, b) => b[1] - a[1]);
                v += cands[0][0] * hard;
              }
            }
            v = 0.5 + (v - gm) * clamp(p.geometryDepth, 0, 3) * 1.25;
            out[(y * s + yy) * ts.w + (x * s + xx)] = clamp(v, 0, 1);
          }
      }
    return out;
  }
  function heightFrame(hf, w, h) {
    const d = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const v = clamp(Math.round(hf[i] * 255), 0, 255),
        o = i * 4;
      d[o] = d[o + 1] = d[o + 2] = v;
      d[o + 3] = 255;
    }
    return frame(w, h, d);
  }
  function normalFromHeight(hf, w, h, p) {
    const d = new Uint8ClampedArray(w * h * 4),
      strength =
        clamp(Number(p.normalStrength) * Number(p.normalContrast), 0, 8) * 2.5;
    const at = (x, y) => hf[((y + h) % h) * w + ((x + w) % w)];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const gx = (at(x + 1, y) - at(x - 1, y)) * 0.5,
          gy = (at(x, y + 1) - at(x, y - 1)) * 0.5;
        let nx = -gx * strength,
          ny = -gy * strength,
          nz = 1;
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len;
        ny /= len;
        nz /= len;
        const o = (y * w + x) * 4;
        d[o] = clamp(Math.round((nx * 0.5 + 0.5) * 255), 0, 255);
        d[o + 1] = clamp(Math.round((ny * 0.5 + 0.5) * 255), 0, 255);
        d[o + 2] = clamp(Math.round((nz * 0.5 + 0.5) * 255), 0, 255);
        d[o + 3] = 255;
      }
    return frame(w, h, d);
  }
  function scalarFrame(values, w, h) {
    const d = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const v = clamp(Math.round(values[i] * 255), 0, 255),
        o = i * 4;
      d[o] = d[o + 1] = d[o + 2] = v;
      d[o + 3] = 255;
    }
    return frame(w, h, d);
  }
  function materialMaps(src, an, p, ts, hf) {
    const n = ts.w * ts.h,
      s = ts.scale,
      w = src.width,
      h = src.height;
    const rough = new Float32Array(n),
      metal = new Float32Array(n),
      emit = new Float32Array(n);
    const autoBase = clamp(
      0.58 + an.edgeMean * 1.35 + an.stdL * 0.55 - an.darkSmooth * 0.28,
      0.28,
      0.88,
    );
    const base = p.roughnessBase >= 0 ? clamp(p.roughnessBase, 0, 1) : autoBase;
    for (let oy = 0; oy < ts.h; oy++)
      for (let ox = 0; ox < ts.w; ox++) {
        const sx = Math.min(w - 1, (ox / s) | 0),
          sy = Math.min(h - 1, (oy / s) | 0),
          si = sy * w + sx,
          oi = oy * ts.w + ox;
        const vv = an.V[si],
          ed = an.edge[si],
          l = an.L[si],
          sat = an.S[si];
        let r =
          base +
          (vv - 0.055) * p.roughnessContrast * 1.45 +
          ed * p.roughnessStructure * 0.45;
        r += Math.abs(hf[oi] - 0.5) * 0.1;
        r = clamp(r, 0.04, 1);
        rough[oi] = r;
        const lowSat = 1 - smoothstep(0.09, 0.28, sat),
          midLum = smoothstep(0.22, 0.48, l) * (1 - smoothstep(0.88, 0.98, l));
        const smoothCandidate = 1 - smoothstep(0.06, 0.22, vv + ed * 0.6);
        const mc =
          lowSat *
            midLum *
            smoothCandidate *
            clamp(Number(p.metalnessAuto) || 0, 0, 1) +
          Number(p.metalnessBias || 0);
        metal[oi] = clamp(mc, 0, 1);
        const chromaGlow =
          smoothstep(0.18, 0.48, sat) *
          smoothstep(p.emissiveThreshold - 0.18, p.emissiveThreshold, l);
        const isolated =
          Math.max(0, l - (an.meanL + an.stdL * 1.4)) *
          smoothstep(0.08, 0.25, ed) *
          2.2;
        emit[oi] = clamp(
          Math.max(chromaGlow, isolated) *
            clamp(p.emissiveAuto, 0, 1) *
            clamp(p.emissiveStrength, 0, 3),
          0,
          1,
        );
      }
    return {
      rough,
      metal,
      emit,
    };
  }
  function combineMer(m, e, r, w, h) {
    const d = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      d[o] = clamp(Math.round(m[i] * 255), 0, 255);
      d[o + 1] = clamp(Math.round(e[i] * 255), 0, 255);
      d[o + 2] = clamp(Math.round(r[i] * 255), 0, 255);
      d[o + 3] = 0;
    }
    return frame(w, h, d);
  }
  function srgbLin(x) {
    x = x / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }
  function linSrgb(x) {
    x = Math.max(0, x);
    return clamp(
      (x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055) * 255,
      0,
      255,
    );
  }
  function aces(x) {
    return clamp(
      (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14),
      0,
      1,
    );
  }
  function ggxPreview(albedo, normal, m, e, r, p, maxSize, sss) {
    let step = Math.max(
        1,
        Math.ceil(Math.max(albedo.width, albedo.height) / (maxSize || 256)),
      ),
      w = Math.ceil(albedo.width / step),
      h = Math.ceil(albedo.height / step);
    const d = new Uint8ClampedArray(w * h * 4);
    let lx = Number(p.previewLightX),
      ly = Number(p.previewLightY),
      lz = Number(p.previewLightZ);
    let ll = Math.hypot(lx, ly, lz) || 1;
    lx /= ll;
    ly /= ll;
    lz /= ll;
    const vx = 0,
      vy = 0,
      vz = 1;
    let hx = lx + vx,
      hy = ly + vy,
      hz = lz + vz,
      hl = Math.hypot(hx, hy, hz) || 1;
    hx /= hl;
    hy /= hl;
    hz /= hl;
    const vdh = clamp(vx * hx + vy * hy + vz * hz, 0, 1);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const sx = Math.min(albedo.width - 1, x * step),
          sy = Math.min(albedo.height - 1, y * step),
          si = (sy * albedo.width + sx) * 4,
          oi = (y * w + x) * 4;
        let nx = (normal.data[si] / 255) * 2 - 1,
          ny = (normal.data[si + 1] / 255) * 2 - 1,
          nz = (normal.data[si + 2] / 255) * 2 - 1;
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl;
        ny /= nl;
        nz /= nl;
        const ndl = clamp(nx * lx + ny * ly + nz * lz, 0, 1),
          ndv = clamp(nz, 0.04, 1),
          ndh = clamp(nx * hx + ny * hy + nz * hz, 0, 1);
        const pixel = sy * albedo.width + sx,
          rr = clamp(r[pixel], 0.045, 1),
          rawMetal = clamp(m[pixel], 0, 1),
          rawSub = clamp(sss?.[pixel] || 0, 0, 1),
          sub = rawSub >= rawMetal ? rawSub : 0,
          mm = rawSub >= rawMetal ? 0 : rawMetal,
          ee = clamp(e[pixel], 0, 1);
        const ar = Math.max(rr * rr, 0.0035),
          a2 = ar * ar;
        const den = Math.PI * Math.pow(ndh * ndh * (a2 - 1) + 1, 2) + 1e-7;
        const D = a2 / den,
          k = Math.pow(ar + 1, 2) / 8,
          Gv = ndv / (ndv * (1 - k) + k + 1e-7),
          Gl = ndl / (ndl * (1 - k) + k + 1e-7),
          G = Gv * Gl;
        for (let c = 0; c < 3; c++) {
          const base = srgbLin(albedo.data[si + c]),
            f0 = 0.04 * (1 - mm) + base * mm,
            F = f0 + (1 - f0) * Math.pow(1 - vdh, 5),
            spec = ((D * G) / (4 * ndv * Math.max(ndl, 1e-4) + 1e-6)) * F,
            kd = (1 - F) * (1 - mm),
            diff = (kd * base) / Math.PI,
            direct =
              (diff + spec) * (c === 0 ? 3.15 : c === 1 ? 2.92 : 2.62) * ndl,
            envD = base * (0.085 + 0.055 * (1 - mm)),
            envS =
              (f0 + (1 - f0) * Math.pow(1 - ndv, 5)) *
              (0.28 * Math.pow(1 - rr, 2) + 0.018),
            em = base * ee * 2.4;
          const scatter =
            base *
            sub *
            (0.12 +
              0.65 *
                Math.pow(Math.max(0, -(nx * lx + ny * ly + nz * lz)), 0.65));
          let hdr =
            (direct + envD + envS + em + scatter) *
            clamp(p.previewExposure, 0.2, 3);
          d[oi + c] = linSrgb(aces(hdr));
        }
        d[oi + 3] = albedo.data[si + 3];
      }
    return frame(w, h, d);
  }
  function previewFromLayers(
    albedo,
    normal,
    metalFrame,
    emitFrame,
    roughFrame,
    options,
    maxSize,
    subFrame,
  ) {
    const p = copyPreset(options),
      n = albedo.width * albedo.height,
      m = new Float32Array(n),
      e = new Float32Array(n),
      r = new Float32Array(n),
      s = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      m[i] = (metalFrame.data[o] || 0) / 255;
      e[i] = (emitFrame.data[o] || 0) / 255;
      r[i] = (roughFrame.data[o] || 0) / 255;
      s[i] = (subFrame?.data[o] || 0) / 255;
    }
    return ggxPreview(albedo, normal, m, e, r, p, maxSize || 256, s);
  }
  function metricsFor(src, ts, an, p) {
    return {
      source: [src.width, src.height],
      target: [ts.w, ts.h],
      scale: ts.scale,
      mean_luminance: an.meanL,
      mean_saturation: an.meanS,
      luminance_std: an.stdL,
      edge_mean: an.edgeMean,
      gray_white_enhanced: an.grayWhite,
      structure_confidence: an.structural,
      normal_gain: p.normalStrength * p.normalContrast,
    };
  }
  function generateChannel(src, options, channel) {
    if (
      !src ||
      !Number.isInteger(src.width) ||
      !Number.isInteger(src.height) ||
      src.width < 1 ||
      src.height < 1 ||
      src.width * src.height > 16777216 ||
      !src.data ||
      src.data.length !== src.width * src.height * 4
    )
      throw new Error("算法输入图像无效");
    let p = copyPreset(options);
    const prepared = prepareSource(src, p);
    src = prepared.src;
    p.resolution = prepared.target;
    const ts = targetSize(src, p),
      an = analyze(src, p),
      out = {
        version: VERSION,
        preset: p,
        analysis: an,
        metrics: metricsFor(src, ts, an, p),
      };
    channel = String(channel || "all");
    if (ts.w * ts.h > 16777216) throw new Error("算法输出超过 1600 万像素");
    if (channel === "color") {
      out.albedo = upscaleAlbedo(src, an, p, ts);
      return out;
    }

    const hf = buildHeight(src, an, p, ts);
    if (channel === "height") {
      out.height = heightFrame(hf, ts.w, ts.h);
      return out;
    }
    if (channel === "normal") {
      out.height = heightFrame(hf, ts.w, ts.h);
      out.normal = normalFromHeight(hf, ts.w, ts.h, p);
      return out;
    }
    const maps = materialMaps(src, an, p, ts, hf);
    if (channel === "roughness") {
      out.roughness = scalarFrame(maps.rough, ts.w, ts.h);
      return out;
    }
    if (channel === "metal" || channel === "metalness") {
      out.metalness = scalarFrame(maps.metal, ts.w, ts.h);
      return out;
    }
    if (channel === "emissive") {
      out.emissive = scalarFrame(maps.emit, ts.w, ts.h);
      return out;
    }
    if (channel === "mer" || channel === "mers") {
      out.mers = combineMer(maps.metal, maps.emit, maps.rough, ts.w, ts.h);
      out.mer = out.mers;
      return out;
    }
    const albedo = upscaleAlbedo(src, an, p, ts),
      normal = normalFromHeight(hf, ts.w, ts.h, p),
      height = heightFrame(hf, ts.w, ts.h),
      roughness = scalarFrame(maps.rough, ts.w, ts.h),
      metalness = scalarFrame(maps.metal, ts.w, ts.h),
      emissive = scalarFrame(maps.emit, ts.w, ts.h),
      mer = combineMer(maps.metal, maps.emit, maps.rough, ts.w, ts.h),
      preview = ggxPreview(
        albedo,
        normal,
        maps.metal,
        maps.emit,
        maps.rough,
        p,
        256,
      );
    return Object.assign(out, {
      albedo,
      normal,
      height,
      roughness,
      metalness,
      emissive,
      mers: mer,
      mer,
      preview,
    });
  }
  function generate(src, options) {
    return generateChannel(src, options, "all");
  }
  function exportPreset(p) {
    return {
      kind: "renderdragon-pbr-algorithm-preset",
      version: 1,
      engine: VERSION,
      params: copyPreset(p),
    };
  }
  function importPreset(doc) {
    if (!doc || typeof doc !== "object") throw new Error("无效算法配置");
    const p = doc.params || doc.algorithm || doc;
    if (!p || typeof p !== "object") throw new Error("算法参数缺失");
    return copyPreset(p);
  }
  global.RenderDragonPBRAlgorithm = {
    VERSION,
    RESOLUTIONS,
    DEFAULTS,
    nearestResolution,
    copyPreset,
    analyze,
    generate,
    generateChannel,
    ggxPreview,
    previewFromLayers,
    exportPreset,
    importPreset,
  };
  global.RenderDragonPBRAlgorithm.workerSource =
    "(" + installPBRAlgorithm.toString() + ")(self);";
})(window);
