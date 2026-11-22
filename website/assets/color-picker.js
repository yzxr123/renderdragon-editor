(function (global) {
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }
  function core() {
    return global.RenderDragonColorContract;
  }
  function hexRgb(hex) {
    return core() ? core().hexRgb(hex) : [255, 255, 255];
  }
  function rgbHex(r, g, b) {
    return core() ? core().rgbHex(r, g, b) : "#FFFFFF";
  }
  function rgbHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min;
    var h = 0,
      s = max ? d / max : 0,
      v = max;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return [h, s, v];
  }
  function hsvRgb(h, s, v) {
    if (core() && core().hsvRgb) return core().hsvRgb(h, s, v);
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
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
  }
  var overlay = null;
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function ensureCss() {
    if (document.getElementById("rdColorCss")) return;
    var s = document.createElement("style");
    s.id = "rdColorCss";
    s.textContent = [
      ".rd-color-mask{position:fixed;inset:0;background:rgba(8,10,16,.55);z-index:99999;display:flex;align-items:center;justify-content:center;}",
      ".rd-color-box{width:min(660px,96vw);max-height:92vh;overflow:auto;background:#11171c;color:#eef4f6;border:1px solid #3a4853;border-radius:7px;padding:14px 16px 12px;font:13px/1.45 'Segoe UI','Microsoft YaHei UI',sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.45);}",
      ".rd-color-box h3{margin:0 0 10px;font-size:16px;}",
      ".rd-color-row{display:flex;gap:12px;flex-wrap:wrap;}",
      ".rd-color-grid{display:flex;flex-wrap:wrap;gap:4px;max-height:160px;overflow:auto;}",
      ".rd-color-grid button{width:20px;height:20px;border:1px solid #56636c;padding:0;cursor:pointer;border-radius:2px;}",
      ".rd-color-map{width:250px;height:150px;border:1px solid #56636c;cursor:crosshair;display:block;}",
      ".rd-color-val{width:20px;height:150px;border:1px solid #56636c;cursor:ns-resize;display:block;}",
      ".rd-color-prev{width:60px;height:76px;border:1px solid #56636c;}",
      ".rd-color-nums{display:grid;grid-template-columns:auto 72px;gap:4px 8px;align-items:center;}",
      ".rd-color-nums input{width:82px;background:#0d1318;color:#eef4f6;border:1px solid #29343d;border-radius:4px;padding:4px 6px;}",
      ".rd-color-btns{display:flex;justify-content:flex-end;gap:8px;margin-top:12px;}",
      ".rd-color-btns button,.rd-color-box .rd-color-act{padding:6px 12px;cursor:pointer;background:#161d23;color:#eef4f6;border:1px solid #29343d;border-radius:4px;}",
      ".rd-color-label{font-size:11px;color:#8e9aa3;margin:8px 0 6px;}",
      ".rd-color-hint{font-size:11px;color:#8e9aa3;margin:6px 0 0;}",
      ".rd-color-boards .plain{font-size:12px;font-weight:700;margin:6px 0 4px;}",
      ".rd-color-boards .how{font-size:12px;opacity:.82;margin:0 0 6px;}",
      ".rd-color-boards .swatch-bar{display:flex;flex-wrap:wrap;gap:5px;}",
      ".rd-color-boards .swatch{width:18px;height:18px;border-radius:5px;border:1px solid rgba(0,0,0,.25);cursor:pointer;padding:0;}",
      ".rd-color-boards details{margin:6px 0;}",
      ".rd-color-boards summary{cursor:pointer;font-size:12px;}",
    ].join("");
    document.head.appendChild(s);
  }
  function swatchGrid(rows, onPick) {
    var grid = el("div", "rd-color-grid");
    (rows || []).forEach(function (row) {
      var hex = row.hex || row;
      var b = el("button");
      b.type = "button";
      b.style.background = hex;
      b.title = hex;
      b.setAttribute("aria-label", hex);
      b.onclick = function () {
        onPick(hex);
      };
      grid.appendChild(b);
    });
    return grid;
  }
  function mountBoards(parent, contract, onPick, opts) {
    ensureCss();
    opts = opts || {};
    var wrap = el("div", "rd-color-boards");
    if (opts.title !== false)
      wrap.appendChild(el("div", "plain", opts.title || "调色板"));
    if (opts.tip !== false) {
      var tip = el("div", "how");
      tip.innerHTML =
        "<i>使用说明</i>上方显示当前参数允许的基础颜色。渐变色由允许值插值得到，选择后仅修改当前参数。";
      wrap.appendChild(tip);
    }
    var basicGrid = swatchGrid(core() ? core().basic(contract) : [], onPick);
    if (opts.foldBasic) {
      var foldB = document.createElement("details");
      var sumB = document.createElement("summary");
      sumB.textContent = "基础色（选择后仅修改当前参数）";
      foldB.appendChild(sumB);
      foldB.appendChild(basicGrid);
      wrap.appendChild(foldB);
    } else {
      wrap.appendChild(el("div", "rd-color-label", "基础色"));
      wrap.appendChild(basicGrid);
    }
    var fold = document.createElement("details");
    var sum = document.createElement("summary");
    sum.textContent = "渐变色（基于当前参数允许值生成）";
    fold.appendChild(sum);
    fold.appendChild(
      swatchGrid(core() ? core().gradient(contract) : [], onPick),
    );
    wrap.appendChild(fold);
    if (core())
      wrap.appendChild(el("div", "rd-color-hint", core().hint(contract)));
    parent.appendChild(wrap);
    return wrap;
  }
  function openPicker(startHex, onOk, opts) {
    ensureCss();
    closePicker();
    opts = opts || {};
    var contract = opts.contract || "hex";
    var start = core()
      ? core().snap(contract, startHex || "#ffffff")
      : {
          hex: startHex || "#ffffff",
          rgb: hexRgb(startHex || "#ffffff"),
        };
    var rgb = start.rgb.slice();
    var hsv = rgbHsv(rgb[0], rgb[1], rgb[2]);
    if (contract === "gray255") hsv = [0, 0, rgb[0] / 255];
    overlay = el("div", "rd-color-mask");
    var box = el("div", "rd-color-box");
    box.appendChild(el("h3", "", opts.title || "调色板 · 选择颜色"));
    box.appendChild(
      el(
        "div",
        "rd-color-hint",
        (opts.tip || "") + (core() ? core().hint(contract) : ""),
      ),
    );
    var basics = el("div");
    basics.appendChild(el("div", "rd-color-label", "基础色"));
    basics.appendChild(
      swatchGrid(core() ? core().basic(contract) : [], function (hex) {
        setFromHex(hex);
        draw();
      }),
    );
    var grad = document.createElement("details");
    grad.open = true;
    var gsum = document.createElement("summary");
    gsum.textContent = "渐变色（基于当前参数允许值生成）";
    grad.appendChild(gsum);
    grad.appendChild(
      swatchGrid(core() ? core().gradient(contract) : [], function (hex) {
        setFromHex(hex);
        draw();
      }),
    );
    basics.appendChild(grad);
    box.appendChild(basics);
    var top = el("div", "rd-color-row");
    var mid = el("div");
    var map = document.createElement("canvas");
    map.className = "rd-color-map";
    map.width = 220;
    map.height = 140;
    var val = document.createElement("canvas");
    val.className = "rd-color-val";
    val.width = 18;
    val.height = 140;
    var maps = el("div", "rd-color-row");
    maps.appendChild(map);
    maps.appendChild(val);
    mid.appendChild(maps);
    top.appendChild(mid);
    var right = el("div");
    var prev = el("div", "rd-color-prev");
    right.appendChild(prev);
    var nums = el("div", "rd-color-nums");
    var fields = {};
    var rows =
      contract === "gray255"
        ? [
            ["明度", "v", 0, 255],
            ["灰度", "r", 0, 255],
          ]
        : [
            ["色调", "h", 0, 359],
            ["饱和", "s", 0, 255],
            ["明度", "v", 0, 255],
            ["红", "r", 0, 255],
            ["绿", "g", 0, 255],
            ["蓝", "b", 0, 255],
          ];
    rows.forEach(function (row) {
      nums.appendChild(el("span", "", row[0]));
      var inp = document.createElement("input");
      inp.type = "number";
      inp.min = String(row[2]);
      inp.max = String(row[3]);
      fields[row[1]] = inp;
      nums.appendChild(inp);
    });
    nums.appendChild(el("span", "", "网页色"));
    var hexInp = document.createElement("input");
    hexInp.type = "text";
    fields.hex = hexInp;
    nums.appendChild(hexInp);
    right.appendChild(nums);
    top.appendChild(right);
    box.appendChild(top);
    var eye = el("button", "rd-color-act", "取屏幕颜色");
    eye.onclick = pickScreen;
    box.appendChild(eye);
    var btns = el("div", "rd-color-btns");
    var cancel = el("button", "", "取消");
    var ok = el("button", "", "确定");
    cancel.onclick = closePicker;
    ok.onclick = function () {
      var snapped = core()
        ? core().snap(contract, rgb)
        : {
            hex: rgbHex(rgb[0], rgb[1], rgb[2]),
          };
      closePicker();
      if (onOk) onOk(snapped.hex, snapped);
    };
    btns.appendChild(cancel);
    btns.appendChild(ok);
    box.appendChild(btns);
    overlay.appendChild(box);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closePicker();
    });
    document.body.appendChild(overlay);
    function setFromHex(hex) {
      var snapped = core()
        ? core().snap(contract, hex)
        : {
            rgb: hexRgb(hex),
          };
      rgb = snapped.rgb.slice();
      hsv =
        contract === "gray255"
          ? [0, 0, rgb[0] / 255]
          : rgbHsv(rgb[0], rgb[1], rgb[2]);
    }
    function setRgb(next) {
      var snapped = core()
        ? core().snap(contract, next)
        : {
            rgb: [
              clamp(next[0], 0, 255),
              clamp(next[1], 0, 255),
              clamp(next[2], 0, 255),
            ],
          };
      rgb = snapped.rgb.slice();
      hsv =
        contract === "gray255"
          ? [0, 0, rgb[0] / 255]
          : rgbHsv(rgb[0], rgb[1], rgb[2]);
    }
    function setHsv(next) {
      if (contract === "gray255") {
        var y = clamp(Math.round((next[2] || 0) * 255), 0, 255);
        rgb = [y, y, y];
        hsv = [0, 0, y / 255];
        return;
      }
      hsv = [
        ((next[0] % 360) + 360) % 360,
        clamp(next[1], 0, 1),
        clamp(next[2], 0, 1),
      ];
      var raw = hsvRgb(hsv[0], hsv[1], hsv[2]);
      setRgb(raw);
    }
    function draw() {
      var ctx = map.getContext("2d");
      var img = ctx.createImageData(map.width, map.height);
      var i = 0;
      for (var y = 0; y < map.height; y++) {
        for (var x = 0; x < map.width; x++) {
          var c =
            contract === "gray255"
              ? [
                  Math.round((1 - y / (map.height - 1)) * 255),
                  Math.round((1 - y / (map.height - 1)) * 255),
                  Math.round((1 - y / (map.height - 1)) * 255),
                ]
              : hsvRgb(hsv[0], x / (map.width - 1), 1 - y / (map.height - 1));
          img.data[i] = c[0];
          img.data[i + 1] = c[1];
          img.data[i + 2] = c[2];
          img.data[i + 3] = 255;
          i += 4;
        }
      }
      ctx.putImageData(img, 0, 0);
      var vctx = val.getContext("2d");
      for (var yy = 0; yy < val.height; yy++) {
        var vc =
          contract === "gray255"
            ? [
                Math.round((1 - yy / (val.height - 1)) * 255),
                Math.round((1 - yy / (val.height - 1)) * 255),
                Math.round((1 - yy / (val.height - 1)) * 255),
              ]
            : hsvRgb(hsv[0], hsv[1], 1 - yy / (val.height - 1));
        vctx.fillStyle = rgbHex(vc[0], vc[1], vc[2]);
        vctx.fillRect(0, yy, val.width, 1);
      }
      prev.style.background = rgbHex(rgb[0], rgb[1], rgb[2]);
      if (fields.h) fields.h.value = String(Math.round(hsv[0]));
      if (fields.s) fields.s.value = String(Math.round(hsv[1] * 255));
      if (fields.v) fields.v.value = String(Math.round(hsv[2] * 255));
      if (fields.r) fields.r.value = String(Math.round(rgb[0]));
      if (fields.g) fields.g.value = String(Math.round(rgb[1]));
      if (fields.b) fields.b.value = String(Math.round(rgb[2]));
      fields.hex.value = rgbHex(rgb[0], rgb[1], rgb[2]);
    }
    function hitMap(ev, canvas, fn) {
      var r = canvas.getBoundingClientRect();
      fn(
        clamp((ev.clientX - r.left) / r.width, 0, 1),
        clamp((ev.clientY - r.top) / r.height, 0, 1),
      );
      draw();
    }
    map.onmousedown = function (ev) {
      function move(e) {
        hitMap(e, map, function (x, y) {
          if (contract === "gray255") setHsv([0, 0, 1 - y]);
          else setHsv([hsv[0], x, 1 - y]);
        });
      }
      move(ev);
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", function up() {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      });
    };
    val.onmousedown = function (ev) {
      function move(e) {
        hitMap(e, val, function (_x, y) {
          setHsv([hsv[0], hsv[1], 1 - y]);
        });
      }
      move(ev);
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", function up() {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      });
    };
    if (fields.h)
      fields.h.oninput = function () {
        setHsv([Number(fields.h.value) || 0, hsv[1], hsv[2]]);
        draw();
      };
    if (fields.s)
      fields.s.oninput = function () {
        setHsv([hsv[0], (Number(fields.s.value) || 0) / 255, hsv[2]]);
        draw();
      };
    if (fields.v)
      fields.v.oninput = function () {
        setHsv([hsv[0], hsv[1], (Number(fields.v.value) || 0) / 255]);
        draw();
      };
    if (fields.r)
      fields.r.oninput = function () {
        setRgb([
          Number(fields.r.value) || 0,
          contract === "gray255" ? Number(fields.r.value) || 0 : rgb[1],
          contract === "gray255" ? Number(fields.r.value) || 0 : rgb[2],
        ]);
        draw();
      };
    if (fields.g)
      fields.g.oninput = fields.b.oninput = function () {
        setRgb([
          Number(fields.r.value) || 0,
          Number(fields.g.value) || 0,
          Number(fields.b.value) || 0,
        ]);
        draw();
      };
    fields.hex.onchange = function () {
      setFromHex(fields.hex.value);
      draw();
    };
    function pickScreen() {
      if (global.EyeDropper) {
        try {
          var dropper = new global.EyeDropper();
          dropper
            .open()
            .then(function (result) {
              if (!result || !result.sRGBHex) return;
              setFromHex(result.sRGBHex);
              draw();
            })
            .catch(function () {});
          return;
        } catch (eyeErr) {}
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        overlay.setAttribute("data-tip", "当前浏览器不支持屏幕取色");
        return;
      }
      navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: false,
        })
        .then(function (stream) {
          var video = document.createElement("video");
          video.muted = true;
          video.playsInline = true;
          video.srcObject = stream;
          video.onloadedmetadata = function () {
            Promise.resolve(video.play())
              .then(function () {
                var c = document.createElement("canvas");
                c.width = 1;
                c.height = 1;
                var oldCursor = overlay.style.cursor;
                var oldBg = overlay.style.background;
                var oldVis = box.style.visibility;
                overlay.style.cursor = "crosshair";
                overlay.style.background = "transparent";
                box.style.visibility = "hidden";
                function stop() {
                  stream.getTracks().forEach(function (t) {
                    t.stop();
                  });
                  overlay.style.cursor = oldCursor;
                  overlay.style.background = oldBg;
                  box.style.visibility = oldVis;
                }
                function once(e) {
                  overlay.removeEventListener("click", once, true);
                  try {
                    var sw = Math.max(
                      1,
                      Number(global.screen && global.screen.width) ||
                        global.innerWidth ||
                        1,
                    );
                    var sh = Math.max(
                      1,
                      Number(global.screen && global.screen.height) ||
                        global.innerHeight ||
                        1,
                    );
                    var sl =
                      Number(global.screen && global.screen.availLeft) || 0;
                    var st =
                      Number(global.screen && global.screen.availTop) || 0;
                    var bx = Math.max(
                      0,
                      ((global.outerWidth || global.innerWidth) -
                        global.innerWidth) /
                        2,
                    );
                    var by = Math.max(
                      0,
                      (global.outerHeight || global.innerHeight) -
                        global.innerHeight -
                        bx,
                    );
                    var cssX = (global.screenX || 0) - sl + bx + e.clientX;
                    var cssY = (global.screenY || 0) - st + by + e.clientY;
                    var sx = Math.max(
                      0,
                      Math.min(
                        video.videoWidth - 1,
                        Math.floor((cssX * video.videoWidth) / sw),
                      ),
                    );
                    var sy = Math.max(
                      0,
                      Math.min(
                        video.videoHeight - 1,
                        Math.floor((cssY * video.videoHeight) / sh),
                      ),
                    );
                    c.getContext("2d").drawImage(
                      video,
                      sx,
                      sy,
                      1,
                      1,
                      0,
                      0,
                      1,
                      1,
                    );
                    var px = c.getContext("2d").getImageData(0, 0, 1, 1).data;
                    setRgb([px[0], px[1], px[2]]);
                    draw();
                  } catch (err) {}
                  stop();
                }
                overlay.addEventListener("click", once, true);
              })
              .catch(function () {
                stream.getTracks().forEach(function (t) {
                  t.stop();
                });
              });
          };
        })
        .catch(function () {});
    }
    draw();
  }
  function closePicker() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }
  function bindInput(input, contract) {
    if (!input || input.getAttribute("data-zh-bound")) return;
    input.setAttribute("data-zh-bound", "1");
    input.setAttribute("title", "选择颜色");
    input.setAttribute("aria-label", "选择颜色");
    function hijack(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
      openPicker(
        input.value || "#ffffff",
        function (hex) {
          input.value = hex;
          input.dispatchEvent(
            new Event("input", {
              bubbles: true,
            }),
          );
          input.dispatchEvent(
            new Event("change", {
              bubbles: true,
            }),
          );
        },
        {
          contract: contract || "hex",
        },
      );
    }
    input.addEventListener("click", hijack, true);
    input.addEventListener("mousedown", hijack, true);
    if (typeof input.showPicker === "function") {
      input.showPicker = function () {
        hijack({
          preventDefault: function () {},
          stopImmediatePropagation: function () {},
        });
      };
    }
  }
  function scan(root) {
    (root || document)
      .querySelectorAll('input[type="color"]')
      .forEach(function (inp) {
        bindInput(inp, inp.getAttribute("data-contract") || "hex");
      });
  }
  var mo = new MutationObserver(function () {
    scan(document);
  });
  function start() {
    scan(document);
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start);
  else start();
  global.RenderDragonColorPicker = {
    open: openPicker,
    close: closePicker,
    bind: bindInput,
    scan: scan,
    boards: mountBoards,
  };
})(window);
