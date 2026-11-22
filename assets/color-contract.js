/* RenderDragon 管线颜色合同。只认 schema 允许的写出，不编造配方名。
 * lighting/atmos：#RRGGBB 或整数 [0–255]
 * fog_color / local_light / client_biome：只 #RRGGBB
 * media_coefficients：RGB 0.0–1.0
 * 材质 PNG / MER：0–255
 * 调色 vec3 不是颜色。
 */
(function (global) {
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }
  function snap8(n) {
    return clamp(Math.round(Number(n) || 0), 0, 255);
  }
  function rgbHex(r, g, b) {
    function h(n) {
      return ("0" + snap8(n).toString(16)).slice(-2).toUpperCase();
    }
    return "#" + h(r) + h(g) + h(b);
  }
  function hexRgb(hex) {
    var t = String(hex || "#000000").replace("#", "");
    if (t.length === 3) t = t[0] + t[0] + t[1] + t[1] + t[2] + t[2];
    return [
      parseInt(t.slice(0, 2), 16) || 0,
      parseInt(t.slice(2, 4), 16) || 0,
      parseInt(t.slice(4, 6), 16) || 0,
    ];
  }
  function rgb01(rgb) {
    return [
      +(snap8(rgb[0]) / 255).toFixed(4),
      +(snap8(rgb[1]) / 255).toFixed(4),
      +(snap8(rgb[2]) / 255).toFixed(4),
    ];
  }
  function hsvRgb(h, s, v) {
    var c = v * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = v - c;
    var r = 0,
      g = 0,
      b = 0;
    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];
  }
  function push(out, seen, r, g, b) {
    var rgb = [snap8(r), snap8(g), snap8(b)];
    var hex = rgbHex(rgb[0], rgb[1], rgb[2]);
    if (seen[hex]) return;
    seen[hex] = 1;
    out.push({
      hex: hex,
      rgb: rgb,
      rgb01: rgb01(rgb),
    });
  }
  function basicRgb() {
    var out = [],
      seen = {};
    [0, 255].forEach(function (r) {
      [0, 255].forEach(function (g) {
        [0, 255].forEach(function (b) {
          push(out, seen, r, g, b);
        });
      });
    });
    for (var g = 0; g <= 255; g += 32) push(out, seen, g, g, g);
    push(out, seen, 255, 255, 255);
    for (var h = 0; h < 360; h += 15) {
      var c = hsvRgb(h, 1, 1);
      push(out, seen, c[0], c[1], c[2]);
    }
    for (var h2 = 0; h2 < 360; h2 += 30) {
      var a = hsvRgb(h2, 0.5, 1);
      var d = hsvRgb(h2, 1, 0.5);
      push(out, seen, a[0], a[1], a[2]);
      push(out, seen, d[0], d[1], d[2]);
    }
    return out;
  }
  function gradientRgb() {
    var out = [],
      seen = {};
    var wheel = [];
    for (var h = 0; h < 360; h += 15) wheel.push(hsvRgb(h, 1, 1));
    for (var i = 0; i < wheel.length; i++) {
      var a = wheel[i],
        b = wheel[(i + 1) % wheel.length];
      for (var t = 1; t <= 3; t++) {
        var k = t / 4;
        push(
          out,
          seen,
          a[0] + (b[0] - a[0]) * k,
          a[1] + (b[1] - a[1]) * k,
          a[2] + (b[2] - a[2]) * k,
        );
      }
    }
    for (var h3 = 0; h3 < 360; h3 += 30) {
      var hi = hsvRgb(h3, 1, 1),
        lo = hsvRgb(h3, 1, 0.5);
      for (var t2 = 1; t2 <= 2; t2++) {
        var k2 = t2 / 3;
        push(
          out,
          seen,
          hi[0] + (lo[0] - hi[0]) * k2,
          hi[1] + (lo[1] - hi[1]) * k2,
          hi[2] + (lo[2] - hi[2]) * k2,
        );
      }
    }
    for (var g = 0; g < 255; g += 32) {
      var n = Math.min(255, g + 32);
      for (var s = 1; s <= 3; s++) {
        var v = g + (n - g) * (s / 4);
        push(out, seen, v, v, v);
      }
    }
    return out;
  }
  function grayBasic() {
    var out = [];
    for (var g = 0; g <= 255; g += 32)
      out.push({
        hex: rgbHex(g, g, g),
        gray: snap8(g),
        rgb: [snap8(g), snap8(g), snap8(g)],
      });
    out.push({
      hex: rgbHex(255, 255, 255),
      gray: 255,
      rgb: [255, 255, 255],
    });
    return out;
  }
  function grayGradient() {
    var out = [];
    for (var g = 0; g <= 255; g += 8) {
      if (g % 32 === 0) continue;
      out.push({
        hex: rgbHex(g, g, g),
        gray: g,
        rgb: [g, g, g],
      });
    }
    return out;
  }
  var cache = {};
  function basic(contract) {
    if (contract === "gray255") return grayBasic();
    return cache.basic || (cache.basic = basicRgb());
  }
  function gradient(contract) {
    if (contract === "gray255") return grayGradient();
    return cache.grad || (cache.grad = gradientRgb());
  }
  function allSwatches(contract) {
    return basic(contract).concat(gradient(contract));
  }
  function snap(contract, value) {
    var rgb =
      typeof value === "string"
        ? hexRgb(value)
        : [
            snap8(value && value[0]),
            snap8(value && value[1]),
            snap8(value && value[2]),
          ];
    if (contract === "gray255") {
      var y = snap8(rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
      return {
        hex: rgbHex(y, y, y),
        rgb: [y, y, y],
        gray: y,
        rgb01: rgb01([y, y, y]),
      };
    }
    return {
      hex: rgbHex(rgb[0], rgb[1], rgb[2]),
      rgb: rgb,
      rgb01: rgb01(rgb),
    };
  }
  function writeValue(contract, value) {
    var row = snap(contract, value);
    if (contract === "hex") return row.hex;
    if (contract === "color01") return row.rgb01;
    if (contract === "gray255") return row.gray;
    return row.rgb;
  }
  function hint(contract) {
    if (contract === "color01")
      return "这一槽 JSON 只认 RGB 0.0–1.0。选完会换成小数，不能写 255。";
    if (contract === "hex") return "这一槽 JSON 只认 #RRGGBB。";
    if (contract === "gray255") return "这一槽 JSON 只认 0–255 单通道。";
    return "这一槽 JSON 认 #RRGGBB 或整数 [r,g,b] 0–255。";
  }
  function contractOf(parent, scale) {
    parent = String(parent || "");
    if (scale === "01") return "color01";
    if (
      parent.indexOf("local.") === 0 ||
      parent.indexOf("biome.") === 0 ||
      parent === "pbr.set.color" ||
      /fog_color$/.test(parent) ||
      /sky_color$/.test(parent) ||
      /surface_color$/.test(parent)
    )
      return "hex";
    return "color255";
  }
  global.RenderDragonColorContract = {
    basic: basic,
    gradient: gradient,
    all: allSwatches,
    snap: snap,
    write: writeValue,
    hint: hint,
    contractOf: contractOf,
    rgbHex: rgbHex,
    hexRgb: hexRgb,
    hsvRgb: hsvRgb,
  };
})(window);
