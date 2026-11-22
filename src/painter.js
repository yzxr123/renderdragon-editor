/* RenderDragon 材质画板 · 绘制工具基于 JS Paint MIT 许可组件 */
(function (global) {
  "use strict";

  var LAYERS = [
    {
      id: "color",
      zh: "原色",
      color: true,
    },
    {
      id: "normal",
      zh: "法线",
      color: true,
      normal: true,
    },
    {
      id: "metal",
      zh: "金属度",
      color: false,
    },
    {
      id: "emissive",
      zh: "自发光",
      color: false,
    },
    {
      id: "roughness",
      zh: "粗糙度",
      color: false,
    },
    {
      id: "sub",
      zh: "次表面散射",
      color: false,
    },
    {
      id: "height",
      zh: "辅助高度",
      color: false,
    },
  ];
  var HISTORY_MAX = 50;
  var ZOOM_MIN = 0.0078125;
  var ZOOM_MAX = 128;
  var PAN_STEP = 40;
  var TOOL_GROUPS = [
    {
      id: "select",
      zh: "选区",
    },
    {
      id: "draw",
      zh: "画笔",
    },
    {
      id: "fill",
      zh: "填充",
    },
    {
      id: "shape",
      zh: "形状",
    },
    {
      id: "extra",
      zh: "特效",
    },
  ];
  var TOOLS = [
    {
      id: "select_free",
      zh: "自由选区",
      group: "select",
    },
    {
      id: "select",
      zh: "矩形选区",
      group: "select",
    },
    {
      id: "move_sel",
      zh: "移动选区",
      group: "select",
    },
    {
      id: "hand",
      zh: "平移画布",
      group: "select",
    },
    {
      id: "pencil",
      zh: "铅笔",
      group: "draw",
    },
    {
      id: "brush",
      zh: "画笔",
      group: "draw",
    },
    {
      id: "soft",
      zh: "柔边画笔",
      group: "draw",
    },
    {
      id: "airbrush",
      zh: "喷枪",
      group: "draw",
    },
    {
      id: "spray",
      zh: "喷涂",
      group: "draw",
    },
    {
      id: "eraser",
      zh: "橡皮",
      group: "draw",
    },
    {
      id: "fill",
      zh: "区域填充",
      group: "fill",
    },
    {
      id: "fill_all",
      zh: "替换同色",
      group: "fill",
    },
    {
      id: "flood",
      zh: "全通道填充",
      group: "fill",
    },
    {
      id: "line",
      zh: "直线",
      group: "shape",
    },
    {
      id: "curve",
      zh: "曲线",
      group: "shape",
    },
    {
      id: "rect",
      zh: "矩形",
      group: "shape",
    },
    {
      id: "ellipse",
      zh: "椭圆",
      group: "shape",
    },
    {
      id: "poly",
      zh: "多边形",
      group: "shape",
    },
    {
      id: "round",
      zh: "圆角矩形",
      group: "shape",
    },
    {
      id: "noise",
      zh: "噪点",
      group: "extra",
    },
    {
      id: "dither",
      zh: "抖动网纹",
      group: "extra",
    },
    {
      id: "checker",
      zh: "棋盘",
      group: "extra",
    },
    {
      id: "dodge",
      zh: "提亮",
      group: "extra",
    },
    {
      id: "burn",
      zh: "压暗",
      group: "extra",
    },
    {
      id: "smudge",
      zh: "涂抹",
      group: "extra",
    },
    {
      id: "replace",
      zh: "颜色替换",
      group: "extra",
    },
    {
      id: "gradient",
      zh: "渐变",
      group: "extra",
    },
    {
      id: "pick",
      zh: "取色",
      group: "extra",
    },
    {
      id: "zoom",
      zh: "缩放",
      group: "extra",
    },
    {
      id: "text",
      zh: "文字",
      group: "extra",
    },
    {
      id: "flip_h",
      zh: "水平翻转",
      group: "extra",
    },
    {
      id: "flip_v",
      zh: "垂直翻转",
      group: "extra",
    },
  ];
  var BRUSH_SHAPES = [
    {
      id: "circle",
      zh: "圆",
    },
    {
      id: "square",
      zh: "方",
    },
    {
      id: "slash",
      zh: "斜线",
    },
    {
      id: "backslash",
      zh: "反斜线",
    },
  ];
  function setPaintColor(hex) {
    if (paintState.layer === "normal") paintState.normalColor = hex;
    else paintState.color = hex;
    var c = host && host.querySelector("[data-color-input]");
    if (c) c.style.background = hex;
  }
  function setPaintGray(hexOrN) {
    var n =
      typeof hexOrN === "number"
        ? hexOrN
        : window.RenderDragonColorContract
          ? window.RenderDragonColorContract.snap("gray255", hexOrN).gray
          : 128;
    paintState.gray = n;
    if (paintState.layer === "metal") paintState.uniform.metal = n;
    if (paintState.layer === "emissive") paintState.uniform.emissive = n;
    if (paintState.layer === "roughness") paintState.uniform.roughness = n;
    if (paintState.layer === "sub") paintState.uniform.sub = n;
    if (paintState.layer === "height") paintState.uniform.height = n;
    var g = host && host.querySelector("[data-gray-range]");
    var gv = host && host.querySelector("[data-gray-num]");
    if (g) g.value = String(n);
    if (gv) gv.value = String(n);
  }
  function twoBoards(parent, contract, onHex, pickLabel) {
    var row = el("div", "color-tools");
    var pick = el("button", "pick-ok", pickLabel || "选择颜色");
    pick.type = "button";
    var ok = el("button", "pick-ok", "确定");
    ok.type = "button";
    function openPick() {
      var start =
        contract === "gray255"
          ? window.RenderDragonColorContract
            ? window.RenderDragonColorContract.rgbHex(
                paintState.gray,
                paintState.gray,
                paintState.gray,
              )
            : "#808080"
          : paintState.color || "#c8c8c8";
      if (window.RenderDragonColorPicker) {
        window.RenderDragonColorPicker.open(
          start,
          function (hex) {
            onHex(hex);
          },
          {
            contract: contract,
            title: (pickLabel || "这一条") + " · 调色板 · 选择颜色",
            tip: "确认后仅修改当前参数。",
          },
        );
      }
    }
    pick.onclick = openPick;
    ok.onclick = openPick;
    row.appendChild(pick);
    row.appendChild(ok);
    parent.appendChild(row);
  }
  var paintState = {
    layer: "color",
    tool: "pencil",
    size: 1,
    zoom: 16,
    color: "#c8c8c8",
    normalColor: "#8080ff",
    normalBrushKey: "平面",
    alpha: 255,
    gray: 128,
    shape: "circle",
    fillShape: false,
    lockColor: true,
    merMode: "none",
    bump: "none",
    sizePx: 16,
    sizeW: 16,
    sizeH: 16,
    stem: "iron_block",
    zh: "iron_block",
    kind: "block",
    refs: [],
    refRoot: "",
    fromRef: false,
    fromSkin: false,
    pigment: null,
    painted: {
      color: false,
      mer: false,
      height: false,
      normal: false,
    },
    textureTouchedMap: {},
    uniform: {
      metal: 0,
      emissive: 0,
      roughness: 255,
      sub: 0,
      height: 128,
    },
    undo: [],
    redo: [],
    origin: null,
    normalDirectionBase: null,
    normalDirectionBaseStem: "",
    items: [],
    library: [],
    examples: [],
    filter: "",
    kindFilter: "all",
    libName: "",
    packOpen: false,
    pipeline: "",
    colorEraser: false,
    symmetry: "none",
    pixelPerfect: true,
    panX: 0,
    panY: 0,
    curvePts: [],
    polyPts: [],
    fromVanilla: false,
    fromLibrary: false,
    rel: "",
    eyes: "",
    eyeColor: "#FFFFFF",
    eyePresets: {
      "Him 白色眼部": "#FFFFFF",
      红色眼部: "#FF2020",
      绿色眼部: "#40FF40",
      末影紫色: "#C040FF",
    },
    glowPresets: [],
    diyTarget: "texture",
    diyRandom: "none",
    diyKeep: true,
    diyHalo: false,
    diyEmissive: 220,
    diyMetal: 0,
    diyRough: 80,
    diyAlpha: 255,
    diySeconds: 4,
    diyHaloE: 90,
    diyHaloBlend: 0.15,
    nameAuto: true,
    savedTo: "",
    loaded: false,
    baseColor: "",
    adjust: {
      hue: 0,
      sat: 0,
      bri: 0,
      con: 0,
      tint: "#ffb070",
      tintAmt: 0,
    },
    adjustLiveBase: null,
    adjustLiveSnapshotTaken: false,
    adjustLiveRendering: false,
    skins: [],
    skinModel: "wide",
    skinLayer: "inner",
    skinPart: "all",
    skinFace: "front",
    skinGradA: "#d4a574",
    skinGradB: "#6b3f24",
    skinGradAxis: "v",
    skinDither: true,
    skinShowGuides: true,
    skinShowInner: true,
    skinShowOuter: true,
    skinPalette: [],
    workflowStage: "color",
    algorithmLive: true,
    liveChannels: {},
    exportFioUsePbrColor: false,
    algorithm: null,
    algorithmGlobal: null,
    algorithmPerTexture: {},
    algorithmSourceW: 0,
    algorithmSourceH: 0,
    algorithmProjectName: "PBR通配算法",
    textureVisibleLimit: 50,
    texturePageSize: 50,
    liveThumbs: {},
    liveThumbRevision: {},
    regenerating: false,
  };
  var layers = {};
  var loadedNormalData = null;
  var sourceFioBlue = null;
  var publishedRevision = 0;
  var previewCache = {};
  var syncingPreviews = false;
  var liveWorker = null,
    liveWorkerJob = null,
    liveWorkerSerial = 0,
    liveWorkerFailed = false;
  var manualEditRevision = 0;
  paintState.syncBusy = false;
  paintState.workerActive = false;
  var host = null;
  var textureHost = null;
  var inspectorTabState = "paint";
  var api = {};
  var view = null;
  var viewCtx = null;
  var viewScroller = null;
  var dragging = false;
  var last = null;
  var dragOrigin = null;
  var litView = null;
  var referenceView = null;
  var merView = null;
  var layerPreviewRail = null;
  var layerPreviewCards = {};
  var layerPreviewViews = {};
  var algorithmTimer = 0;
  var algorithmPendingKeys = {};
  var algorithmGesture = false;
  var algorithmColorSource = null;
  var generatingColor = false;
  var skin3d = null;
  var skinSheets = {
    inner: null,
    outer: null,
  };
  var SKIN_SIZES = [
    [64, 64],
    [128, 128],
    [64, 32],
    [128, 64],
  ];
  var SKIN_PARTS = [
    ["head", "inner"],
    ["body", "inner"],
    ["arm_r", "inner"],
    ["arm_l", "inner"],
    ["leg_r", "inner"],
    ["leg_l", "inner"],
    ["hat", "outer"],
    ["jacket", "outer"],
    ["sleeve_r", "outer"],
    ["sleeve_l", "outer"],
    ["pants_r", "outer"],
    ["pants_l", "outer"],
  ];
  var selection = null;
  var clipboard = null;
  var strokeBase = null;
  var strokePts = [];
  var moveSelShot = null;
  var spaceDown = false;
  var DRAG_PREVIEW = [
    "line",
    "rect",
    "ellipse",
    "round",
    "gradient",
    "select",
    "select_free",
  ];
  var STROKE_TOOLS = [
    "pencil",
    "brush",
    "soft",
    "eraser",
    "airbrush",
    "spray",
    "noise",
    "dither",
    "checker",
    "dodge",
    "burn",
    "smudge",
  ];
  var layerMutationHooksInstalled = false;
  var liveLayerMutationRevision = 0;
  function installLayerMutationHooks() {
    if (layerMutationHooksInstalled || !global.CanvasRenderingContext2D) return;
    layerMutationHooksInstalled = true;
    var proto = global.CanvasRenderingContext2D.prototype;
    [
      "putImageData",
      "drawImage",
      "fillRect",
      "clearRect",
      "strokeRect",
      "fill",
      "stroke",
    ].forEach(function (name) {
      var raw = proto[name];
      if (typeof raw !== "function" || raw.__rdPbrHook) return;
      var wrapped = function () {
        var out = raw.apply(this, arguments);
        if (
          this.canvas &&
          this.canvas.__rdPbrLayerTracked &&
          paintState.loaded
        ) {
          liveLayerMutationRevision = (liveLayerMutationRevision + 1) >>> 0;
          if (!paintState.regenerating) {
            manualEditRevision++;
            if (liveWorkerJob) stopLiveWorker(false);
            var layerId = this.canvas.__rdPbrLayerTracked;
            Object.keys(algorithmPendingKeys).forEach(function (k) {
              if (algorithmParameterTargets(k).indexOf(layerId) >= 0)
                delete algorithmPendingKeys[k];
            });
          }
          scheduleAllLivePreviewSync();
        }
        return out;
      };
      wrapped.__rdPbrHook = true;
      wrapped.__rdPbrRaw = raw;
      proto[name] = wrapped;
    });
  }
  function trackMaterialLayers() {
    [
      "color",
      "normal",
      "metal",
      "emissive",
      "roughness",
      "sub",
      "height",
    ].forEach(function (id) {
      if (layers[id]) layers[id].__rdPbrLayerTracked = id;
    });
  }
  function isSkin() {
    return paintState.kind === "skin" || paintState.fromSkin;
  }
  function colorOnlyMode() {
    return isSkin();
  }
  function skinUnit() {
    return Math.max(1, Math.round(texW() / 64));
  }
  function skinClassic() {
    return texH() * 2 === texW();
  }
  function skinAllowed(w, h) {
    return SKIN_SIZES.some(function (row) {
      return row[0] === w && row[1] === h;
    });
  }
  function skinPartLayer(part) {
    for (var i = 0; i < SKIN_PARTS.length; i++) {
      if (SKIN_PARTS[i][0] === part) return SKIN_PARTS[i][1];
    }
    return "inner";
  }
  // UV unwrap from skinview3d (MIT). Algorithms only; no Three.js.
  function skinBoxFaces(u0, v0, width, height, depth) {
    return [
      [u0 + depth, v0, width, depth],
      [u0 + width + depth, v0, width, depth],
      [u0, v0 + depth, depth, height],
      [u0 + depth, v0 + depth, width, height],
      [u0 + width + depth, v0 + depth, depth, height],
      [u0 + width + depth * 2, v0 + depth, width, height],
    ];
  }
  function skinUvFaces(part, model) {
    var slim = (model || paintState.skinModel) === "slim";
    var aw = slim ? 3 : 4;
    var boxes = {
      head: [0, 0, 8, 8, 8],
      hat: [32, 0, 8, 8, 8],
      body: [16, 16, 8, 12, 4],
      jacket: [16, 32, 8, 12, 4],
      arm_r: [40, 16, aw, 12, 4],
      sleeve_r: [40, 32, aw, 12, 4],
      arm_l: [32, 48, aw, 12, 4],
      sleeve_l: [48, 48, aw, 12, 4],
      leg_r: [0, 16, 4, 12, 4],
      pants_r: [0, 32, 4, 12, 4],
      leg_l: [16, 48, 4, 12, 4],
      pants_l: [0, 48, 4, 12, 4],
    };
    var spec = boxes[part];
    var layer = skinPartLayer(part);
    if (!spec) return [];
    if (
      skinClassic() &&
      (layer === "outer" || part === "arm_l" || part === "leg_l")
    )
      return [];
    var unit = skinUnit();
    return skinBoxFaces(spec[0], spec[1], spec[2], spec[3], spec[4]).map(
      function (b) {
        return [b[0] * unit, b[1] * unit, b[2] * unit, b[3] * unit];
      },
    );
  }
  function skinAreaData(ctx, x, y, w, h) {
    try {
      return ctx.getImageData(x, y, w, h).data;
    } catch (err) {
      return null;
    }
  }
  function skinAreaFlag(ctx, x, y, w, h, kind) {
    var data = skinAreaData(ctx, x, y, w, h);
    if (!data) return false;
    var i,
      hit = true;
    for (i = 0; i < data.length; i += 4) {
      if (kind === "alpha" && data[i + 3] !== 255) return true;
      if (
        kind === "black" &&
        !(
          data[i] === 0 &&
          data[i + 1] === 0 &&
          data[i + 2] === 0 &&
          data[i + 3] === 255
        )
      )
        hit = false;
      if (
        kind === "white" &&
        !(
          data[i] === 255 &&
          data[i + 1] === 255 &&
          data[i + 2] === 255 &&
          data[i + 3] === 255
        )
      )
        hit = false;
    }
    return kind === "alpha" ? false : hit;
  }
  function inferSlimFromColor() {
    if (!layers.color || skinClassic()) return false;
    var probe = layers.color
      .getContext("2d")
      .getImageData(0, 0, texW(), texH()).data;
    var opaque = 0;
    for (var pi = 3; pi < probe.length; pi += 4) {
      if (probe[pi] > 8) {
        opaque += 1;
        if (opaque > 4) break;
      }
    }
    if (opaque <= 4) return false;
    var s = skinUnit();
    var ctx = layers.color.getContext("2d");
    function spot(x, y, w, h, kind) {
      return skinAreaFlag(ctx, x * s, y * s, w * s, h * s, kind);
    }
    return (
      spot(50, 16, 2, 4, "alpha") ||
      spot(54, 20, 2, 12, "alpha") ||
      spot(42, 48, 2, 4, "alpha") ||
      spot(46, 52, 2, 12, "alpha") ||
      (spot(50, 16, 2, 4, "black") &&
        spot(54, 20, 2, 12, "black") &&
        spot(42, 48, 2, 4, "black") &&
        spot(46, 52, 2, 12, "black")) ||
      (spot(50, 16, 2, 4, "white") &&
        spot(54, 20, 2, 12, "white") &&
        spot(42, 48, 2, 4, "white") &&
        spot(46, 52, 2, 12, "white"))
    );
  }
  function selectedSkinParts() {
    return SKIN_PARTS.map(function (row) {
      return row[0];
    }).filter(function (id) {
      var layer = skinPartLayer(id);
      if (paintState.skinLayer === "inner" && layer !== "inner") return false;
      if (paintState.skinLayer === "outer" && layer !== "outer") return false;
      if (paintState.skinPart !== "all" && paintState.skinPart !== id)
        return false;
      if (
        skinClassic() &&
        (layer === "outer" || id === "arm_l" || id === "leg_l")
      )
        return false;
      return true;
    });
  }
  function skinMask() {
    var w = texW(),
      h = texH();
    var mask = new Uint8Array(w * h);
    selectedSkinParts().forEach(function (id) {
      skinUvFaces(id, paintState.skinModel).forEach(function (b) {
        var x1 = Math.min(w, b[0] + b[2]),
          y1 = Math.min(h, b[1] + b[3]);
        for (var y = Math.max(0, b[1]); y < y1; y++) {
          for (var x = Math.max(0, b[0]); x < x1; x++) mask[y * w + x] = 1;
        }
      });
    });
    return mask;
  }
  function blitSkinFace(ctx, part, faceIdx, dx, dy, dw, dh) {
    var layer = skinPartLayer(part);
    if (layer === "inner" && !paintState.skinShowInner) return;
    if (layer === "outer" && !paintState.skinShowOuter) return;
    var box = skinUvFaces(part, paintState.skinModel)[faceIdx];
    if (!box || !layers.color) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(layers.color, box[0], box[1], box[2], box[3], dx, dy, dw, dh);
  }
  function drawSkinPreview() {
    if (!skin3d) return;
    skin3d.style.display = isSkin() ? "" : "none";
    if (!isSkin() || !layers.color) return;
    var ctx = skin3d.getContext("2d");
    crispCtx(ctx);
    skin3d.width = 120;
    skin3d.height = 160;
    ctx.fillStyle = "#101218";
    ctx.fillRect(0, 0, 120, 160);
    var face =
      {
        front: 3,
        right: 2,
        left: 4,
        back: 5,
      }[paintState.skinFace] || 3;
    var aw = paintState.skinModel === "slim" ? 12 : 16;
    function limb(inner, outer, dx, dy, dw, dh) {
      blitSkinFace(ctx, inner, face, dx, dy, dw, dh);
      blitSkinFace(ctx, outer, face, dx, dy, dw, dh);
    }
    blitSkinFace(ctx, "head", face, 44, 12, 32, 32);
    blitSkinFace(ctx, "hat", face, 44, 12, 32, 32);
    blitSkinFace(ctx, "body", face, 44, 44, 32, 48);
    blitSkinFace(ctx, "jacket", face, 44, 44, 32, 48);
    limb("arm_r", "sleeve_r", 44 - aw, 44, aw, 48);
    if (skinClassic()) {
      ctx.save();
      ctx.translate(76 + aw, 44);
      ctx.scale(-1, 1);
      blitSkinFace(ctx, "arm_r", face, 0, 0, aw, 48);
      ctx.restore();
    } else {
      limb("arm_l", "sleeve_l", 76, 44, aw, 48);
    }
    limb("leg_r", "pants_r", 44, 92, 16, 48);
    if (skinClassic()) {
      ctx.save();
      ctx.translate(76, 92);
      ctx.scale(-1, 1);
      blitSkinFace(ctx, "leg_r", face, 0, 0, 16, 48);
      ctx.restore();
    } else {
      limb("leg_l", "pants_l", 60, 92, 16, 48);
    }
  }
  function persistSkinPalette() {
    try {
      if (window.localStorage)
        localStorage.setItem(
          "renderdragon_skin_palette",
          JSON.stringify((paintState.skinPalette || []).slice(0, 24)),
        );
    } catch (err2) {}
  }
  function refreshSkinPalette() {
    if (!host) return;
    var box = host.querySelector("[data-skin-palette]");
    if (!box) return;
    box.innerHTML = "";
    (paintState.skinPalette || []).forEach(function (hex, idx) {
      var btn = el("button", "scope", "");
      btn.type = "button";
      btn.style.background = hex;
      btn.style.minWidth = "22px";
      btn.title = hex;
      btn.onclick = function () {
        setPaintColor(hex);
      };
      btn.oncontextmenu = function (ev) {
        ev.preventDefault();
        paintState.skinPalette.splice(idx, 1);
        persistSkinPalette();
        refreshSkinPalette();
      };
      box.appendChild(btn);
    });
  }
  function collectSkinLayers() {
    ensureSkinSheets();
    compositeSkinSheets();
    return {
      color: layers.color.toDataURL("image/png"),
      inner: skinSheets.inner.toDataURL("image/png"),
      outer: skinSheets.outer.toDataURL("image/png"),
    };
  }
  function saveSkinLib() {
    if (!api.deskCall) return;
    var name = libName() || paintState.libName || paintState.stem || "";
    if (!name) {
      toast("请输入英文文件名，且不要使用 steve 或 alex");
      return;
    }
    paintState.libName = name;
    withPaintProgress("保存到皮肤库", function (progress) {
      progress(18, "正在收集皮肤图层");
      return api
        .deskCall("material_skin_save", {
          lib_name: name,
          model: paintState.skinModel,
          palette: paintState.skinPalette,
          layers: collectSkinLayers(),
        })
        .then(function (doc) {
          progress(92, "正在刷新列表");
          toast((doc && doc.reason) || "保存失败");
          if (doc && doc.items) paintState.skins = doc.items;
          if (doc && doc.ok) {
            paintState.fromSkin = true;
            paintState.kindFilter = "skin";
            markSaved("lib");
          }
          fillList();
        });
    });
  }
  function targetsCodec() {
    return parent.RenderDragonTargets || global.RenderDragonTargets;
  }
  function selectedTarget() {
    return parent.RenderDragonWorkspace
      ? parent.RenderDragonWorkspace.target
      : paintState.pipeline || "renderdragon";
  }
  function chooseTarget(value) {
    parent.RenderDragonWorkspace.setTarget(value);
    paintState.pipeline = selectedTarget();
    previewCache = {};
    paintChrome();
    scheduleAllLivePreviewSync();
  }
  function syncFromApi() {
    if (api && api.packOpen != null) paintState.packOpen = !!api.packOpen;
    paintState.pipeline = selectedTarget();
  }
  function texW() {
    return paintState.sizeW || paintState.sizePx || 16;
  }
  function texH() {
    return paintState.sizeH || paintState.sizePx || 16;
  }
  function viewCssW() {
    return texW() * Number(paintState.zoom || 1);
  }
  function viewCssH() {
    return texH() * Number(paintState.zoom || 1);
  }
  function zoomLabel(z) {
    z = Number(z) || 1;
    if (z >= 10) return String(Math.round(z * 10) / 10);
    if (z >= 1) return String(Math.round(z * 100) / 100);
    return String(Math.round(z * 100000) / 100000);
  }
  function crispCtx(ctx) {
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
  }
  function applyPan() {
    if (!view) return;
    paintState.panX = paintState.panX | 0;
    paintState.panY = paintState.panY | 0;
    view.style.transform =
      "translate3d(" + paintState.panX + "px," + paintState.panY + "px,0)";
  }
  function setZoom(n) {
    n = Number(n);
    if (!isFinite(n) || n <= 0) n = 1;
    n = clamp(n, ZOOM_MIN, ZOOM_MAX);
    paintState.zoom = n;
    sizeView();
    redraw();
    refreshBrushProps();
    paintViewButtons();
  }
  function zoomBy(dir) {
    var z = Number(paintState.zoom) || 1;
    var factor = 1.25;
    setZoom(z * (dir > 0 ? factor : 1 / factor));
  }
  function centerViewInFixedWorkbench() {
    if (!view || !viewScroller) return;
    var boxW = Math.max(1, viewScroller.clientWidth || 620);
    var boxH = Math.max(1, viewScroller.clientHeight || 620);
    var cssW = Math.max(1, viewCssW());
    var cssH = Math.max(1, viewCssH());
    var mx = Math.max(0, Math.floor((boxW - cssW) / 2));
    var my = Math.max(0, Math.floor((boxH - cssH) / 2));
    view.style.marginLeft = mx + "px";
    view.style.marginRight = mx + "px";
    view.style.marginTop = my + "px";
    view.style.marginBottom = my + "px";
  }
  function fitView() {
    var box =
      viewScroller ||
      (global.document && global.document.getElementById("paintDock")) ||
      (view && view.parentNode);
    var aw = box && box.clientWidth ? Math.max(8, box.clientWidth - 28) : 592;
    var ah = box && box.clientHeight ? Math.max(8, box.clientHeight - 28) : 592;
    var zx = aw / Math.max(1, texW());
    var zy = ah / Math.max(1, texH());
    setZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.min(zx, zy) || 1)));
    paintState.panX = 0;
    paintState.panY = 0;
    applyPan();
    centerViewInFixedWorkbench();
    if (viewScroller) {
      viewScroller.scrollLeft = 0;
      viewScroller.scrollTop = 0;
    }
  }
  function nudgePan(dx, dy) {
    paintState.panX = (paintState.panX | 0) + dx;
    paintState.panY = (paintState.panY | 0) + dy;
    applyPan();
  }
  function recenterView() {
    paintState.panX = 0;
    paintState.panY = 0;
    applyPan();
    paintViewButtons();
  }
  function paintViewButtons() {
    var nodes =
      global.document && global.document.querySelectorAll
        ? global.document.querySelectorAll("[data-zoom-readout]")
        : [];
    nodes.forEach(function (btn) {
      btn.textContent = "缩放 " + zoomLabel(paintState.zoom) + "x";
    });
  }
  function mirrorPoints(x, y) {
    var pts = [[x, y]];
    var w = texW() - 1,
      h = texH() - 1;
    if (paintState.symmetry === "h" || paintState.symmetry === "both")
      pts.push([w - x, y]);
    if (paintState.symmetry === "v" || paintState.symmetry === "both")
      pts.push([x, h - y]);
    if (paintState.symmetry === "both") pts.push([w - x, h - y]);
    var seen = {},
      out = [];
    pts.forEach(function (p) {
      var k = p[0] + "," + p[1];
      if (seen[k]) return;
      seen[k] = 1;
      out.push(p);
    });
    return out;
  }
  function putSym(ctx, x, y, rgba) {
    mirrorPoints(x, y).forEach(function (p) {
      put(ctx, p[0], p[1], rgba);
    });
  }
  function filterPixelPerfect(pts) {
    // Piskel-style elbow filter：去掉直角拐角中间点，铅笔更干净
    if (!paintState.pixelPerfect || !pts || pts.length < 3) return pts || [];
    var out = [pts[0]];
    for (var i = 1; i < pts.length - 1; i++) {
      var a = out[out.length - 1],
        b = pts[i],
        c = pts[i + 1];
      var abx = b.x - a.x,
        aby = b.y - a.y,
        bcx = c.x - b.x,
        bcy = c.y - b.y;
      var elbow =
        (abx !== 0 && aby === 0 && bcx === 0 && bcy !== 0) ||
        (abx === 0 && aby !== 0 && bcx !== 0 && bcy === 0);
      if (elbow) continue;
      out.push(b);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function redrawStrokeFromBase(ctx, rgba) {
    if (!strokeBase) return;
    ctx.putImageData(strokeBase, 0, 0);
    var pts = filterPixelPerfect(strokePts);
    for (var i = 0; i < pts.length; i++) {
      if (paintState.tool === "pencil") putSym(ctx, pts[i].x, pts[i].y, rgba);
      else if (paintState.tool === "eraser") {
        mirrorPoints(pts[i].x, pts[i].y).forEach(function (p) {
          eraseAt(ctx, p[0], p[1]);
        });
      } else if (i > 0) {
        bresenham(
          pts[i - 1].x,
          pts[i - 1].y,
          pts[i].x,
          pts[i].y,
          function (x, y) {
            if (paintState.tool === "brush") stampBrush(ctx, x, y, rgba);
            else if (paintState.tool === "soft") softStamp(ctx, x, y, rgba);
            else putSym(ctx, x, y, rgba);
          },
        );
      }
    }
  }
  function flipLayer(horizontal) {
    snapshot();
    var ctx = activeCtx();
    var w = texW(),
      h = texH();
    var src = ctx.getImageData(0, 0, w, h);
    var dest = ctx.createImageData(w, h);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var sx = horizontal ? w - 1 - x : x;
        var sy = horizontal ? y : h - 1 - y;
        var si = (sy * w + sx) * 4,
          di = (y * w + x) * 4;
        dest.data[di] = src.data[si];
        dest.data[di + 1] = src.data[si + 1];
        dest.data[di + 2] = src.data[si + 2];
        dest.data[di + 3] = src.data[si + 3];
      }
    }
    ctx.putImageData(dest, 0, 0);
    markPainted();
    redraw();
    toast(horizontal ? "已水平翻转本层" : "已竖直翻转本层");
  }
  function rotateActive(clockwise) {
    var w = texW(),
      h = texH();
    if (w !== h) {
      toast(
        "当前纹理不是正方形，旋转 90° 会改变宽高关系。请优先使用水平或垂直翻转。",
      );
      return;
    }
    snapshot();
    var ctx = activeCtx();
    var src = ctx.getImageData(0, 0, w, h);
    var dest = ctx.createImageData(w, h);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var nx = clockwise ? h - 1 - y : y;
        var ny = clockwise ? x : w - 1 - x;
        var si = (y * w + x) * 4;
        var di = (ny * w + nx) * 4;
        dest.data[di] = src.data[si];
        dest.data[di + 1] = src.data[si + 1];
        dest.data[di + 2] = src.data[si + 2];
        dest.data[di + 3] = src.data[si + 3];
      }
    }
    ctx.putImageData(dest, 0, 0);
    markPainted();
    redraw();
    toast(clockwise ? "已顺时针旋转 90°" : "已逆时针旋转 90°");
  }
  function invertActive() {
    snapshot();
    var ctx = activeCtx();
    var img = ctx.getImageData(0, 0, texW(), texH());
    for (var i = 0; i < img.data.length; i += 4) {
      img.data[i] = 255 - img.data[i];
      img.data[i + 1] = 255 - img.data[i + 1];
      img.data[i + 2] = 255 - img.data[i + 2];
    }
    ctx.putImageData(img, 0, 0);
    markPainted();
    redraw();
    toast("已反相当前通道");
  }
  function selectAll() {
    selection = {
      x: 0,
      y: 0,
      w: texW(),
      h: texH(),
    };
    redraw();
    toast("已全选");
  }
  function deselect() {
    selection = null;
    redraw();
    toast("已取消选区");
  }
  function cropKeepSelection() {
    if (!selection || selection.w < 1 || selection.h < 1) {
      toast("请先建立选区再执行裁剪");
      return;
    }
    snapshot();
    var ctx = activeCtx();
    var clip = ctx.getImageData(
      selection.x,
      selection.y,
      selection.w,
      selection.h,
    );
    if (paintState.layer === "color") ctx.clearRect(0, 0, texW(), texH());
    else {
      var g =
        paintState.layer === "roughness"
          ? 255
          : paintState.layer === "height"
            ? 128
            : 0;
      ctx.fillStyle = "rgb(" + g + "," + g + "," + g + ")";
      ctx.fillRect(0, 0, texW(), texH());
    }
    ctx.putImageData(clip, selection.x, selection.y);
    markPainted();
    redraw();
    toast("已裁剪到选区，纹理尺寸保持不变");
  }
  function clearLayer() {
    snapshot();
    var ctx = activeCtx();
    if (paintState.layer === "color") ctx.clearRect(0, 0, texW(), texH());
    else {
      var g =
        paintState.layer === "roughness"
          ? 255
          : paintState.layer === "height"
            ? 128
            : 0;
      ctx.fillStyle = "rgb(" + g + "," + g + "," + g + ")";
      ctx.fillRect(0, 0, texW(), texH());
    }
    markPainted();
    redraw();
    toast("已清空当前通道");
  }
  function stretchInPlace(scale) {
    snapshot();
    var w = texW(),
      h = texH();
    var src = document.createElement("canvas");
    src.width = w;
    src.height = h;
    var sctx = src.getContext("2d");
    crispCtx(sctx);
    sctx.drawImage(activeCanvas(), 0, 0);
    var ctx = activeCtx();
    crispCtx(ctx);
    if (paintState.layer === "color") ctx.clearRect(0, 0, w, h);
    else {
      var g =
        paintState.layer === "roughness"
          ? 255
          : paintState.layer === "height"
            ? 128
            : 0;
      ctx.fillStyle = "rgb(" + g + "," + g + "," + g + ")";
      ctx.fillRect(0, 0, w, h);
    }
    var nw = Math.max(1, Math.round(w * scale));
    var nh = Math.max(1, Math.round(h * scale));
    var x = ((w - nw) / 2) | 0;
    var y = ((h - nh) / 2) | 0;
    ctx.drawImage(src, 0, 0, w, h, x, y, nw, nh);
    markPainted();
    redraw();
    toast(scale > 1 ? "纹理尺寸已放大至 2 倍" : "纹理尺寸已缩小至 0.5 倍");
  }
  function outlineLayer() {
    snapshot();
    var ctx = activeCtx();
    var w = texW(),
      h = texH();
    var src = ctx.getImageData(0, 0, w, h);
    var dest = ctx.createImageData(w, h);
    dest.data.set(src.data);
    var rgb = paintColor();
    function alphaAt(x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return 0;
      return src.data[(y * w + x) * 4 + 3];
    }
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (alphaAt(x, y) > 16) continue;
        if (
          alphaAt(x - 1, y) > 16 ||
          alphaAt(x + 1, y) > 16 ||
          alphaAt(x, y - 1) > 16 ||
          alphaAt(x, y + 1) > 16
        ) {
          var i = (y * w + x) * 4;
          dest.data[i] = rgb[0];
          dest.data[i + 1] = rgb[1];
          dest.data[i + 2] = rgb[2];
          dest.data[i + 3] = 255;
        }
      }
    }
    ctx.putImageData(dest, 0, 0);
    markPainted();
    redraw();
    toast("已应用像素描边");
  }
  function importPng() {
    var inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
    inp.onchange = function () {
      var file = inp.files && inp.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          if (isSkin() || paintState.kindFilter === "skin") {
            if (!skinAllowed(img.width, img.height)) {
              toast("皮肤 PNG 必须是 64×64、128×128、64×32 或 128×64");
              return;
            }
            confirmLeave(function () {
              if (!api.deskCall) return;
              api
                .deskCall("material_skin_import", {
                  png: img.src,
                  model: paintState.skinModel,
                  name: (file.name || "").replace(/\.[^.]+$/, ""),
                })
                .then(function (doc) {
                  if (!doc || !doc.ok) {
                    toast((doc && doc.reason) || "导入失败");
                    return;
                  }
                  paintState.kindFilter = "skin";
                  afterLoad(doc, false);
                });
            });
            return;
          }
          snapshot();
          var ctx = activeCtx();
          ctx.imageSmoothingEnabled = false;
          if (paintState.layer === "color") ctx.clearRect(0, 0, texW(), texH());
          ctx.drawImage(img, 0, 0, texW(), texH());
          markPainted();
          redraw();
          toast("已将 PNG 导入当前通道");
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  }
  function exportPng() {
    withPaintProgress("导出 PNG", function (progress) {
      progress(18, "正在读取当前通道");
      var a = document.createElement("a");
      a.href = activeCanvas().toDataURL("image/png");
      progress(72, "正在生成 PNG 文件");
      a.download = (
        isSkin()
          ? (paintState.libName || paintState.stem || "skin") + ".png"
          : (paintState.libName || paintState.zh || paintState.stem || "材质") +
            "_" +
            paintState.layer +
            ".png"
      ).replace(/[\/:*?"<>|]/g, "_");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      progress(100, "导出完成");
      toast("已导出本层 PNG（PNG 导出）");
      return Promise.resolve();
    });
  }
  function exportPbrCompositeAsColor() {
    if (isSkin()) {
      toast("最终 PBR 合成原色仅用于普通材质/PBR纹理");
      return;
    }
    if (
      !layers.color ||
      !layers.normal ||
      !layers.roughness ||
      !layers.metal ||
      !layers.emissive
    ) {
      toast("当前纹理 PBR 图层不完整");
      return;
    }
    withPaintProgress("导出 PBR 合成原色", function (progress) {
      progress(12, "正在读取原色与 PBR 通道");
      var fullSize = Math.max(1, texW(), texH());
      var frame = pbrPreviewFrame(fullSize);
      if (!frame) {
        toast("最终 PBR 合成失败");
        return Promise.resolve();
      }
      progress(55, "正在按最终 PBR 效果烘焙原色");
      var out = document.createElement("canvas");
      out.width = frame.width;
      out.height = frame.height;
      out
        .getContext("2d", {
          willReadFrequently: true,
        })
        .putImageData(frameImageData(frame), 0, 0);
      progress(82, "正在生成完整分辨率 PNG");
      var a = document.createElement("a");
      a.href = out.toDataURL("image/png");
      a.download = (
        (paintState.libName || paintState.zh || paintState.stem || "材质") +
        "_PBR合成_原色.png"
      ).replace(/[\/:*?"<>|]/g, "_");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      progress(100, "导出完成");
      toast("已将最终 PBR 合成效果作为原色层 PNG 导出 · 保留透明通道");
      return Promise.resolve();
    });
  }
  function mersCodec() {
    return (parent && parent.RenderDragonMERS) || window.RenderDragonMERS;
  }
  function mersFrame(maxSize) {
    var src = {},
      size = maxSize || Math.max(texW(), texH());
    ["metal", "emissive", "roughness", "sub"].forEach(function (id) {
      src[id] = canvasPreviewFrame(layers[id], size);
    });
    return mersCodec().pack(src, src.metal.width, src.metal.height);
  }
  function setMaterialWorkflow(enabled) {
    if (paintState.loading)
      return onTextureReady(function () {
        setMaterialWorkflow(enabled);
      });
    if (isSkin() || !paintState.loaded) return;
    var mode = enabled ? "mers" : "none";
    if (paintState.merMode === mode && (enabled || paintState.bump === "none"))
      return;
    snapshot();
    paintState.merMode = mode;
    if (enabled) {
      paintState.algorithmLive = true;
    } else {
      clearLiveAlgorithm();
      paintState.liveChannels = {};
      paintState.bump = "none";
      paintState.layer = "color";
      paintState.workflowStage = "color";
    }
    paintChrome();
    redraw();
    toast(
      enabled
        ? "已启用 PBR  按所选目标实时编辑和导出"
        : "已切换普通纹理  不导出 PBR 通道  基色修改保留",
    );
  }
  async function encodeCurrentMERS() {
    if (paintState.loading) await onTextureReady(function () {});
    await flushLiveAlgorithm();
    if (paintState.merMode === "none" || isSkin())
      throw new Error("当前是普通纹理工作流  制作或启用 PBR 后才可导出 MERS");
    var codec = (parent && parent.RenderDragonPNG) || window.RenderDragonPNG;
    // 直接编码 RGBA 原始字节  不经过 Canvas 的透明度预乘
    return codec.encode(mersFrame());
  }
  function outputFrames(maxSize, forOP) {
    var src = {};
    var size = maxSize || Math.max(texW(), texH());
    [
      "color",
      "normal",
      "metal",
      "emissive",
      "roughness",
      "sub",
      "height",
    ].forEach(function (id) {
      src[id] = canvasPreviewFrame(layers[id], size);
    });
    if (paintState.bump === "none") {
      for (var i = 0; i < src.normal.data.length; i += 4)
        src.normal.data.set([128, 128, 255, 255], i);
    } else if (
      loadedNormalData &&
      layers.normal.width === loadedNormalData.width &&
      layers.normal.height === loadedNormalData.height
    ) {
      var pixels = layers.normal
        .getContext("2d")
        .getImageData(0, 0, texW(), texH()).data;
      if (
        pixels.every(function (v, i) {
          return v === loadedNormalData.display[i];
        }) &&
        loadedNormalData.raw
      ) {
        src.normal = loadedNormalData.raw;
      }
    }
    if (sourceFioBlue) src.fioBlue = sourceFioBlue;
    if (forOP && paintState.exportFioUsePbrColor)
      src.color = pbrPreviewFrame(size, true);
    return src;
  }
  function getCombinedFrame(display, maxSize, target) {
    target = target || selectedTarget();
    var size = maxSize
      ? target === "opengl"
        ? Math.max(2, Math.floor(maxSize / 2))
        : maxSize
      : 0;
    var src = outputFrames(size, target === "opengl");
    var raw = targetsCodec().pack(
      target,
      src,
      src.color.width,
      src.color.height,
    );
    return display ? targetsCodec().preview(target, raw) : raw;
  }
  function nativeGroupPreview(maxSize) {
    var tile = Math.max(24, Math.floor((maxSize || 512) / 3)),
      gap = 4,
      head = 20;
    var src = outputFrames(tile, false),
      items = [
        {
          label: "基色",
          frame: src.color,
        },
      ];
    if (paintState.bump === "normal")
      items.push({
        label: "法线",
        frame: src.normal,
      });
    else if (paintState.bump === "heightmap")
      items.push({
        label: "高度",
        frame: src.height,
      });
    if (paintState.merMode !== "none")
      items.push({
        label: "材质参数 MERS",
        frame: mersCodec().opaquePreview(
          mersCodec().pack(src, src.color.width, src.color.height),
        ),
      });
    var out = document.createElement("canvas");
    out.width = items.length * (tile + gap) - gap;
    out.height = tile + head;
    var ctx = out.getContext("2d");
    ctx.fillStyle = "#20252c";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    items.forEach(function (item, i) {
      var c = document.createElement("canvas");
      c.width = item.frame.width;
      c.height = item.frame.height;
      c.getContext("2d").putImageData(frameImageData(item.frame), 0, 0);
      var x = i * (tile + gap);
      ctx.fillStyle = "#eeeeee";
      ctx.fillText(item.label, x + tile / 2, 14, tile);
      ctx.imageSmoothingEnabled = false;
      var ratio = Math.min(tile / c.width, tile / c.height);
      ctx.drawImage(
        c,
        x + (tile - c.width * ratio) / 2,
        head,
        c.width * ratio,
        c.height * ratio,
      );
    });
    return out;
  }
  function fourInOneCanvas(maxSize) {
    if (selectedTarget() === "renderdragon") return nativeGroupPreview(maxSize);
    var f = getCombinedFrame(true, maxSize),
      out = document.createElement("canvas");
    out.width = f.width;
    out.height = f.height;
    out.getContext("2d").putImageData(frameImageData(f), 0, 0);
    return out;
  }
  function setFourInOneColorSourceToggle(on) {
    if (paintState.exportFioUsePbrColor === !!on) return;
    snapshot();
    paintState.exportFioUsePbrColor = !!on;
    if (on) paintState.merMode = "mers";
    paintChrome();
    redraw();
  }
  async function encodeCurrentFIO() {
    if (paintState.loading) await onTextureReady(function () {});
    await flushLiveAlgorithm();
    if (!paintState.loaded || isSkin())
      throw new Error("请先载入普通纹理或 PBR 材质");
    if (texW() !== texH() || paintState.bump === "heightmap")
      throw new Error(
        "OP 参考协议需要正方形法线四分区  请将凹凸输出改为法线  矩形和动画请使用渲染龙目标",
      );
    return parent.RenderDragonPNG.encode(getCombinedFrame(false, 0, "opengl"));
  }
  async function encodeSelected() {
    if (paintState.loading) await onTextureReady(function () {});
    await flushLiveAlgorithm();
    if (!paintState.loaded || isSkin())
      throw new Error("请先载入普通纹理或 PBR 材质");
    return selectedTarget() === "opengl"
      ? encodeCurrentFIO()
      : encodeCurrentMERS();
  }
  function exportNativeMaterialFiles(previewOnly) {
    if (isSkin())
      return Promise.resolve({
        ok: false,
        reason: "皮肤使用独立 PNG 导出",
      });
    return withPaintProgress(
      previewOnly ? "检查当前材质文件组" : "导出渲染龙材质文件组",
      async function (progress) {
        if (paintState.loading) await onTextureReady(function () {});
        await flushLiveAlgorithm();
        if (
          !paintState.loaded ||
          (!paintState.packOpen &&
            !paintState.fromLibrary &&
            !paintState.fromRef)
        )
          throw new Error("请先载入当前工作区的纹理或材质库条目");
        var rel = paintState.rel,
          token = textureLoadSerial,
          name =
            paintState.libName || paintState.zh || paintState.stem || "材质";
        progress(15, "同步当前材质的最新绘制与参数");
        var detached = !!(paintState.fromRef || paintState.fromLibrary),
          snapshotData = detached ? paintPayload() : null;
        if (!detached) {
          var saved = await flushPending();
          if (!saved || !saved.ok)
            throw new Error((saved && saved.reason) || "暂存失败");
        }
        if (token !== textureLoadSerial || rel !== paintState.rel)
          throw new Error("当前纹理已切换  已取消本次导出");
        progress(45, "整理当前材质的注册文件和必要图片");
        var result = await api.deskCall("material_export_current", {
          rel: rel,
          name: name,
          download: !previewOnly,
          snapshot: snapshotData,
        });
        if (!result || !result.ok)
          throw new Error((result && result.reason) || "材质文件组导出失败");
        progress(
          100,
          "当前材质共 " +
            result.count +
            " 个文件  " +
            (result.bytes / 1024).toFixed(1) +
            " KiB",
        );
        if (previewOnly && parent.RenderDragonApp.showFilePlan)
          parent.RenderDragonApp.showFilePlan(result, "当前材质文件组");
        else toast(result.reason);
        return result;
      },
    ).catch(function (error) {
      toast("材质文件组处理失败  " + (error.message || error));
      return {
        ok: false,
        reason: String(error.message || error),
      };
    });
  }
  function exportFourInOneTexture() {
    if (selectedTarget() === "renderdragon")
      return exportNativeMaterialFiles(false);
    if (isSkin()) {
      toast("四合一纹理仅用于普通材质/PBR纹理");
      return;
    }
    return withPaintProgress("导出所选目标四合一", async function (progress) {
      progress(12, "正在同步最新绘制与参数");
      if (paintState.loading) await onTextureReady(function () {});
      await flushLiveAlgorithm();
      // 一次导出锁定目标和名称  编码期间切换目标不能更改已开始导出的格式
      var target = selectedTarget(),
        w = texW(),
        h = texH();
      var baked = target === "opengl" && paintState.exportFioUsePbrColor;
      var name =
        paintState.libName || paintState.zh || paintState.stem || "材质";
      var blob = await (target === "opengl"
        ? encodeCurrentFIO()
        : encodeCurrentMERS());
      var url = URL.createObjectURL(blob),
        a = document.createElement("a");
      progress(82, "正在保存所选格式的原始像素数据");
      a.href = url;
      a.download = (
        name +
        (target === "opengl" ? "_OP_FIO_" : "_RD_MERS_") +
        w +
        "x" +
        h +
        (baked ? "_PBR原色" : "") +
        ".png"
      ).replace(/[\\/:*?"<>|]/g, "_");
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 2000);
      var scale = target === "opengl" ? 2 : 1;
      progress(100, "已导出 " + w * scale + " × " + h * scale + " 四合一纹理");
      toast(
        target === "opengl"
          ? "OP 四合一已导出  左上基色 左下法线 右上属性 右下检测区和红绿边线"
          : "渲染龙 MERS 已导出  RGBA 四通道  基色与法线独立  预览不透明而文件保留真实 A",
      );
    }).catch(function (error) {
      toast("四合一导出失败  " + ((error && error.message) || error));
      return {
        ok: false,
        reason: String((error && error.message) || error),
      };
    });
  }
  function exportNativeMERS() {
    if (isSkin() || paintState.merMode === "none") {
      toast("当前是普通纹理  请先制作 PBR 或点击启用 PBR");
      return;
    }
    return withPaintProgress(
      "高级导出单张 MERS 数据图",
      async function (progress) {
        progress(20, "正在打包 R 金属度 G 自发光 B 粗糙度 A 次表面散射");
        var blob = await encodeCurrentMERS(),
          url = URL.createObjectURL(blob),
          a = document.createElement("a");
        a.href = url;
        a.download = ((paintState.stem || "material") + "_mers.png").replace(
          /[\/:*?"<>|]/g,
          "_",
        );
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 2000);
        progress(100, "已导出 " + texW() + " × " + texH() + " 标准 MERS");
        toast("MERS 已导出  尺寸与原纹理相同  不拼四宫格  基色和法线保持独立");
      },
    );
  }
  function importPack() {
    if (!api.deskCall) return;
    api.deskCall("material_import_pick", {}).then(function (d) {
      if (!d || !d.ok) {
        toast((d && d.reason) || "读取失败");
        return;
      }
      var rels = (d.items || []).map(function (r) {
        return r.rel;
      });
      api
        .deskCall("material_import_copy", {
          src: d.path,
          rels: rels,
          to_library: !paintState.packOpen,
        })
        .then(function (c) {
          toast((c && c.reason) || "复制失败");
          if (c && c.library) paintState.library = c.library;
          if (!paintState.packOpen) paintState.kindFilter = "lib";
          loadList();
        });
    });
  }
  function exportPack() {
    if (!api.deskCall) return;
    var payload = {
      name: libName() || paintState.zh || "材质",
    };
    if (!paintState.packOpen && libName()) {
      payload.lib_name = libName();
      payload.to_library = true;
    }
    withPaintProgress("导出材质包", function (progress) {
      payload.onProgress = function (pct, detail) {
        progress(pct, detail);
      };
      progress(6, "正在准备导出目录");
      return api.deskCall("material_export", payload).then(function (d) {
        progress(d && d.ok ? 100 : 92, d && d.ok ? "导出完成" : "导出失败");
        toast((d && d.reason) || "导出失败");
        return d;
      });
    });
  }
  function applyLibraryToPack() {
    if (!api.deskCall) return;
    if (!paintState.packOpen) {
      toast("先打开或创建一个包");
      return;
    }
    var name = libName();
    if (!name) {
      toast("请先选择一个材质库条目，或在顶部输入材质名称");
      return;
    }
    api
      .deskCall("material_library_apply", {
        lib_name: name,
      })
      .then(function (d) {
        toast((d && d.reason) || "写入资源包失败");
        if (d && d.ok) markSaved("pack");
      });
  }
  function saveSmart() {
    if (paintState.packOpen) saveCurrent();
    else saveLibrary();
  }
  function libName() {
    var nodes = paintQueryAll("[data-lib-name]");
    for (var i = 0; i < nodes.length; i++) {
      var v = String(nodes[i].value || "").trim();
      if (v) return v;
    }
    return String(paintState.libName || "").trim();
  }
  function paintQueryAll(sel) {
    return global.document && global.document.querySelectorAll
      ? global.document.querySelectorAll(sel)
      : [];
  }
  function syncLibName(value) {
    paintState.libName = value;
    paintQueryAll("[data-lib-name]").forEach(function (inp) {
      if (inp !== global.document.activeElement) inp.value = value;
    });
  }
  function moveSelectionBy(dx, dy) {
    if (!selection || !moveSelShot) return;
    var ctx = activeCtx();
    ctx.putImageData(moveSelShot.full, 0, 0);
    var nx = clamp(moveSelShot.x + dx, 0, texW() - moveSelShot.w);
    var ny = clamp(moveSelShot.y + dy, 0, texH() - moveSelShot.h);
    ctx.putImageData(moveSelShot.clip, nx, ny);
    selection = {
      x: nx,
      y: ny,
      w: moveSelShot.w,
      h: moveSelShot.h,
    };
    markPainted();
    redraw();
  }
  function kindZh(kind) {
    if (kind === "ui") return "UI";
    if (kind === "entity") return "生物展开图";
    if (kind === "item") return "物品贴图";
    if (kind === "block") return "方块纹理";
    if (kind === "particle") return "粒子贴图";
    if (kind === "ref") return "参考资源";
    return "其他";
  }
  function textureStateKeyForCurrent() {
    if (paintState.fromSkin || paintState.kind === "skin")
      return (
        "skin:" +
        String(
          paintState.libName || paintState.stem || paintState.rel || "skin",
        )
      );
    if (paintState.fromLibrary)
      return (
        "lib:" +
        String(
          paintState.libName || paintState.stem || paintState.rel || "library",
        )
      );
    if (paintState.fromRef)
      return "ref:" + String(paintState.rel || paintState.stem || "ref");
    return (
      "pack:" +
      String(paintState.rel || paintState.stem || paintState.zh || "texture")
    );
  }
  function textureStateKeyForRow(row, mode) {
    row = row || {};
    mode = String(mode || paintState.kindFilter || "all");
    if (mode === "skin")
      return "skin:" + String(row.name || row.stem || row.rel || "skin");
    if (mode === "lib")
      return (
        "lib:" +
        String(row.name || row.lib_name || row.stem || row.rel || "library")
      );
    if (mode === "ref")
      return "ref:" + String(row.rel || row.stem || row.name || "ref");
    return (
      "pack:" + String(row.rel || row.stem || row.name || row.zh || "texture")
    );
  }
  function isTouchedTexture(key) {
    return !!(
      key &&
      paintState.textureTouchedMap &&
      paintState.textureTouchedMap[key]
    );
  }
  function markCurrentTextureTouched() {
    var key = textureStateKeyForCurrent();
    if (!key) return;
    if (!paintState.textureTouchedMap) paintState.textureTouchedMap = {};
    paintState.textureTouchedMap[key] = true;
  }
  function layerPaintedState(id) {
    if (id === "color")
      return !!(paintState.painted && paintState.painted.color);
    if (id === "normal")
      return !!(paintState.painted && paintState.painted.normal);
    if (id === "height")
      return !!(paintState.painted && paintState.painted.height);
    return !!(paintState.painted && paintState.painted.mer);
  }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function hexRgb(hex) {
    var h = String(hex || "#000000").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [
      parseInt(h.slice(0, 2), 16) || 0,
      parseInt(h.slice(2, 4), 16) || 0,
      parseInt(h.slice(4, 6), 16) || 0,
    ];
  }
  function rgbHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map(function (n) {
          var s = clamp(n | 0, 0, 255).toString(16);
          return s.length === 1 ? "0" + s : s;
        })
        .join("")
    );
  }
  function invalidateNormalDirectionBase() {
    paintState.normalDirectionBase = null;
    paintState.normalDirectionBaseStem = "";
  }
  function ensureNormalDirectionBase() {
    if (!layers.normal) return null;
    if (
      !paintState.normalDirectionBase ||
      paintState.normalDirectionBaseStem !== String(paintState.stem || "")
    ) {
      paintState.normalDirectionBase = canvasFrame(layers.normal);
      paintState.normalDirectionBaseStem = String(paintState.stem || "");
    }
    return paintState.normalDirectionBase;
  }
  function applyWholeNormalVector(nx, ny, key) {
    nx = clamp(Number(nx) || 0, -0.92, 0.92);
    ny = clamp(Number(ny) || 0, -0.92, 0.92);
    var q = Math.hypot(nx, ny);
    if (q > 0.92) {
      nx = (nx / q) * 0.92;
      ny = (ny / q) * 0.92;
    }
    var previewNz = Math.sqrt(Math.max(0.001, 1 - nx * nx - ny * ny));
    var rr = Math.round((nx * 0.5 + 0.5) * 255),
      gg = Math.round((ny * 0.5 + 0.5) * 255),
      bb = Math.round((previewNz * 0.5 + 0.5) * 255);
    var hex = rgbHex(rr, gg, bb);
    paintState.layer = "normal";
    paintState.workflowStage = "normal";
    paintState.normalColor = hex;
    paintState.normalBrushKey = String(key || "平面");
    inspectorTabState = "paint";
    delete paintState.liveChannels.normal;
    if (
      ["pencil", "brush", "soft", "airbrush", "spray"].indexOf(
        paintState.tool,
      ) < 0
    )
      paintState.tool = "pencil";
    if (!layers.normal) layers.normal = makeLayer("rgb(128,128,255)");
    var base = ensureNormalDirectionBase();
    if (!base) {
      toast("当前没有法线层");
      return;
    }
    snapshot();
    paintState.bump = "normal";
    paintState.merMode = "mers";
    var out = new Uint8ClampedArray(base.data.length);
    for (var i = 0; i < base.data.length; i += 4) {
      var a = base.data[i + 3];
      if (!a) {
        out[i] = 128;
        out[i + 1] = 128;
        out[i + 2] = 255;
        out[i + 3] = 0;
        continue;
      }
      var vx = (base.data[i] / 255) * 2 - 1;
      var vy = (base.data[i + 1] / 255) * 2 - 1;
      var vz = Math.max(0.001, (base.data[i + 2] / 255) * 2 - 1);
      vx += nx;
      vy += ny;
      var len = Math.hypot(vx, vy, vz) || 1;
      vx /= len;
      vy /= len;
      vz /= len;
      out[i] = clamp(Math.round((vx * 0.5 + 0.5) * 255), 0, 255);
      out[i + 1] = clamp(Math.round((vy * 0.5 + 0.5) * 255), 0, 255);
      out[i + 2] = clamp(Math.round((vz * 0.5 + 0.5) * 255), 0, 255);
      out[i + 3] = a;
    }
    layers.normal
      .getContext("2d", {
        willReadFrequently: true,
      })
      .putImageData(new ImageData(out, base.width, base.height), 0, 0);
    paintState.painted.normal = true;
    paintState.merMode = "mers";
    markCurrentTextureTouched();
    scheduleAllLivePreviewSync();
    paintChrome();
    syncInspectorSections();
    refreshBrushProps();
    refreshAlgorithmPanel();
    drawLayerSwitchPreviews();
    redraw();
    var active =
      host &&
      host.querySelector('[data-editor-panel="' + inspectorTabState + '"]');
    if (active) active.scrollTop = 0;
    toast(
      "已按 " +
        paintState.normalBrushKey +
        " 方向整体重定向法线 保留原有凹凸细节",
    );
  }
  function invertNormalLayerGlobal() {
    if (!layers.normal) {
      toast("当前没有法线层");
      return;
    }
    paintState.layer = "normal";
    paintState.workflowStage = "normal";
    inspectorTabState = "paint";
    delete paintState.liveChannels.normal;
    snapshot();
    paintState.bump = "normal";
    paintState.merMode = "mers";
    var ctx = layers.normal.getContext("2d", {
      willReadFrequently: true,
    });
    var img = ctx.getImageData(0, 0, texW(), texH());
    for (var i = 0; i < img.data.length; i += 4) {
      if (img.data[i + 3] === 0) continue;
      img.data[i] = 255 - img.data[i];
      img.data[i + 1] = 255 - img.data[i + 1];
    }
    ctx.putImageData(img, 0, 0);
    invalidateNormalDirectionBase();
    paintState.painted.normal = true;
    paintState.merMode = "mers";
    markCurrentTextureTouched();
    scheduleAllLivePreviewSync();
    paintChrome();
    syncInspectorSections();
    refreshBrushProps();
    refreshAlgorithmPanel();
    drawLayerSwitchPreviews();
    redraw();
    toast("法线已反转 凹凸方向已切换");
  }
  function setNormalBrushVector(nx, ny, key) {
    applyWholeNormalVector(nx, ny, key);
  }
  function pbrAlgo() {
    return (
      (parent && parent.RenderDragonPBRAlgorithm) ||
      window.RenderDragonPBRAlgorithm ||
      null
    );
  }
  function ensureAlgorithm() {
    var A = pbrAlgo();
    if (!paintState.algorithmGlobal) {
      var saved = null;
      try {
        saved = JSON.parse(
          localStorage.getItem("renderdragon_pbr_algorithm_global") || "null",
        );
      } catch (e) {}
      paintState.algorithmGlobal = A
        ? A.copyPreset(saved || {})
        : saved || {
            resolution: 128,
            normalStrength: 1.0,
            normalContrast: 1.3,
          };
    }
    if (!paintState.algorithm)
      paintState.algorithm = A
        ? A.copyPreset(paintState.algorithmGlobal)
        : Object.assign({}, paintState.algorithmGlobal);
    try {
      var per = JSON.parse(
        localStorage.getItem("renderdragon_pbr_algorithm_per_texture") || "{}",
      );
      if (per && typeof per === "object") paintState.algorithmPerTexture = per;
    } catch (e2) {}
    if (A)
      paintState.algorithm.resolution = A.nearestResolution(
        paintState.algorithm.resolution,
      );
    return paintState.algorithm;
  }
  function algorithmTextureKey() {
    return String(paintState.rel || paintState.stem || "texture");
  }
  function cleanAlgorithmParams(obj) {
    var out = Object.assign({}, obj || {});
    Object.keys(out).forEach(function (k) {
      if (k.indexOf("__") === 0) delete out[k];
    });
    return out;
  }
  function loadAlgorithmForTexture() {
    ensureAlgorithm();
    var A = pbrAlgo(),
      base = cleanAlgorithmParams(paintState.algorithmGlobal || {}),
      row =
        paintState.algorithmPerTexture &&
        paintState.algorithmPerTexture[algorithmTextureKey()];
    var rowParams = cleanAlgorithmParams(row || {});
    paintState.algorithm = A
      ? A.copyPreset(Object.assign({}, base, rowParams))
      : Object.assign({}, base, rowParams);
    paintState.algorithm.resolution = pbrAlgo().nearestResolution(texW());
    paintState.algorithmSourceW = Math.max(
      1,
      Number(row && row.__source_width) ||
        Number(paintState.algorithmSourceW) ||
        texW(),
    );
    paintState.algorithmSourceH = Math.max(
      1,
      Number(row && row.__source_height) ||
        Number(paintState.algorithmSourceH) ||
        texH(),
    );
    if (
      paintState.algorithmSourceW > texW() ||
      paintState.algorithmSourceH > texH()
    ) {
      paintState.algorithmSourceW = texW();
      paintState.algorithmSourceH = texH();
    }
  }
  function persistAlgorithmStores() {
    try {
      localStorage.setItem(
        "renderdragon_pbr_algorithm_global",
        JSON.stringify(paintState.algorithmGlobal || {}),
      );
      localStorage.setItem(
        "renderdragon_pbr_algorithm_per_texture",
        JSON.stringify(paintState.algorithmPerTexture || {}),
      );
    } catch (e) {}
  }
  function saveAlgorithmState() {
    ensureAlgorithm();
    var row = cleanAlgorithmParams(paintState.algorithm);
    row.__source_width = Math.max(
      1,
      Number(paintState.algorithmSourceW) || texW(),
    );
    row.__source_height = Math.max(
      1,
      Number(paintState.algorithmSourceH) || texH(),
    );
    paintState.algorithmPerTexture[algorithmTextureKey()] = row;
    persistAlgorithmStores();
  }
  function setAlgorithmGlobalFromCurrent() {
    var A = pbrAlgo();
    ensureAlgorithm();
    paintState.algorithmGlobal = A
      ? A.copyPreset(cleanAlgorithmParams(paintState.algorithm))
      : cleanAlgorithmParams(paintState.algorithm);
    persistAlgorithmStores();
    toast("已将当前算法参数设为全局默认，新的纹理将继承这套参数");
  }
  function resetAlgorithmToGlobal() {
    var A = pbrAlgo();
    ensureAlgorithm();
    paintState.algorithmPerTexture[algorithmTextureKey()] = {
      __source_width: Math.max(
        1,
        Number(paintState.algorithmSourceW) || texW(),
      ),
      __source_height: Math.max(
        1,
        Number(paintState.algorithmSourceH) || texH(),
      ),
    };
    paintState.algorithm = A
      ? A.copyPreset(paintState.algorithmGlobal || {})
      : Object.assign({}, paintState.algorithmGlobal || {});
    paintState.algorithm.resolution = pbrAlgo().nearestResolution(texW());
    persistAlgorithmStores();
    refreshAlgorithmPanel();
    scheduleAlgorithmRegenerate();
    toast("当前纹理已恢复全局算法参数，原始分析网格保持不变");
  }
  function canvasFrame(canvas) {
    if (!canvas) return null;
    var ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return {
      width: img.width,
      height: img.height,
      data: new Uint8ClampedArray(img.data),
    };
  }
  function canvasPreviewFrame(canvas, maxSize) {
    if (!canvas) return null;
    maxSize = Math.max(32, Number(maxSize) || 240);
    var scale = Math.min(1, maxSize / Math.max(canvas.width, canvas.height));
    if (scale >= 0.999) return canvasFrame(canvas);
    var w = Math.max(1, Math.round(canvas.width * scale)),
      h = Math.max(1, Math.round(canvas.height * scale));
    var tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    var x = tmp.getContext("2d", {
      willReadFrequently: true,
    });
    x.imageSmoothingEnabled = false;
    x.drawImage(canvas, 0, 0, w, h);
    var im = x.getImageData(0, 0, w, h);
    return {
      width: w,
      height: h,
      data: new Uint8ClampedArray(im.data),
    };
  }
  function averageFrameTo(frame, targetW, targetH) {
    targetW = Math.max(1, Math.round(targetW));
    targetH = Math.max(1, Math.round(targetH));
    if (frame.width === targetW && frame.height === targetH) return frame;
    var out = new Uint8ClampedArray(targetW * targetH * 4),
      sx = frame.width / targetW,
      sy = frame.height / targetH;
    for (var ty = 0; ty < targetH; ty++)
      for (var tx = 0; tx < targetW; tx++) {
        var x0 = Math.floor(tx * sx),
          x1 = Math.max(x0 + 1, Math.ceil((tx + 1) * sx)),
          y0 = Math.floor(ty * sy),
          y1 = Math.max(y0 + 1, Math.ceil((ty + 1) * sy));
        var rr = 0,
          gg = 0,
          bb = 0,
          aa = 0,
          n = 0;
        for (var y = y0; y < Math.min(frame.height, y1); y++)
          for (var x = x0; x < Math.min(frame.width, x1); x++) {
            var o = (y * frame.width + x) * 4;
            rr += frame.data[o];
            gg += frame.data[o + 1];
            bb += frame.data[o + 2];
            aa += frame.data[o + 3];
            n++;
          }
        var d = (ty * targetW + tx) * 4;
        n = Math.max(1, n);
        out[d] = Math.round(rr / n);
        out[d + 1] = Math.round(gg / n);
        out[d + 2] = Math.round(bb / n);
        out[d + 3] = Math.round(aa / n);
      }
    return {
      width: targetW,
      height: targetH,
      data: out,
    };
  }
  function algorithmInputFrame() {
    var f =
        generatingColor && algorithmColorSource
          ? algorithmColorSource
          : canvasFrame(layers.color),
      sw = Math.max(1, Number(paintState.algorithmSourceW) || f.width),
      sh = Math.max(1, Number(paintState.algorithmSourceH) || f.height);
    sw = Math.min(sw, f.width);
    sh = Math.min(sh, f.height);
    return averageFrameTo(f, sw, sh);
  }
  function frameImageData(f) {
    return new ImageData(new Uint8ClampedArray(f.data), f.width, f.height);
  }
  function putFrame(canvas, f) {
    if (!canvas || !f) return;
    if (canvas.width !== f.width || canvas.height !== f.height) {
      canvas.width = f.width;
      canvas.height = f.height;
    }
    canvas.getContext("2d").putImageData(frameImageData(f), 0, 0);
  }
  function algorithmGenerate(resolution, channel) {
    var A = pbrAlgo();
    if (!A || !layers.color) return null;
    var p = Object.assign({}, ensureAlgorithm());
    p.resolution = resolution || texW();
    var src = algorithmInputFrame();
    var g = A.generateChannel
      ? A.generateChannel(src, p, channel || "all")
      : A.generate(src, p);
    [
      "albedo",
      "normal",
      "height",
      "roughness",
      "metalness",
      "emissive",
    ].forEach(function (key) {
      var f = g[key];
      if (!f || (f.width === texW() && f.height === texH())) return;
      var data = new Uint8ClampedArray(texW() * texH() * 4);
      for (var y = 0; y < texH(); y++)
        for (var x = 0; x < texW(); x++) {
          var i =
              (Math.floor((y * f.height) / texH()) * f.width +
                Math.floor((x * f.width) / texW())) *
              4,
            o = (y * texW() + x) * 4;
          for (var c = 0; c < 4; c++) data[o + c] = f.data[i + c];
        }
      g[key] = {
        width: texW(),
        height: texH(),
        data: data,
      };
    });
    return g;
  }
  function applyAlgorithmFrame(id, f) {
    if (!f || !layers[id]) return;
    putFrame(layers[id], f);
    paintState.liveChannels[id] = "generated";
    if (id !== "color") paintState.merMode = "mers";
    if (id === "color") {
      paintState.painted.color = true;
      paintState.lockColor = false;
    } else if (id === "normal") paintState.painted.normal = true;
    else if (id === "height") paintState.painted.height = true;
    else {
      paintState.painted.mer = true;
      paintState.merMode = "mers";
    }
    scheduleAllLivePreviewSync();
  }
  function refreshAlgorithmMetrics(g) {
    var box = host && host.querySelector("[data-algo-metrics]");
    if (!box) return;
    var m = (g && g.metrics) || {};
    box.textContent =
      "分析网格 " +
      ((m.source || []).join("×") || "-") +
      " → 输出 " +
      ((m.target || []).join("×") || "-") +
      " · 结构置信 " +
      ((m.structure_confidence || 0) * 100).toFixed(1) +
      "% · 亮度 " +
      (m.mean_luminance || 0).toFixed(3) +
      " · 饱和 " +
      (m.mean_saturation || 0).toFixed(3) +
      " · 法线增益 " +
      (m.normal_gain || 0).toFixed(2) +
      (m.gray_white_enhanced ? " · 灰白增强已启用" : "");
  }
  function regenerateActiveChannel(force) {
    if (paintState.loading)
      return onTextureReady(function () {
        regenerateActiveChannel(force);
      });
    if (isSkin() || !paintState.loaded || !layers.color) return;
    ensureAlgorithm();
    if (!force && !paintState.algorithmLive) return;
    var stage = paintState.workflowStage || paintState.layer;
    if (stage === "color" || stage === "preview") {
      redraw();
      return;
    }
    var g = algorithmGenerate(texW(), stage);
    if (!g) return;
    paintState.regenerating = true;
    try {
      if (stage === "normal") {
        applyAlgorithmFrame("normal", g.normal);
        applyAlgorithmFrame("height", g.height);
        invalidateNormalDirectionBase();
        paintState.bump = "normal";
        paintState.layer = "normal";
      } else if (stage === "height") {
        applyAlgorithmFrame("height", g.height);
        paintState.bump = "heightmap";
        paintState.layer = "height";
      } else if (stage === "roughness") {
        applyAlgorithmFrame("roughness", g.roughness);
        paintState.layer = "roughness";
      } else if (stage === "metal") {
        applyAlgorithmFrame("metal", g.metalness);
        paintState.layer = "metal";
      } else if (stage === "emissive") {
        applyAlgorithmFrame("emissive", g.emissive);
        paintState.layer = "emissive";
      }
      refreshAlgorithmMetrics(g);
    } finally {
      paintState.regenerating = false;
    }
    saveAlgorithmState();
    paintChrome();
    redraw();
  }
  function clearLiveAlgorithm() {
    stopLiveWorker(false);
    if (algorithmTimer) cancelAnimationFrame(algorithmTimer);
    algorithmTimer = 0;
    algorithmPendingKeys = {};
    algorithmGesture = false;
  }
  function stopLiveWorker(restoreKeys) {
    if (restoreKeys && liveWorkerJob)
      Object.keys(liveWorkerJob.keys).forEach(function (k) {
        algorithmPendingKeys[k] = true;
      });
    if (liveWorker) {
      liveWorker.terminate();
      liveWorker = null;
    }
    liveWorkerJob = null;
    paintState.syncBusy = false;
    paintState.workerActive = false;
  }
  function currentSizeFrame(f) {
    if (!f || (f.width === texW() && f.height === texH())) return f;
    var data = new Uint8ClampedArray(texW() * texH() * 4);
    for (var y = 0; y < texH(); y++)
      for (var x = 0; x < texW(); x++) {
        var a =
            (Math.floor((y * f.height) / texH()) * f.width +
              Math.floor((x * f.width) / texW())) *
            4,
          b = (y * texW() + x) * 4;
        for (var c = 0; c < 4; c++) data[b + c] = f.data[a + c];
      }
    return {
      width: texW(),
      height: texH(),
      data: data,
    };
  }
  function startScheduledAlgorithm() {
    if (
      !paintState.loaded ||
      paintState.loading ||
      isSkin() ||
      !paintState.algorithmLive
    )
      return;
    if (liveWorkerJob) return;
    if (!Object.keys(algorithmPendingKeys).length) return;
    if (
      texW() <= 256 ||
      liveWorkerFailed ||
      !global.Worker ||
      !pbrAlgo().workerSource
    ) {
      flushLiveAlgorithm();
      return;
    }
    var keys = Object.assign({}, algorithmPendingKeys),
      targets = {};
    Object.keys(keys).forEach(function (key) {
      algorithmParameterTargets(key).forEach(function (id) {
        targets[id] = true;
      });
    });
    var stages = Object.keys(targets);
    if (!stages.length || stages.indexOf("height_normal") >= 0) {
      flushLiveAlgorithm();
      return;
    }
    if (algorithmTimer) cancelAnimationFrame(algorithmTimer);
    algorithmTimer = 0;
    var explicit = Object.keys(keys).some(function (k) {
        return k.indexOf("__") !== 0;
      }),
      params = Object.assign({}, ensureAlgorithm(), {
        resolution: texW(),
      });
    var source = algorithmInputFrame(),
      colorSource = null;
    if (stages.indexOf("color") >= 0) {
      if (!algorithmColorSource)
        algorithmColorSource = canvasFrame(layers.color);
      generatingColor = true;
      try {
        colorSource = algorithmInputFrame();
      } finally {
        generatingColor = false;
      }
    }
    var job = {
      id: ++liveWorkerSerial,
      token: textureLoadSerial,
      manual: manualEditRevision,
      keys: keys,
      explicit: explicit,
    };
    try {
      if (!liveWorker) {
        var js =
          pbrAlgo().workerSource +
          "\nself.onmessage=function(e){var d=e.data;try{var rows=d.stages.map(function(stage){var g=self.RenderDragonPBRAlgorithm.generateChannel(stage==='color'&&d.colorSource?d.colorSource:d.source,d.params,stage);delete g.analysis;return {stage:stage,result:g};});self.postMessage({id:d.id,rows:rows});}catch(error){self.postMessage({id:d.id,error:String(error.message||error)});}};";
        var url = URL.createObjectURL(
          new Blob([js], {
            type: "text/javascript",
          }),
        );
        liveWorker = new Worker(url);
        URL.revokeObjectURL(url);
        liveWorker.onmessage = function (event) {
          var result = event.data,
            active = liveWorkerJob;
          if (!active || active.id !== result.id) return;
          if (result.error) {
            workerFallback(result.error);
            return;
          }
          liveWorkerJob = null;
          paintState.syncBusy = false;
          if (
            active.token !== textureLoadSerial ||
            active.manual !== manualEditRevision ||
            paintState.loading
          )
            return;
          paintState.regenerating = true;
          try {
            result.rows.forEach(function (row) {
              var stage = row.stage,
                g = row.result,
                commit =
                  active.explicit ||
                  paintState.liveChannels[stage] === "generated";
              var names = {
                normal: "normal",
                height: "height",
                roughness: "roughness",
                metal: "metalness",
                emissive: "emissive",
                color: "albedo",
              };
              var f = currentSizeFrame(g[names[stage]]);
              if (f) {
                if (commit) applyAlgorithmFrame(stage, f);
                else putFrame(layers[stage], f);
              }
              if (stage === "normal") {
                if (g.height) {
                  var height = currentSizeFrame(g.height);
                  if (commit) applyAlgorithmFrame("height", height);
                  else putFrame(layers.height, height);
                }
                invalidateNormalDirectionBase();
                if (commit) paintState.bump = "normal";
              }
              refreshAlgorithmMetrics(g);
            });
          } finally {
            paintState.regenerating = false;
          }
          saveAlgorithmState();
          refreshAlgorithmPanel();
          paintChrome();
          scheduleAllLivePreviewSync();
          // 保留中间已完成的显示  下一帧继续处理拖动中的最新参数
          if (Object.keys(algorithmPendingKeys).length)
            requestAnimationFrame(startScheduledAlgorithm);
        };
        liveWorker.onerror = function (e) {
          e.preventDefault();
          workerFallback(e.message || "计算线程失败");
        };
      }
      algorithmPendingKeys = {};
      liveWorkerJob = job;
      paintState.syncBusy = true;
      paintState.workerActive = true;
      liveWorker.postMessage({
        id: job.id,
        source: source,
        colorSource: colorSource,
        params: params,
        stages: stages,
      });
      document.querySelectorAll("[data-sync-status]").forEach(function (l) {
        l.textContent = "计算中  显示上次完成结果";
      });
    } catch (e) {
      workerFallback(e.message);
    }
  }
  function workerFallback(message) {
    stopLiveWorker(true);
    liveWorkerFailed = true;
    paintState.workerWarning = message;
    flushLiveAlgorithm();
    scheduleAllLivePreviewSync();
  }
  function algorithmParameterTargets(key) {
    if (key === "detailStrength" || key === "colorRelief") return ["color"];
    if (key === "normalStrength" || key === "normalContrast") return ["normal"];
    if (
      key === "roughnessBase" ||
      key === "roughnessContrast" ||
      key === "roughnessStructure"
    )
      return ["roughness"];
    if (key === "metalnessAuto" || key === "metalnessBias") return ["metal"];
    if (
      key === "emissiveAuto" ||
      key === "emissiveThreshold" ||
      key === "emissiveStrength"
    )
      return ["emissive"];
    if (key.indexOf("preview") === 0) return [];
    if (key === "__color_edit")
      return Object.keys(paintState.liveChannels || {}).filter(function (id) {
        return id !== "color" && id !== "height";
      });
    if (key === "__height_edit") return ["height_normal"];
    return ["normal", "roughness"];
  }
  function flushLiveAlgorithm() {
    stopLiveWorker(true);
    if (algorithmTimer) cancelAnimationFrame(algorithmTimer);
    algorithmTimer = 0;
    if (paintState.loading) return onTextureReady(flushLiveAlgorithm);
    var keys = Object.keys(algorithmPendingKeys);
    algorithmPendingKeys = {};
    if (
      !keys.length ||
      !paintState.loaded ||
      isSkin() ||
      !paintState.algorithmLive
    )
      return;
    var targets = {},
      explicit = keys.some(function (k) {
        return k.indexOf("__") !== 0;
      });
    keys.forEach(function (key) {
      algorithmParameterTargets(key).forEach(function (id) {
        targets[id] = true;
      });
    });
    var stages = Object.keys(targets);
    if (!stages.length) {
      redraw();
      return;
    }
    paintState.regenerating = true;
    try {
      for (var t = 0; t < stages.length; t++) {
        var stage = stages[t],
          commit = explicit || paintState.liveChannels[stage] === "generated";
        if (stage === "height_normal") {
          putFrame(layers.normal, editableHeightNormalFrame());
          invalidateNormalDirectionBase();
          if (paintState.bump === "normal") paintState.painted.normal = true;
          continue;
        }
        if (stage === "color") {
          if (!algorithmColorSource)
            algorithmColorSource = canvasFrame(layers.color);
          generatingColor = true;
        }
        var g = algorithmGenerate(texW(), stage);
        generatingColor = false;
        if (!g) continue;
        var map = {
          normal: "normal",
          height: "height",
          roughness: "roughness",
          metal: "metalness",
          emissive: "emissive",
          color: "albedo",
        };
        var f = g[map[stage]];
        if (f) {
          if (commit) applyAlgorithmFrame(stage, f);
          else putFrame(layers[stage], f);
        }
        if (stage === "normal") {
          if (g.height) {
            if (commit) applyAlgorithmFrame("height", g.height);
            else putFrame(layers.height, g.height);
          }
          invalidateNormalDirectionBase();
          if (commit) paintState.bump = "normal";
        }
        refreshAlgorithmMetrics(g);
      }
    } finally {
      paintState.regenerating = false;
      generatingColor = false;
    }
    saveAlgorithmState();
    refreshAlgorithmPanel();
    paintChrome();
    scheduleAllLivePreviewSync();
  }
  function scheduleAlgorithmRegenerate(key) {
    if (!paintState.algorithmLive || isSkin()) return;
    algorithmPendingKeys[key || "parameters"] = true;
    if (algorithmTimer) return;
    var token = textureLoadSerial;
    algorithmTimer = requestAnimationFrame(function () {
      algorithmTimer = 0;
      if (token !== textureLoadSerial) return;
      startScheduledAlgorithm();
    });
  }
  function generateAllPbrChannels() {
    if (paintState.loading) return onTextureReady(generateAllPbrChannels);
    if (!paintState.loaded) return;
    paintState.algorithmLive = true;
    var g = algorithmGenerate(texW());
    if (!g) {
      toast("通配算法未加载");
      return;
    }
    snapshot();
    paintState.regenerating = true;
    try {
      applyAlgorithmFrame("normal", g.normal);
      applyAlgorithmFrame("height", g.height);
      invalidateNormalDirectionBase();
      applyAlgorithmFrame("roughness", g.roughness);
      applyAlgorithmFrame("metal", g.metalness);
      applyAlgorithmFrame("emissive", g.emissive);
      paintState.bump = "normal";
      paintState.merMode = "mers";
      refreshAlgorithmMetrics(g);
    } finally {
      paintState.regenerating = false;
    }
    saveAlgorithmState();
    redraw();
    paintChrome();
    toast("已生成法线与 RGB 属性  次表面保留原值  可继续逐层手绘");
  }
  function upscaleCurrentTexture(target) {
    generateAllTexturesPbr({
      operation: "resize",
      scope: "current",
      resolution: Number(
        target ||
          (paintState.algorithm && paintState.algorithm.resolution) ||
          texW(),
      ),
    });
  }
  function upscaleAllTextures(target) {
    generateAllTexturesPbr({
      operation: "resize",
      scope: "all",
      resolution: Number(
        target ||
          (paintState.algorithm && paintState.algorithm.resolution) ||
          texW(),
      ),
    });
  }
  function generateAllTexturesPbr(options) {
    options = options || {};
    if (!api.deskCall || !paintState.packOpen || !paintState.loaded) {
      toast("请先选择一个材质");
      return;
    }
    var old = document.querySelector("[data-pbr-batch-dialog]");
    if (old) {
      if (old.getAttribute("aria-busy") === "true") return;
      old.remove();
    }
    var resizing = options.operation === "resize",
      target = Number(
        options.resolution != null
          ? options.resolution
          : ensureAlgorithm().resolution || texW(),
      ),
      running = false;
    var dialog = el("dialog", "");
    dialog.setAttribute("data-pbr-batch-dialog", "1");
    dialog.style.cssText =
      "background:var(--panel,#20232b);color:var(--ink,#eee);border:1px solid var(--line,#555);border-radius:12px;max-width:600px;width:calc(100% - 36px);max-height:calc(100% - 36px);overflow:auto;padding:24px";
    dialog.appendChild(
      el("h3", "", resizing ? "批量调整纹理尺寸" : "批量生成材质属性"),
    );
    var description = resizing
      ? "目标宽度 " +
        target +
        " px  高度按原比例调整  只缩放已有像素  不自动生成 PBR  已有 MERS 和凹凸数据同步缩放"
      : "下方是生成任务  可按需要勾选  不是六选四  PBR 按当前目标输出 OP 四分区或渲染龙材质文件组  未勾选的属性保持原样";
    dialog.appendChild(el("p", "hint", description));
    if (!resizing)
      dialog.appendChild(
        el(
          "p",
          "hint",
          "MERS 是一张图的 R 金属度  G 自发光  B 粗糙度  A 次表面  基色和法线另外保存  次表面保留原值或默认值  不自动猜测",
        ),
      );
    var scope = el("select", "search");
    scope.setAttribute("data-batch-scope", "1");
    scope.setAttribute("aria-label", "处理范围");
    [
      ["current", "仅当前材质"],
      ["visible", "当前分类和搜索结果"],
      ["source", "原包已有材质"],
      ["all", "全部可编辑材质  包含内置素材"],
    ].forEach(function (item) {
      var op = document.createElement("option");
      op.value = item[0];
      op.textContent = item[1];
      scope.appendChild(op);
    });
    scope.value = options.scope || "current";
    dialog.appendChild(scope);
    var checks = el("div", "");
    checks.style.cssText =
      "display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0";
    if (!resizing) {
      var chosen =
        options.channel ||
        (["normal", "roughness", "metal", "emissive"].indexOf(
          paintState.workflowStage,
        ) >= 0
          ? paintState.workflowStage
          : "roughness");
      [
        ["color", "基色增强  独立图片"],
        ["normal", "法线与辅助高度"],
        ["roughness", "粗糙度"],
        ["metal", "金属度"],
        ["emissive", "自发光"],
        ["height", "仅高度  替代法线"],
      ].forEach(function (item) {
        var label = el("label", ""),
          input = document.createElement("input");
        input.type = "checkbox";
        input.value = item[0];
        input.checked = item[0] === chosen;
        input.setAttribute("data-batch-channel", item[0]);
        input.onchange = function () {
          if (
            input.checked &&
            (input.value === "normal" || input.value === "height")
          ) {
            var other = checks.querySelector(
              '[data-batch-channel="' +
                (input.value === "normal" ? "height" : "normal") +
                '"]',
            );
            if (other) other.checked = false;
          }
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + item[1]));
        checks.appendChild(label);
      });
      dialog.appendChild(checks);
      dialog.appendChild(
        el(
          "p",
          "hint",
          "生成法线时会同时保留辅助高度用于编辑  游戏定义只注册法线或高度其中一种  不会导出六张属性图",
        ),
      );
    }
    var message = el("p", "hint", "");
    message.setAttribute("data-batch-message", "1");
    dialog.appendChild(message);
    var progressBox = el("section", "");
    progressBox.style.cssText =
      "margin:18px 0;padding:14px;border:1px solid var(--line,#555);border-radius:8px";
    var progressLabel = el("b", "", "尚未开始"),
      progress = el("progress", ""),
      progressDetail = el("p", "hint", "等待开始"),
      progressFile = el("div", "hint", "");
    progress.setAttribute("data-batch-progress", "1");
    progress.setAttribute("aria-label", "批量任务进度");
    progress.max = 100;
    progress.value = 0;
    progress.style.cssText =
      "display:block;width:100%;height:18px;margin:12px 0;accent-color:var(--accent,#D6A45A)";
    progressLabel.setAttribute("data-batch-count", "1");
    progressDetail.setAttribute("data-batch-phase", "1");
    progressFile.setAttribute("data-batch-file", "1");
    progressFile.style.cssText = "overflow-wrap:anywhere;min-height:18px";
    progressBox.appendChild(progressLabel);
    progressBox.appendChild(progress);
    progressBox.appendChild(progressDetail);
    progressBox.appendChild(progressFile);
    dialog.appendChild(progressBox);
    var run = el(
        "button",
        "tb-btn",
        resizing ? "开始调整并暂存" : "生成并暂存",
      ),
      cancel = el("button", "tb-btn", "取消");
    run.setAttribute("data-batch-run", "1");
    cancel.setAttribute("data-batch-close", "1");
    function selectedRows() {
      if (scope.value === "current")
        return [
          {
            rel: paintState.rel,
            kind: paintState.kind,
          },
        ];
      var rows = (paintState.items || []).filter(function (row) {
        return ["ui", "other"].indexOf(row.kind) < 0;
      });
      if (scope.value === "source")
        return rows.filter(function (row) {
          return row.origin !== "catalog";
        });
      if (scope.value === "all") return rows;
      var query = String(paintState.filter || "").toLowerCase();
      return rows.filter(function (row) {
        return (
          (paintState.kindFilter === "all" ||
            browseKind(row.kind) === paintState.kindFilter) &&
          (!query ||
            [row.zh, row.stem, row.rel, row.search_zh]
              .join(" ")
              .toLowerCase()
              .indexOf(query) >= 0)
        );
      });
    }
    function updateScope() {
      var count = selectedRows().length;
      message.textContent =
        "将处理 " +
        count +
        " 个材质  " +
        (scope.value === "all"
          ? "包含内置素材  这是一次明确的全量尺寸或生成操作"
          : "仅处理所选范围");
      progressLabel.textContent = "已处理 0 / " + count + "  0%";
    }
    scope.onchange = updateScope;
    updateScope();
    run.onclick = async function () {
      if (running) return;
      var channels = resizing
          ? ["color"]
          : Array.from(checks.querySelectorAll("input:checked")).map(
              function (x) {
                return x.value;
              },
            ),
        rows = selectedRows(),
        rel = paintState.rel;
      if (!channels.length || !rows.length) {
        message.textContent = "请选择至少一个生成任务和一个材质";
        return;
      }
      if (pbrAlgo().RESOLUTIONS.indexOf(target) < 0) {
        message.textContent = "分辨率只能选择 16X 32X 64X 128X 256X 512X 1024X";
        return;
      }
      if (
        channels.indexOf("height") >= 0 &&
        rows.some(function (x) {
          return x.kind === "item";
        })
      ) {
        message.textContent = "所选范围含物品  请改用法线";
        return;
      }
      running = true;
      dialog.setAttribute("aria-busy", "true");
      run.disabled = true;
      cancel.disabled = true;
      scope.disabled = true;
      checks.querySelectorAll("input").forEach(function (i) {
        i.disabled = true;
      });
      progress.value = 0;
      progressLabel.textContent = "已处理 0 / " + rows.length + "  0%";
      progressDetail.textContent = "正在暂存当前编辑";
      progressFile.textContent = "";
      try {
        await new Promise(function (resolve) {
          setTimeout(resolve, 0);
        });
        var committed = false;
        var saved = await flushPending();
        if (saved && saved.ok === false)
          throw new Error(saved.reason || "暂存失败");
        var result = await api.deskCall("pbr_generate_all", {
          rels: rows.map(function (x) {
            return x.rel;
          }),
          channels: channels,
          resize_only: resizing,
          resolution: target,
          global_params: cleanAlgorithmParams(
            paintState.algorithmGlobal || ensureAlgorithm(),
          ),
          per_texture: paintState.algorithmPerTexture,
          onProgress: function (pct, detail, state) {
            var completed = state ? state.completed : 0,
              total = (state && state.total) || rows.length,
              percent = Math.floor((completed / total) * 100);
            progress.value = percent;
            progressLabel.textContent =
              "已处理 " + completed + " / " + total + "  " + percent + "%";
            progressDetail.textContent = detail;
            progressFile.textContent = (state && state.rel) || "";
          },
        });
        if (!result || !result.ok)
          throw new Error((result && result.reason) || "生成失败");
        committed = true;
        var current = await api.deskCall("texture_get", {
          rel: rel,
        });
        if (current && current.ok) {
          afterLoad(current);
          await textureLoading;
        }
        loadList();
        progress.value = 100;
        progressLabel.textContent =
          "已处理 " + result.count + " / " + result.count + "  100%";
        progressDetail.textContent = "处理完成  已暂存到工作区  尚未下载";
        message.textContent = result.reason;
        dialog.setAttribute("data-batch-complete", "1");
        run.textContent = "已完成";
        cancel.textContent = "关闭";
        toast(result.reason);
      } catch (error) {
        progressDetail.textContent = committed
          ? "修改已暂存  画板刷新失败  请重新打开材质"
          : "处理失败  本次批量修改未提交";
        message.textContent = error.message || String(error);
        run.disabled = false;
        scope.disabled = false;
        checks.querySelectorAll("input").forEach(function (i) {
          i.disabled = false;
        });
      } finally {
        running = false;
        dialog.setAttribute("aria-busy", "false");
        cancel.disabled = false;
      }
    };
    dialog.addEventListener("cancel", function (event) {
      if (running) event.preventDefault();
    });
    cancel.onclick = function () {
      if (running) return;
      dialog.close();
      dialog.remove();
    };
    dialog.appendChild(run);
    dialog.appendChild(cancel);
    document.body.appendChild(dialog);
    dialog.showModal();
  }
  function setWorkflowStage(stage) {
    var map = {
      color: "color",
      normal: "normal",
      height: "height",
      roughness: "roughness",
      metal: "metal",
      emissive: "emissive",
      sub: "sub",
    };
    paintState.workflowStage = stage;
    if (map[stage]) paintState.layer = map[stage];
    if (stage === "preview" || stage === "fio") {
      inspectorTabState = "algorithm";
      syncInspectorSections();
    }
    paintChrome();
    redraw();
  }
  function nextWorkflowStage() {
    var order = [
        "color",
        "normal",
        "roughness",
        "metal",
        "emissive",
        "sub",
        "preview",
      ],
      i = order.indexOf(paintState.workflowStage);
    setWorkflowStage(order[Math.min(order.length - 1, Math.max(0, i) + 1)]);
  }
  function downloadAlgorithmJson(name, doc) {
    var blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: "application/json",
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 1000);
  }
  function importAlgorithmJson(kind) {
    var inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json,application/json";
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var doc = JSON.parse(r.result),
            A = pbrAlgo();
          if (kind === "project") {
            var globalDoc = doc.global_algorithm || doc.algorithm;
            if (globalDoc)
              paintState.algorithmGlobal = A
                ? A.importPreset(globalDoc)
                : Object.assign({}, globalDoc.params || globalDoc);
            if (doc.per_texture && typeof doc.per_texture === "object")
              paintState.algorithmPerTexture = doc.per_texture;
            var row = paintState.algorithmPerTexture[algorithmTextureKey()];
            paintState.algorithm = A
              ? A.copyPreset(
                  Object.assign(
                    {},
                    paintState.algorithmGlobal || {},
                    cleanAlgorithmParams(row || {}),
                  ),
                )
              : Object.assign(
                  {},
                  paintState.algorithmGlobal || {},
                  cleanAlgorithmParams(row || {}),
                );
            paintState.algorithmSourceW = Math.max(
              1,
              Number(row && row.__source_width) ||
                paintState.algorithmSourceW ||
                texW(),
            );
            paintState.algorithmSourceH = Math.max(
              1,
              Number(row && row.__source_height) ||
                paintState.algorithmSourceH ||
                texH(),
            );
          } else
            paintState.algorithm = A
              ? A.importPreset(doc)
              : Object.assign({}, doc.params || doc);
          paintState.algorithm.resolution = pbrAlgo().nearestResolution(texW());
          saveAlgorithmState();
          persistAlgorithmStores();
          refreshAlgorithmPanel();
          scheduleAlgorithmRegenerate();
          toast("算法配置已导入");
        } catch (e) {
          toast("算法配置导入失败 " + e.message);
        }
      };
      r.readAsText(f, "utf-8");
    };
    inp.click();
  }
  function exportAlgorithmPreset() {
    var A = pbrAlgo(),
      doc = A
        ? A.exportPreset(cleanAlgorithmParams(ensureAlgorithm()))
        : {
            kind: "renderdragon-pbr-algorithm-preset",
            params: cleanAlgorithmParams(ensureAlgorithm()),
          };
    downloadAlgorithmJson("RenderDragon_PBR_算法预设.json", doc);
  }
  function exportAlgorithmProject() {
    var A = pbrAlgo();
    ensureAlgorithm();
    downloadAlgorithmJson("RenderDragon_PBR_项目修改项.json", {
      kind: "renderdragon-pbr-project",
      version: 2,
      engine: (A && A.VERSION) || "universal",
      global_algorithm: A
        ? A.exportPreset(paintState.algorithmGlobal || {})
        : {
            params: paintState.algorithmGlobal || {},
          },
      current_algorithm: A
        ? A.exportPreset(paintState.algorithm)
        : {
            params: paintState.algorithm,
          },
      per_texture: paintState.algorithmPerTexture,
      current_texture: algorithmTextureKey(),
    });
  }
  function pbrPreviewFrame(maxSize, forcePbr) {
    if (isSkin() || !layers.color || !layers.normal) return null;
    if (paintState.merMode === "none" && !forcePbr)
      return canvasPreviewFrame(layers.color, maxSize || 180);
    var A = pbrAlgo();
    if (!A || !A.previewFromLayers) return null;
    maxSize = Math.max(32, Number(maxSize) || 180);
    var cacheKey = [
      maxSize,
      forcePbr,
      liveLayerMutationRevision,
      paintState.bump,
      paintState.merMode,
      selectedTarget(),
      JSON.stringify(paintState.algorithm),
    ].join("|");
    if (previewCache[cacheKey]) return previewCache[cacheKey];
    var colorF = canvasPreviewFrame(layers.color, maxSize),
      normalF = canvasPreviewFrame(layers.normal, maxSize),
      metalF = canvasPreviewFrame(layers.metal, maxSize),
      emitF = canvasPreviewFrame(layers.emissive, maxSize),
      roughF = canvasPreviewFrame(layers.roughness, maxSize);
    if (paintState.bump === "none" && !forcePbr) {
      for (var i = 0; i < normalF.data.length; i += 4)
        normalF.data.set([128, 128, 255, 255], i);
    }
    var result = A.previewFromLayers(
      colorF,
      normalF,
      metalF,
      emitF,
      roughF,
      ensureAlgorithm(),
      maxSize,
      selectedTarget() === "renderdragon"
        ? canvasPreviewFrame(layers.sub, maxSize)
        : null,
    );
    if (Object.keys(previewCache).length > 12) previewCache = {};
    previewCache[cacheKey] = result;
    return result;
  }
  var SIDE_PREVIEW_BOX = 180;
  function displayFrameForStage(stage, frame) {
    if (!frame) return frame;
    if (["emissive", "roughness", "metal", "sub"].indexOf(stage) < 0)
      return frame;
    var src = frame.data || [];
    var out = new Uint8ClampedArray(src);
    for (var i = 0; i < out.length; i += 4) {
      out[i + 3] = 255;
    }
    return {
      width: frame.width,
      height: frame.height,
      data: out,
    };
  }
  function drawFrameScaled(targetCtx, frame, dx, dy, dw, dh) {
    if (!targetCtx || !frame) return;
    var tmp = document.createElement("canvas");
    tmp.width = frame.width;
    tmp.height = frame.height;
    tmp.getContext("2d").putImageData(frameImageData(frame), 0, 0);
    targetCtx.drawImage(tmp, 0, 0, frame.width, frame.height, dx, dy, dw, dh);
  }
  function drawFrameIntoPreviewBox(target, frame) {
    if (!target || !frame) return;
    var box = SIDE_PREVIEW_BOX,
      pad = 6;
    target.width = box;
    target.height = box;
    target.style.width = "100%";
    target.style.height = "auto";
    var x = target.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.clearRect(0, 0, box, box);
    var usable = Math.max(1, box - pad * 2),
      k = Math.min(
        usable / Math.max(1, frame.width),
        usable / Math.max(1, frame.height),
      );
    var dw = Math.max(1, Math.round(frame.width * k)),
      dh = Math.max(1, Math.round(frame.height * k));
    var dx = Math.floor((box - dw) / 2),
      dy = Math.floor((box - dh) / 2);
    drawFrameScaled(x, frame, dx, dy, dw, dh);
    target.setAttribute("data-preview-fit", [dx, dy, dw, dh].join(","));
  }
  function drawCanvasPreview(target, source, maxSize, stageId) {
    if (!target || !source) return;
    var f = canvasPreviewFrame(source, maxSize || 180);
    drawFrameIntoPreviewBox(target, displayFrameForStage(stageId || "", f));
  }
  function activePreviewStage() {
    var stage = paintState.workflowStage || paintState.layer || "color";
    if (
      [
        "preview",
        "fio",
        "color",
        "normal",
        "metal",
        "emissive",
        "roughness",
        "sub",
      ].indexOf(stage) >= 0
    )
      return stage;
    if (
      ["color", "normal", "metal", "emissive", "roughness", "sub"].indexOf(
        paintState.layer,
      ) >= 0
    )
      return paintState.layer;
    return "";
  }
  function drawLayerSwitchPreviews() {
    if (!layerPreviewRail) return;
    layerPreviewRail.style.display = "flex";
    if (isSkin()) {
      Object.keys(layerPreviewCards).forEach(function (id) {
        if (layerPreviewCards[id]) layerPreviewCards[id].style.display = "none";
      });
      return;
    }
    var current = activePreviewStage();
    [
      "preview",
      "fio",
      "color",
      "normal",
      "metal",
      "emissive",
      "roughness",
      "sub",
    ].forEach(function (id) {
      var card = layerPreviewCards[id],
        canvas = layerPreviewViews[id];
      if (!card || !canvas) return;
      if (id === "normal") {
        var label = card.querySelector(".paint-stage-label");
        if (label)
          label.textContent = paintState.loading
            ? "正在准备法线"
            : paintState.bump === "none"
              ? "法线候选预览 未应用"
              : paintState.bump === "heightmap"
                ? "高度生成的法线预览"
                : "法线";
      }
      card.style.display = id === current ? "none" : "";
      if (id === current) return;
      if (id === "fio") {
        drawCanvasPreview(canvas, fourInOneCanvas(180), 180, "fio");
      } else if (id === "preview") {
        var f = pbrPreviewFrame(180);
        if (f) drawFrameIntoPreviewBox(canvas, f);
      } else if (layers[id]) drawCanvasPreview(canvas, layers[id], 180, id);
    });
  }
  function drawReferencePreview() {
    if (!referenceView || !layers.color || isSkin()) {
      if (referenceView) referenceView.style.display = "none";
      return;
    }
    referenceView.style.display = "";
    drawCanvasPreview(referenceView, layers.color, 220, "color");
  }
  function drawMerPreview() {
    if (!merView || !layers.metal || isSkin()) {
      if (merView) merView.style.display = "none";
      return;
    }
    merView.style.display = "";
    var mf = canvasPreviewFrame(layers.metal, 180),
      ef = canvasPreviewFrame(layers.emissive, 180),
      rf = canvasPreviewFrame(layers.roughness, 180);
    var w = mf.width,
      h = mf.height,
      d = new Uint8ClampedArray(w * h * 4);
    for (var i = 0; i < w * h; i++) {
      var o = i * 4;
      d[o] = mf.data[o];
      d[o + 1] = ef.data[o];
      d[o + 2] = rf.data[o];
      d[o + 3] = 255;
    }
    merView.width = w;
    merView.height = h;
    merView.getContext("2d").putImageData(new ImageData(d, w, h), 0, 0);
  }
  function refreshAlgorithmPanel() {
    if (!host) return;
    ensureAlgorithm();
    host.querySelectorAll("[data-algo-param]").forEach(function (inp) {
      var k = inp.getAttribute("data-algo-param");
      if (document.activeElement !== inp && paintState.algorithm[k] != null)
        inp.value = String(paintState.algorithm[k]);
      var out = host.querySelector('[data-algo-value="' + k + '"]');
      if (out)
        out.textContent = Number(paintState.algorithm[k] || 0).toFixed(
          k.indexOf("Threshold") >= 0 || k.indexOf("Width") >= 0 ? 2 : 2,
        );
    });
    host.querySelectorAll("[data-workflow-stage]").forEach(function (b) {
      b.classList.toggle(
        "on",
        b.getAttribute("data-workflow-stage") === paintState.workflowStage,
      );
    });
    var live = host.querySelector("[data-algo-live]");
    if (live) live.checked = !!paintState.algorithmLive;
    host.querySelectorAll("[data-normal-brush]").forEach(function (b) {
      b.classList.toggle(
        "on",
        b.getAttribute("data-normal-brush") ===
          String(paintState.normalBrushKey || "平面"),
      );
    });
    var normalRead = host.querySelector("[data-normal-brush-readout]");
    if (normalRead)
      normalRead.textContent =
        "当前方向 " +
        String(paintState.normalBrushKey || "平面") +
        " · " +
        String(paintState.normalColor || "#8080ff").toUpperCase() +
        " · 会保留细节并整体改变法线朝向";
    var res = host.querySelector("[data-algo-resolution]");
    if (res && document.activeElement !== res)
      res.value = String(paintState.algorithm.resolution || texW());
    var lab = global.document.querySelector("[data-active-layer-label]");
    if (lab)
      lab.textContent =
        paintState.workflowStage === "fio"
          ? selectedTarget() === "opengl"
            ? "OP 四合一  实时预览"
            : "渲染龙材质文件组  实时预览"
          : paintState.workflowStage === "preview"
            ? paintState.merMode === "none"
              ? "普通纹理 · 预览"
              : "最终PBR效果 · 近似预览"
            : (
                LAYERS.filter(function (r) {
                  return r.id === paintState.layer;
                })[0] || {
                  zh: paintState.layer,
                }
              ).zh + " · 可直接绘制";
  }
  function makeAlgorithmPanel() {
    ensureAlgorithm();
    var box = el("div", "pbr-algorithm-panel");
    box.setAttribute("data-editor-section", "algorithm");
    box.appendChild(el("div", "algo-title", "材质属性生成与尺寸调整"));
    box.appendChild(
      el(
        "div",
        "hint",
        "OP 导出带检测区的四分区 PNG  渲染龙导出分开的基色 凹凸和材质图及注册文件  预览与下载同步",
      ),
    );
    var targetNote = el("div", "hint", "");
    targetNote.setAttribute("data-target-help", "1");
    box.appendChild(targetNote);
    box.appendChild(
      el(
        "div",
        "hint",
        "不按方块名称分类。当前纹理自身决定结构，参数拖动时更新对应通道和合成预览  手绘图层单独保留 不关闭其他通道的实时更新。",
      ),
    );
    var stages = el("div", "paint-chips algo-stages");
    [
      ["color", "原色"],
      ["normal", "法线"],
      ["metal", "金属度"],
      ["emissive", "自发光"],
      ["roughness", "粗糙度"],
      ["sub", "次表面"],
      ["preview", "效果预览"],
    ].forEach(function (row) {
      var b = el("button", "scope", row[1]);
      b.type = "button";
      b.setAttribute("data-workflow-stage", row[0]);
      b.onclick = function () {
        setWorkflowStage(row[0]);
      };
      stages.appendChild(b);
    });
    box.appendChild(stages);
    var resRow = el("div", "algo-resolution-row");
    var resLab = el("label", "plain", "纹理分辨率  固定七档");
    var sel = document.createElement("select");
    sel.className = "search";
    sel.setAttribute("data-algo-resolution", "1");
    sel.style.margin = "0";
    sel.setAttribute("aria-label", "纹理分辨率");
    pbrAlgo().RESOLUTIONS.forEach(function (n) {
      var option = document.createElement("option");
      option.value = String(n);
      option.textContent = n + "X";
      sel.appendChild(option);
    });
    sel.value = String(paintState.algorithm.resolution || texW());
    sel.onchange = function () {
      paintState.algorithm.resolution = Number(sel.value);
      saveAlgorithmState();
    };
    resLab.appendChild(sel);
    resRow.appendChild(resLab);
    var one = el("button", "tb-btn paint-act", "调整当前纹理分辨率");
    one.type = "button";
    one.onclick = function () {
      upscaleCurrentTexture(Number(sel.value));
    };
    resRow.appendChild(one);
    var all = el("button", "tb-btn paint-act", "全部纹理调整为此尺寸");
    all.type = "button";
    all.setAttribute("data-need-pack", "1");
    all.onclick = function () {
      upscaleAllTextures(Number(sel.value));
    };
    resRow.appendChild(all);
    box.appendChild(resRow);
    var live = el("label", "check algo-live");
    var ck = document.createElement("input");
    ck.type = "checkbox";
    ck.setAttribute("data-algo-live", "1");
    ck.checked = !!paintState.algorithmLive;
    ck.onchange = function () {
      paintState.algorithmLive = ck.checked;
      if (!ck.checked) clearLiveAlgorithm();
      else scheduleAlgorithmRegenerate("__color_edit");
    };
    live.appendChild(ck);
    live.appendChild(document.createTextNode("实时联动参数与绘制"));
    box.appendChild(live);
    var normalPaint = el("div", "algo-normal-paint");
    normalPaint.appendChild(
      el("div", "plain", "整体法线方向 · 保留原有凹凸细节 只整体改变法线朝向"),
    );
    var normalRead = el(
      "div",
      "hint",
      "当前方向 " +
        String(paintState.normalBrushKey || "平面") +
        " · " +
        String(paintState.normalColor || "#8080ff").toUpperCase() +
        " · 会保留细节并整体改变法线朝向",
    );
    normalRead.setAttribute("data-normal-brush-readout", "1");
    normalPaint.appendChild(normalRead);
    var normalBtns = el("div", "paint-chips");
    [
      ["平面", 0, 0],
      ["左坡", -0.55, 0],
      ["右坡", 0.55, 0],
      ["上坡", 0, -0.55],
      ["下坡", 0, 0.55],
      ["左上", -0.42, -0.42],
      ["右上", 0.42, -0.42],
      ["左下", -0.42, 0.42],
      ["右下", 0.42, 0.42],
    ].forEach(function (row) {
      var b = el(
        "button",
        "scope" +
          (String(paintState.normalBrushKey || "平面") === row[0] ? " on" : ""),
        row[0],
      );
      b.type = "button";
      b.setAttribute("data-normal-brush", row[0]);
      b.onclick = function () {
        setNormalBrushVector(row[1], row[2], row[0]);
      };
      normalBtns.appendChild(b);
    });
    var invertBtn = el("button", "scope", "反转法线");
    invertBtn.type = "button";
    invertBtn.title = "将当前法线层的凹凸方向整体反转";
    invertBtn.onclick = invertNormalLayerGlobal;
    normalBtns.appendChild(invertBtn);
    normalPaint.appendChild(normalBtns);
    box.appendChild(normalPaint);
    function param(label, key, min, max, step) {
      var w = el("label", "algo-param");
      var head = el("span", "algo-param-head");
      head.appendChild(el("b", "", label));
      var val = el("code", "", Number(paintState.algorithm[key]).toFixed(2));
      val.setAttribute("data-algo-value", key);
      head.appendChild(val);
      w.appendChild(head);
      var r = document.createElement("input");
      r.type = "range";
      r.min = String(min);
      r.max = String(max);
      r.step = String(step);
      r.value = String(paintState.algorithm[key]);
      r.setAttribute("data-algo-param", key);
      r.onpointerdown = function () {
        if (!algorithmGesture) {
          snapshot();
          algorithmGesture = true;
        }
      };
      r.oninput = function () {
        if (!algorithmGesture) {
          snapshot();
          algorithmGesture = true;
        }
        paintState.algorithm[key] = Number(r.value);
        val.textContent = Number(r.value).toFixed(2);
        saveAlgorithmState();
        scheduleAlgorithmRegenerate(key);
      };
      r.onchange = function () {
        flushLiveAlgorithm();
        algorithmGesture = false;
      };
      r.onpointerup = function () {
        flushLiveAlgorithm();
        algorithmGesture = false;
      };
      r.onblur = function () {
        flushLiveAlgorithm();
        algorithmGesture = false;
      };
      w.appendChild(r);
      return w;
    }
    var grid = el("div", "algo-param-grid");
    [
      ["原色细节", "detailStrength", 0, 2, 0.01],
      ["原色凹凸烘焙", "colorRelief", 0, 1.2, 0.01],
      ["结构阈值", "structureThreshold", 0.02, 0.35, 0.005],
      ["结构平滑", "structureSmooth", 0, 1, 0.01],
      ["几何深度", "geometryDepth", 0, 3, 0.01],
      ["正方形倒角", "bevelWidth", 0, 0.5, 0.005],
      ["法线长度", "normalStrength", 0, 4, 0.01],
      ["法线对比", "normalContrast", 0.5, 3, 0.01],
      ["污渍抑制", "stainSuppression", 0, 1, 0.01],
      ["灰白增强", "grayWhiteGain", 1, 3, 0.01],
      ["粗糙对比", "roughnessContrast", 0, 3, 0.01],
      ["粗糙结构", "roughnessStructure", 0, 2, 0.01],
      ["自动金属", "metalnessAuto", 0, 1, 0.01],
      ["金属偏移", "metalnessBias", -1, 1, 0.01],
      ["发光阈值", "emissiveThreshold", 0.45, 0.98, 0.005],
      ["发光强度", "emissiveStrength", 0, 3, 0.01],
    ].forEach(function (row) {
      grid.appendChild(param(row[0], row[1], row[2], row[3], row[4]));
    });
    box.appendChild(grid);
    var actions = el("div", "paint-actions algo-actions");
    [
      [
        "重新生成当前层",
        function () {
          paintState.algorithmLive = true;
          regenerateActiveChannel(true);
        },
      ],
      ["生成当前法线与 RGB 属性", generateAllPbrChannels],
      ["确认当前层并下一步", nextWorkflowStage],
      ["批量生成材质属性", generateAllTexturesPbr],
    ].forEach(function (row) {
      var b = el("button", "tb-btn paint-act", row[0]);
      b.type = "button";
      b.onclick = row[1];
      actions.appendChild(b);
    });
    box.appendChild(actions);
    var scopeActions = el("div", "paint-actions algo-actions");
    [
      ["设为全局默认", setAlgorithmGlobalFromCurrent],
      ["当前纹理恢复全局", resetAlgorithmToGlobal],
    ].forEach(function (row) {
      var b = el("button", "tb-btn paint-act", row[0]);
      b.type = "button";
      b.onclick = row[1];
      scopeActions.appendChild(b);
    });
    box.appendChild(scopeActions);
    var io = el("div", "paint-actions algo-actions");
    [
      ["导出算法预设", exportAlgorithmPreset],
      [
        "导入算法预设",
        function () {
          importAlgorithmJson("preset");
        },
      ],
      ["导出项目修改项", exportAlgorithmProject],
      [
        "导入项目修改项",
        function () {
          importAlgorithmJson("project");
        },
      ],
    ].forEach(function (row) {
      var b = el("button", "tb-btn paint-act", row[0]);
      b.type = "button";
      b.onclick = row[1];
      io.appendChild(b);
    });
    box.appendChild(io);
    var metrics = el("div", "hint algo-metrics", "等待纹理分析");
    metrics.setAttribute("data-algo-metrics", "1");
    box.appendChild(metrics);
    return box;
  }
  function layerIsColor() {
    return paintState.layer === "color" || paintState.layer === "normal";
  }
  function paintColor() {
    if (layerIsColor()) {
      var rgb = hexRgb(
        paintState.layer === "normal"
          ? paintState.normalColor || "#8080ff"
          : paintState.color,
      );
      return [rgb[0], rgb[1], rgb[2], paintState.alpha];
    }
    var g = clamp(paintState.gray | 0, 0, 255);
    return [g, g, g, 255];
  }
  function makeBlankSheet() {
    var c = document.createElement("canvas");
    c.width = texW();
    c.height = texH();
    var ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, texW(), texH());
    return c;
  }
  function ensureSkinSheets() {
    if (
      !skinSheets.inner ||
      skinSheets.inner.width !== texW() ||
      skinSheets.inner.height !== texH()
    ) {
      skinSheets.inner = makeBlankSheet();
      skinSheets.outer = makeBlankSheet();
    }
  }
  function skinEditLayer() {
    return paintState.skinLayer === "outer" ? "outer" : "inner";
  }
  function skinSheetOf(layer) {
    ensureSkinSheets();
    return skinSheets[layer === "outer" ? "outer" : "inner"];
  }
  function copyUvToSheet(src, dest, layerName) {
    var ctx = dest.getContext("2d");
    ctx.clearRect(0, 0, texW(), texH());
    if (!src) return;
    SKIN_PARTS.forEach(function (row) {
      if (row[1] !== layerName) return;
      skinUvFaces(row[0], paintState.skinModel).forEach(function (b) {
        ctx.drawImage(src, b[0], b[1], b[2], b[3], b[0], b[1], b[2], b[3]);
      });
    });
  }
  function splitSkinSheets(from) {
    ensureSkinSheets();
    copyUvToSheet(from || layers.color, skinSheets.inner, "inner");
    copyUvToSheet(from || layers.color, skinSheets.outer, "outer");
  }
  function compositeSkinSheets() {
    if (!layers.color) return;
    ensureSkinSheets();
    var ctx = layers.color.getContext("2d");
    ctx.clearRect(0, 0, texW(), texH());
    if (paintState.skinShowInner) ctx.drawImage(skinSheets.inner, 0, 0);
    if (paintState.skinShowOuter && !skinClassic())
      ctx.drawImage(skinSheets.outer, 0, 0);
  }
  function officialLayerMask(layerName) {
    var keep = paintState.skinLayer,
      keepPart = paintState.skinPart;
    paintState.skinLayer = layerName;
    paintState.skinPart = "all";
    var mask = skinMask();
    paintState.skinLayer = keep;
    paintState.skinPart = keepPart;
    return mask;
  }
  function clipSheetToLayer(sheet, layerName) {
    if (!sheet) return;
    var mask = officialLayerMask(layerName);
    var ctx = sheet.getContext("2d");
    var img = ctx.getImageData(0, 0, texW(), texH());
    for (var i = 0; i < mask.length; i++) {
      if (mask[i]) continue;
      var o = i * 4;
      img.data[o] = img.data[o + 1] = img.data[o + 2] = img.data[o + 3] = 0;
    }
    ctx.putImageData(img, 0, 0);
  }
  function loadSheetPng(sheet, src, done) {
    if (!src) {
      if (done) done();
      return;
    }
    var img = new Image();
    img.onload = function () {
      var ctx = sheet.getContext("2d");
      ctx.clearRect(0, 0, texW(), texH());
      ctx.drawImage(img, 0, 0, texW(), texH());
      if (done) done();
    };
    img.src = src;
  }
  function activeCanvas() {
    if (isSkin() && paintState.layer === "color")
      return skinSheetOf(skinEditLayer());
    return layers[paintState.layer];
  }
  function activeCtx() {
    return activeCanvas().getContext("2d");
  }
  function markPainted() {
    manualEditRevision++;
    if (liveWorkerJob) stopLiveWorker(false);
    if (paintState.layer !== "color" && !isSkin()) {
      paintState.merMode = "mers";
      if (paintState.layer === "normal") paintState.bump = "normal";
      if (paintState.layer === "height") paintState.bump = "heightmap";
    }
    if (paintState.layer === "color") {
      paintState.painted.color = true;
      if (!paintState.adjustLiveRendering) resetLiveAdjustBase();
    } else if (paintState.layer === "normal") {
      paintState.painted.normal = true;
      invalidateNormalDirectionBase();
    } else if (paintState.layer === "height") {
      paintState.painted.height = true;
      invalidateNormalDirectionBase();
    } else {
      paintState.painted.mer = true;
      paintState.merMode = "mers";
    }
    markCurrentTextureTouched();
    scheduleAllLivePreviewSync();
    if (!paintState.regenerating && !isSkin()) {
      if (paintState.layer === "color") {
        algorithmColorSource = null;
        scheduleAlgorithmRegenerate("__color_edit");
      } else {
        delete paintState.liveChannels[paintState.layer];
        Object.keys(algorithmPendingKeys).forEach(function (k) {
          if (algorithmParameterTargets(k).indexOf(paintState.layer) >= 0)
            delete algorithmPendingKeys[k];
        });
        if (paintState.layer === "height")
          scheduleAlgorithmRegenerate("__height_edit");
      }
    }
    if (isSkin() && paintState.layer === "color") {
      clipSheetToLayer(skinSheetOf(skinEditLayer()), skinEditLayer());
      compositeSkinSheets();
    }
  }
  function snapshot() {
    paintState.undo.push(capture());
    if (paintState.undo.length > HISTORY_MAX) paintState.undo.shift();
    paintState.redo = [];
    markCurrentTextureTouched();
  }
  function restore(shot) {
    if (!shot) return;
    clearLiveAlgorithm();
    if (shot._algorithm)
      paintState.algorithm = Object.assign({}, shot._algorithm);
    if (shot._liveChannels)
      paintState.liveChannels = Object.assign({}, shot._liveChannels);
    algorithmColorSource = null;
    refreshAlgorithmPanel();
    if (shot._merMode != null) paintState.merMode = shot._merMode;
    if (shot._bump != null) paintState.bump = shot._bump;
    invalidateNormalDirectionBase();
    if (
      !isSkin() &&
      shot._sizeW &&
      shot._sizeH &&
      (shot._sizeW !== texW() || shot._sizeH !== texH())
    ) {
      paintState.sizeW = shot._sizeW;
      paintState.sizeH = shot._sizeH;
      paintState.sizePx = shot._sizeW;
      LAYERS.forEach(function (row) {
        if (layers[row.id]) {
          layers[row.id].width = paintState.sizeW;
          layers[row.id].height = paintState.sizeH;
        }
      });
      sizeView();
    }
    var n = 0;
    function afterLayers() {
      if (!shot.skin_inner && !shot.skin_outer) {
        if (isSkin()) splitSkinSheets();
        redraw();
        return;
      }
      ensureSkinSheets();
      var left = 2;
      function one() {
        left -= 1;
        if (left > 0) return;
        compositeSkinSheets();
        redraw();
      }
      loadSheetPng(skinSheets.inner, shot.skin_inner, one);
      loadSheetPng(skinSheets.outer, shot.skin_outer, one);
    }
    LAYERS.forEach(function (row) {
      var img = new Image();
      img.onload = function () {
        var ctx = layers[row.id].getContext("2d");
        ctx.clearRect(0, 0, texW(), texH());
        ctx.drawImage(img, 0, 0, texW(), texH());
        n += 1;
        if (n >= LAYERS.length) afterLayers();
      };
      img.src = shot[row.id];
    });
  }
  function undo() {
    if (!paintState.undo.length) {
      toast("没有可撤销的操作。最多保留 50 个历史步骤");
      return;
    }
    paintState.redo.push(capture());
    if (paintState.redo.length > HISTORY_MAX) paintState.redo.shift();
    restore(paintState.undo.pop());
    paintChrome();
    toast("已撤回 · 还能撤 " + paintState.undo.length + " 次");
  }
  function redo() {
    if (!paintState.redo.length) {
      toast("没有可重做的操作。最多保留 50 个历史步骤");
      return;
    }
    paintState.undo.push(capture());
    if (paintState.undo.length > HISTORY_MAX) paintState.undo.shift();
    restore(paintState.redo.pop());
    paintChrome();
    toast("已恢复 · 还能恢复 " + paintState.redo.length + " 次");
  }
  function resetPaint() {
    if (!paintState.origin) {
      toast("请先选择左侧纹理");
      return;
    }
    restore(paintState.origin);
    paintState.undo = [];
    paintState.redo = [];
    paintState.painted = {
      color: false,
      mer: false,
      height: false,
      normal: false,
    };
    paintChrome();
    redraw();
    toast("已恢复到本次打开纹理时的状态");
  }
  function capture() {
    var shot = {
      _sizeW: texW(),
      _sizeH: texH(),
      _merMode: paintState.merMode,
      _bump: paintState.bump,
      _algorithm: Object.assign({}, paintState.algorithm),
      _liveChannels: Object.assign({}, paintState.liveChannels),
    };
    var savedLayers = collectLayers();
    LAYERS.forEach(function (row) {
      shot[row.id] = savedLayers[row.id];
    });
    if (isSkin()) {
      ensureSkinSheets();
      shot.skin_inner = skinSheets.inner.toDataURL("image/png");
      shot.skin_outer = skinSheets.outer.toDataURL("image/png");
    }
    return shot;
  }
  function makeLayer(fill) {
    var c = document.createElement("canvas");
    c.width = texW();
    c.height = texH();
    var ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, texW(), texH());
    return c;
  }
  function resetLayers() {
    layers.color = isSkin() ? makeBlankSheet() : makeLayer(paintState.color);
    layers.normal = makeLayer("rgb(128,128,255)");
    layers.metal = makeLayer(
      "rgb(" +
        paintState.uniform.metal +
        "," +
        paintState.uniform.metal +
        "," +
        paintState.uniform.metal +
        ")",
    );
    layers.emissive = makeLayer(
      "rgb(" +
        paintState.uniform.emissive +
        "," +
        paintState.uniform.emissive +
        "," +
        paintState.uniform.emissive +
        ")",
    );
    layers.roughness = makeLayer(
      "rgb(" +
        paintState.uniform.roughness +
        "," +
        paintState.uniform.roughness +
        "," +
        paintState.uniform.roughness +
        ")",
    );
    layers.sub = makeLayer(
      "rgb(" +
        paintState.uniform.sub +
        "," +
        paintState.uniform.sub +
        "," +
        paintState.uniform.sub +
        ")",
    );
    layers.height = makeLayer("rgb(128,128,128)");
    trackMaterialLayers();
    paintState.painted = {
      color: false,
      mer: false,
      height: false,
      normal: false,
    };
    invalidateNormalDirectionBase();
    paintState.undo = [];
    paintState.redo = [];
    if (isSkin()) {
      skinSheets.inner = makeBlankSheet();
      skinSheets.outer = makeBlankSheet();
    } else {
      skinSheets.inner = null;
      skinSheets.outer = null;
    }
  }
  function loadLayer(id, src, done) {
    if (!src) {
      if (done) done();
      return;
    }
    var target = layers[id],
      token = textureLoadSerial;
    if (id === "normal") {
      Promise.resolve()
        .then(function () {
          var comma = src.indexOf(",");
          if (
            comma < 0 ||
            !/^data:image\/png;base64$/i.test(src.slice(0, comma))
          )
            throw new Error("法线图必须使用 PNG 数据");
          var raw = atob(src.slice(comma + 1)),
            bytes = new Uint8Array(raw.length);
          for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
          return (
            (parent && parent.RenderDragonPNG) ||
            window.RenderDragonPNG
          ).decode(bytes);
        })
        .then(function (raw) {
          if (token !== textureLoadSerial) return;
          var w = target.width,
            h = target.height,
            display = new Uint8ClampedArray(w * h * 4);
          for (var y = 0; y < h; y++)
            for (var x = 0; x < w; x++) {
              var a =
                  (Math.floor((y * raw.height) / h) * raw.width +
                    Math.floor((x * raw.width) / w)) *
                  4,
                b = (y * w + x) * 4;
              display[b] = raw.data[a];
              display[b + 1] = raw.data[a + 1];
              display[b + 2] = raw.data[a + 2];
              display[b + 3] = 255;
            }
          target
            .getContext("2d")
            .putImageData(new ImageData(display, w, h), 0, 0);
          loadedNormalData = {
            src: src,
            width: w,
            height: h,
            display: display,
            raw: raw,
          };
          if (done) done();
        })
        .catch(function (error) {
          if (token !== textureLoadSerial) return;
          paintState.loadError = "法线通道加载失败 " + error.message;
          toast(paintState.loadError);
          if (done) done();
        });
      return;
    }
    var img = new Image();
    img.onload = function () {
      if (token !== textureLoadSerial) return;
      var ctx = target.getContext("2d");
      ctx.clearRect(0, 0, target.width, target.height);
      ctx.drawImage(img, 0, 0, target.width, target.height);
      if (done) done();
    };
    img.onerror = function () {
      if (token !== textureLoadSerial) return;
      paintState.loadError = "纹理通道加载失败 " + id;
      toast(paintState.loadError);
      if (done) done();
    };
    img.src = src;
  }
  function bresenham(x0, y0, x1, y1, plot) {
    x0 |= 0;
    y0 |= 0;
    x1 |= 0;
    y1 |= 0;
    var dx = Math.abs(x1 - x0),
      sx = x0 < x1 ? 1 : -1;
    var dy = -Math.abs(y1 - y0),
      sy = y0 < y1 ? 1 : -1;
    var err = dx + dy;
    while (true) {
      plot(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  }
  function put(ctx, x, y, rgba) {
    if (x < 0 || y < 0 || x >= texW() || y >= texH()) return;
    var d = ctx.getImageData(x, y, 1, 1);
    d.data[0] = rgba[0];
    d.data[1] = rgba[1];
    d.data[2] = rgba[2];
    d.data[3] = rgba[3];
    ctx.putImageData(d, x, y);
  }
  function get(ctx, x, y) {
    if (x < 0 || y < 0 || x >= texW() || y >= texH()) return [0, 0, 0, 0];
    var d = ctx.getImageData(x, y, 1, 1).data;
    return [d[0], d[1], d[2], d[3]];
  }
  function stampBrush(ctx, cx, cy, rgba) {
    var r = Math.max(1, paintState.size | 0);
    var shape = paintState.shape;
    for (var y = -r; y <= r; y++) {
      for (var x = -r; x <= r; x++) {
        var ok = false;
        if (shape === "square")
          ok = Math.abs(x) <= r / 2 && Math.abs(y) <= r / 2;
        else if (shape === "slash")
          ok = Math.abs(x - y) <= 1 && Math.abs(x) <= r / 2;
        else if (shape === "backslash")
          ok = Math.abs(x + y) <= 1 && Math.abs(x) <= r / 2;
        else ok = x * x + y * y <= (r * r) / 4;
        if (ok) putSym(ctx, cx + x, cy + y, rgba);
      }
    }
  }
  function softStamp(ctx, cx, cy, rgba) {
    var r = Math.max(1, paintState.size | 0);
    var img = ctx.getImageData(0, 0, texW(), texH());
    var data = img.data;
    for (var y = -r; y <= r; y++) {
      for (var x = -r; x <= r; x++) {
        var px = cx + x,
          py = cy + y;
        if (px < 0 || py < 0 || px >= texW() || py >= texH()) continue;
        var d = Math.sqrt(x * x + y * y) / r;
        if (d > 1) continue;
        var a = (1 - d) * (rgba[3] / 255);
        var i = (py * texW() + px) * 4;
        data[i] = data[i] * (1 - a) + rgba[0] * a;
        data[i + 1] = data[i + 1] * (1 - a) + rgba[1] * a;
        data[i + 2] = data[i + 2] * (1 - a) + rgba[2] * a;
        data[i + 3] = Math.min(255, data[i + 3] + a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  function flood(ctx, x, y, rgba, globalFill) {
    var target = get(ctx, x, y);
    if (same(target, rgba)) return;
    if (globalFill) {
      var img = ctx.getImageData(0, 0, texW(), texH());
      for (var i = 0; i < img.data.length; i += 4) {
        if (
          img.data[i] === target[0] &&
          img.data[i + 1] === target[1] &&
          img.data[i + 2] === target[2] &&
          img.data[i + 3] === target[3]
        ) {
          img.data[i] = rgba[0];
          img.data[i + 1] = rgba[1];
          img.data[i + 2] = rgba[2];
          img.data[i + 3] = rgba[3];
        }
      }
      ctx.putImageData(img, 0, 0);
      return;
    }
    var stack = [[x, y]];
    var seen = {};
    while (stack.length) {
      var p = stack.pop();
      var key = p[0] + "," + p[1];
      if (seen[key]) continue;
      seen[key] = 1;
      if (!same(get(ctx, p[0], p[1]), target)) continue;
      put(ctx, p[0], p[1], rgba);
      stack.push(
        [p[0] + 1, p[1]],
        [p[0] - 1, p[1]],
        [p[0], p[1] + 1],
        [p[0], p[1] - 1],
      );
    }
  }
  function same(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  }
  function drawEllipse(ctx, x0, y0, x1, y1, rgba, fill) {
    var x = Math.min(x0, x1),
      y = Math.min(y0, y1);
    var w = Math.abs(x1 - x0),
      h = Math.abs(y1 - y0);
    var cx = x + w / 2,
      cy = y + h / 2,
      rx = w / 2,
      ry = h / 2;
    for (var py = y; py <= y + h; py++) {
      for (var px = x; px <= x + w; px++) {
        var nx = rx ? (px - cx) / rx : 0,
          ny = ry ? (py - cy) / ry : 0;
        var d = nx * nx + ny * ny;
        if (fill ? d <= 1 : d <= 1 && d >= 0.72) put(ctx, px | 0, py | 0, rgba);
      }
    }
  }
  function drawRect(ctx, x0, y0, x1, y1, rgba, fill) {
    var x = Math.min(x0, x1) | 0,
      y = Math.min(y0, y1) | 0;
    var w = Math.abs(x1 - x0) | 0,
      h = Math.abs(y1 - y0) | 0;
    if (fill) {
      for (var yy = 0; yy <= h; yy++)
        for (var xx = 0; xx <= w; xx++) put(ctx, x + xx, y + yy, rgba);
    } else {
      for (var i = 0; i <= w; i++) {
        put(ctx, x + i, y, rgba);
        put(ctx, x + i, y + h, rgba);
      }
      for (var j = 0; j <= h; j++) {
        put(ctx, x, y + j, rgba);
        put(ctx, x + w, y + j, rgba);
      }
    }
  }
  function drawRound(ctx, x0, y0, x1, y1, rgba, fill) {
    drawRect(ctx, x0, y0, x1, y1, rgba, fill);
  }
  function bezier(pts, t) {
    var u = 1 - t;
    return [
      u * u * u * pts[0][0] +
        3 * u * u * t * pts[1][0] +
        3 * u * t * t * pts[2][0] +
        t * t * t * pts[3][0],
      u * u * u * pts[0][1] +
        3 * u * u * t * pts[1][1] +
        3 * u * t * t * pts[2][1] +
        t * t * t * pts[3][1],
    ];
  }
  function drawCurve(ctx, pts, rgba) {
    var prev = pts[0];
    for (var i = 1; i <= 64; i++) {
      var p = bezier(pts, i / 64);
      bresenham(prev[0] | 0, prev[1] | 0, p[0] | 0, p[1] | 0, function (x, y) {
        stampBrush(ctx, x, y, rgba);
      });
      prev = p;
    }
  }
  function drawPoly(ctx, pts, rgba, fill) {
    if (pts.length < 2) return;
    for (var i = 1; i < pts.length; i++) {
      bresenham(
        pts[i - 1][0],
        pts[i - 1][1],
        pts[i][0],
        pts[i][1],
        function (x, y) {
          stampBrush(ctx, x, y, rgba);
        },
      );
    }
    bresenham(
      pts[pts.length - 1][0],
      pts[pts.length - 1][1],
      pts[0][0],
      pts[0][1],
      function (x, y) {
        stampBrush(ctx, x, y, rgba);
      },
    );
    if (fill && pts.length > 2)
      flood(ctx, centroid(pts)[0], centroid(pts)[1], rgba, false);
  }
  function centroid(pts) {
    var x = 0,
      y = 0;
    pts.forEach(function (p) {
      x += p[0];
      y += p[1];
    });
    return [(x / pts.length) | 0, (y / pts.length) | 0];
  }
  function ditherStamp(ctx, cx, cy, rgba) {
    var r = Math.max(1, paintState.size | 0);
    for (var y = -r; y <= r; y++) {
      for (var x = -r; x <= r; x++) {
        if (((cx + x + cy + y) & 1) === 0) put(ctx, cx + x, cy + y, rgba);
      }
    }
  }
  function noiseStamp(ctx, cx, cy, rgba) {
    var r = Math.max(1, paintState.size | 0);
    for (var i = 0; i < r * 6; i++) {
      var x = (cx + (Math.random() * 2 - 1) * r) | 0;
      var y = (cy + (Math.random() * 2 - 1) * r) | 0;
      put(ctx, x, y, rgba);
    }
  }
  function airbrush(ctx, cx, cy, rgba) {
    var r = Math.max(2, paintState.size | 0);
    for (var i = 0; i < r * 4; i++) {
      var ang = Math.random() * Math.PI * 2;
      var rad = Math.random() * r;
      put(
        ctx,
        (cx + Math.cos(ang) * rad) | 0,
        (cy + Math.sin(ang) * rad) | 0,
        rgba,
      );
    }
  }
  function dodgeBurn(ctx, cx, cy, up) {
    var r = Math.max(1, paintState.size | 0);
    var img = ctx.getImageData(0, 0, texW(), texH());
    for (var y = -r; y <= r; y++) {
      for (var x = -r; x <= r; x++) {
        var px = cx + x,
          py = cy + y;
        if (px < 0 || py < 0 || px >= texW() || py >= texH()) continue;
        if (x * x + y * y > r * r) continue;
        var i = (py * texW() + px) * 4;
        var d = up ? 12 : -12;
        img.data[i] = clamp(img.data[i] + d, 0, 255);
        img.data[i + 1] = clamp(img.data[i + 1] + d, 0, 255);
        img.data[i + 2] = clamp(img.data[i + 2] + d, 0, 255);
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  function smudgeAt(ctx, cx, cy, from) {
    if (!from) return;
    var src = get(ctx, from.x, from.y);
    softStamp(ctx, cx, cy, [src[0], src[1], src[2], 90]);
  }
  function gradientFill(ctx, x0, y0, x1, y1, rgba) {
    var img = ctx.getImageData(0, 0, texW(), texH());
    var dx = x1 - x0,
      dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var start = layerIsColor()
      ? hexRgb(paintState.color).concat([255])
      : [0, 0, 0, 255];
    for (var y = 0; y < texH(); y++) {
      for (var x = 0; x < texW(); x++) {
        var t = clamp(((x - x0) * dx + (y - y0) * dy) / (len * len), 0, 1);
        var i = (y * texW() + x) * 4;
        img.data[i] = start[0] * (1 - t) + rgba[0] * t;
        img.data[i + 1] = start[1] * (1 - t) + rgba[1] * t;
        img.data[i + 2] = start[2] * (1 - t) + rgba[2] * t;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  function eraseAt(ctx, x, y) {
    if (paintState.colorEraser && layerIsColor()) {
      colorEraseAt(ctx, x, y);
      return;
    }
    var rgba =
      paintState.layer === "color"
        ? [0, 0, 0, 0]
        : paintState.layer === "roughness"
          ? [255, 255, 255, 255]
          : paintState.layer === "height"
            ? [128, 128, 128, 255]
            : [0, 0, 0, 255];
    stampBrush(ctx, x, y, rgba);
  }
  function colorEraseAt(ctx, cx, cy) {
    var target = hexRgb(paintState.color);
    var r = Math.max(1, paintState.size | 0);
    var img = ctx.getImageData(0, 0, texW(), texH());
    var thr = 28;
    for (var y = -r; y <= r; y++) {
      for (var x = -r; x <= r; x++) {
        if (paintState.shape === "circle" && x * x + y * y > r * r) continue;
        var px = cx + x,
          py = cy + y;
        if (px < 0 || py < 0 || px >= texW() || py >= texH()) continue;
        var i = (py * texW() + px) * 4;
        if (
          Math.abs(img.data[i] - target[0]) <= thr &&
          Math.abs(img.data[i + 1] - target[1]) <= thr &&
          Math.abs(img.data[i + 2] - target[2]) <= thr
        ) {
          img.data[i] = 0;
          img.data[i + 1] = 0;
          img.data[i + 2] = 0;
          img.data[i + 3] = 0;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  function freeformToSelection(pts) {
    if (!pts || pts.length < 2) return null;
    var minX = pts[0][0],
      maxX = pts[0][0],
      minY = pts[0][1],
      maxY = pts[0][1];
    pts.forEach(function (p) {
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    });
    return {
      x: minX,
      y: minY,
      w: Math.max(1, maxX - minX + 1),
      h: Math.max(1, maxY - minY + 1),
      points: pts.slice(),
    };
  }
  function copySelection() {
    if (!selection || selection.w < 1 || selection.h < 1) {
      toast("先框选一块");
      return;
    }
    var ctx = activeCtx();
    var data = ctx.getImageData(
      selection.x,
      selection.y,
      selection.w,
      selection.h,
    );
    clipboard = {
      w: selection.w,
      h: selection.h,
      data: new Uint8ClampedArray(data.data),
      layer: paintState.layer,
    };
    toast("已复制选区");
  }
  function cutSelection() {
    if (!selection || selection.w < 1 || selection.h < 1) {
      toast("先框选一块");
      return;
    }
    snapshot();
    copySelection();
    var ctx = activeCtx();
    var rgba =
      paintState.layer === "color"
        ? [0, 0, 0, 0]
        : paintState.layer === "roughness"
          ? [255, 255, 255, 255]
          : paintState.layer === "height"
            ? [128, 128, 128, 255]
            : [0, 0, 0, 255];
    ctx.fillStyle = "rgba(" + rgba.join(",") + ")";
    ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
    if (paintState.layer !== "color") {
      ctx.fillStyle = "rgb(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + ")";
      ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
    }
    markPainted();
    redraw();
    toast("已剪切选区");
  }
  function pasteSelection() {
    if (!clipboard) {
      toast("剪贴板空着");
      return;
    }
    snapshot();
    var ctx = activeCtx();
    var img = ctx.createImageData(clipboard.w, clipboard.h);
    img.data.set(clipboard.data);
    var x = selection ? selection.x : 0;
    var y = selection ? selection.y : 0;
    ctx.putImageData(img, x, y);
    selection = {
      x: x,
      y: y,
      w: clipboard.w,
      h: clipboard.h,
    };
    markPainted();
    redraw();
    toast("已粘贴");
  }
  function clearSelection() {
    if (!selection || selection.w < 1 || selection.h < 1) {
      toast("先框选一块");
      return;
    }
    snapshot();
    var ctx = activeCtx();
    if (paintState.layer === "color")
      ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
    else {
      var rgba =
        paintState.layer === "roughness"
          ? [255, 255, 255, 255]
          : paintState.layer === "height"
            ? [128, 128, 128, 255]
            : [0, 0, 0, 255];
      ctx.fillStyle = "rgb(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + ")";
      ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
    }
    markPainted();
    redraw();
    toast("已清空选区");
  }
  function posFromEvent(ev) {
    var rect = view.getBoundingClientRect();
    var x = ((ev.clientX - rect.left) / paintState.zoom) | 0;
    var y = ((ev.clientY - rect.top) / paintState.zoom) | 0;
    return {
      x: clamp(x, 0, texW() - 1),
      y: clamp(y, 0, texH() - 1),
    };
  }
  function applyTool(kind, p, ev) {
    var ctx = activeCtx();
    var rgba = paintColor();
    if (paintState.tool === "pick") {
      var c = get(ctx, p.x, p.y);
      if (layerIsColor()) {
        if (paintState.layer === "normal")
          paintState.normalColor = rgbHex(c[0], c[1], c[2]);
        else paintState.color = rgbHex(c[0], c[1], c[2]);
        paintState.alpha = c[3];
      } else paintState.gray = c[0];
      toast(
        layerIsColor()
          ? "已吸色 " +
              (
                (paintState.layer === "normal"
                  ? paintState.normalColor
                  : paintState.color) || ""
              ).toUpperCase()
          : "已吸灰阶 " + (paintState.gray | 0),
      );
      paintChrome();
      return;
    }
    if (kind === "down" && ev && ev.altKey) {
      var cAlt = get(ctx, p.x, p.y);
      if (layerIsColor()) {
        if (paintState.layer === "normal")
          paintState.normalColor = rgbHex(cAlt[0], cAlt[1], cAlt[2]);
        else paintState.color = rgbHex(cAlt[0], cAlt[1], cAlt[2]);
        paintState.alpha = cAlt[3];
      } else paintState.gray = cAlt[0];
      toast(
        layerIsColor()
          ? "Alt吸色 " +
              (
                (paintState.layer === "normal"
                  ? paintState.normalColor
                  : paintState.color) || ""
              ).toUpperCase()
          : "Alt吸灰 " + (paintState.gray | 0),
      );
      paintChrome();
      return;
    }
    if (paintState.tool === "hand" || (spaceDown && kind !== "up")) {
      if (kind === "move" && last) {
        paintState.panX += (p.x - last.x) * paintState.zoom;
        paintState.panY += (p.y - last.y) * paintState.zoom;
        applyPan();
      }
      last = p;
      return;
    }
    if (paintState.tool === "flip_h") {
      if (kind === "down") flipLayer(true);
      return;
    }
    if (paintState.tool === "flip_v") {
      if (kind === "down") flipLayer(false);
      return;
    }
    if (paintState.tool === "move_sel") {
      if (kind === "down") {
        if (!selection || selection.w < 1) {
          toast("先框选再移选区");
          return;
        }
        snapshot();
        moveSelShot = {
          x: selection.x,
          y: selection.y,
          w: selection.w,
          h: selection.h,
          full: ctx.getImageData(0, 0, texW(), texH()),
          clip: ctx.getImageData(
            selection.x,
            selection.y,
            selection.w,
            selection.h,
          ),
        };
        if (paintState.layer === "color")
          ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
        else {
          ctx.fillStyle = "rgb(0,0,0)";
          ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
        }
        moveSelShot.full = ctx.getImageData(0, 0, texW(), texH());
        ctx.putImageData(moveSelShot.clip, selection.x, selection.y);
      } else if (kind === "move" && moveSelShot && dragOrigin) {
        moveSelectionBy(p.x - dragOrigin.x, p.y - dragOrigin.y);
      }
      last = p;
      return;
    }
    if (paintState.tool === "zoom") {
      setZoom(ev && ev.shiftKey ? paintState.zoom / 2 : paintState.zoom * 2);
      return;
    }
    if (kind === "down") {
      snapshot();
      if (paintState.tool === "select_free") paintState.polyPts = [[p.x, p.y]];
      if (ev && ev.button === 2 && paintState.tool === "eraser")
        paintState.colorEraser = true;
      if (
        STROKE_TOOLS.indexOf(paintState.tool) >= 0 &&
        (paintState.tool === "pencil" ||
          (paintState.pixelPerfect &&
            paintState.size <= 1 &&
            paintState.tool === "eraser"))
      ) {
        strokeBase = ctx.getImageData(0, 0, texW(), texH());
        strokePts = [
          {
            x: p.x,
            y: p.y,
          },
        ];
        redrawStrokeFromBase(ctx, rgba);
        markPainted();
        last = p;
        redraw();
        return;
      }
    }
    markPainted();
    if (paintState.tool === "pencil") {
      if (strokeBase) {
        strokePts.push({
          x: p.x,
          y: p.y,
        });
        redrawStrokeFromBase(ctx, rgba);
      } else putSym(ctx, p.x, p.y, rgba);
    } else if (paintState.tool === "brush") stampBrush(ctx, p.x, p.y, rgba);
    else if (paintState.tool === "soft") softStamp(ctx, p.x, p.y, rgba);
    else if (paintState.tool === "airbrush" || paintState.tool === "spray") {
      mirrorPoints(p.x, p.y).forEach(function (mp) {
        airbrush(ctx, mp[0], mp[1], rgba);
      });
    } else if (paintState.tool === "noise") {
      mirrorPoints(p.x, p.y).forEach(function (mp) {
        noiseStamp(ctx, mp[0], mp[1], rgba);
      });
    } else if (paintState.tool === "dither" || paintState.tool === "checker") {
      mirrorPoints(p.x, p.y).forEach(function (mp) {
        ditherStamp(ctx, mp[0], mp[1], rgba);
      });
    } else if (paintState.tool === "eraser") {
      if (strokeBase) {
        strokePts.push({
          x: p.x,
          y: p.y,
        });
        redrawStrokeFromBase(ctx, rgba);
      } else
        mirrorPoints(p.x, p.y).forEach(function (mp) {
          eraseAt(ctx, mp[0], mp[1]);
        });
    } else if (paintState.tool === "dodge")
      mirrorPoints(p.x, p.y).forEach(function (mp) {
        dodgeBurn(ctx, mp[0], mp[1], true);
      });
    else if (paintState.tool === "burn")
      mirrorPoints(p.x, p.y).forEach(function (mp) {
        dodgeBurn(ctx, mp[0], mp[1], false);
      });
    else if (paintState.tool === "smudge") smudgeAt(ctx, p.x, p.y, last);
    else if (paintState.tool === "fill") flood(ctx, p.x, p.y, rgba, false);
    else if (paintState.tool === "fill_all" || paintState.tool === "replace")
      flood(ctx, p.x, p.y, rgba, true);
    else if (paintState.tool === "flood") {
      ctx.fillStyle = "rgba(" + rgba.join(",") + ")";
      ctx.fillRect(0, 0, texW(), texH());
    } else if (paintState.tool === "text" && kind === "down") {
      var word = window.prompt("输入文字", "");
      if (word) {
        ctx.fillStyle = "rgba(" + rgba.join(",") + ")";
        ctx.font = Math.max(6, paintState.size * 4) + "px sans-serif";
        ctx.fillText(word, p.x, p.y + 8);
      }
    } else if (paintState.tool === "poly" && kind === "down") {
      paintState.polyPts.push([p.x, p.y]);
      if (ev && ev.detail === 2) {
        drawPoly(ctx, paintState.polyPts, rgba, paintState.fillShape);
        paintState.polyPts = [];
      }
    } else if (paintState.tool === "curve" && kind === "down") {
      paintState.curvePts.push([p.x, p.y]);
      if (paintState.curvePts.length === 4) {
        drawCurve(ctx, paintState.curvePts, rgba);
        paintState.curvePts = [];
      }
    } else if (paintState.tool === "select_free" && kind === "move") {
      paintState.polyPts.push([p.x, p.y]);
    }
    if (last && STROKE_TOOLS.indexOf(paintState.tool) >= 0 && !strokeBase) {
      bresenham(last.x, last.y, p.x, p.y, function (x, y) {
        if (paintState.tool === "pencil") putSym(ctx, x, y, rgba);
        else if (paintState.tool === "eraser")
          mirrorPoints(x, y).forEach(function (mp) {
            eraseAt(ctx, mp[0], mp[1]);
          });
        else if (paintState.tool === "soft") softStamp(ctx, x, y, rgba);
        else if (paintState.tool === "airbrush" || paintState.tool === "spray")
          airbrush(ctx, x, y, rgba);
        else if (paintState.tool === "noise") noiseStamp(ctx, x, y, rgba);
        else if (paintState.tool === "dither" || paintState.tool === "checker")
          ditherStamp(ctx, x, y, rgba);
        else if (paintState.tool === "dodge") dodgeBurn(ctx, x, y, true);
        else if (paintState.tool === "burn") dodgeBurn(ctx, x, y, false);
        else if (paintState.tool === "smudge") smudgeAt(ctx, x, y, last);
        else stampBrush(ctx, x, y, rgba);
      });
    }
    last = p;
    redraw();
  }
  function finishDrag(p) {
    if (!dragging) return;
    var ctx = activeCtx();
    var rgba = paintColor();
    var a = dragOrigin || last || p;
    p = p || last || a;
    if (paintState.tool === "line")
      bresenham(a.x, a.y, p.x, p.y, function (x, y) {
        stampBrush(ctx, x, y, rgba);
      });
    else if (paintState.tool === "rect")
      drawRect(ctx, a.x, a.y, p.x, p.y, rgba, paintState.fillShape);
    else if (paintState.tool === "ellipse")
      drawEllipse(ctx, a.x, a.y, p.x, p.y, rgba, paintState.fillShape);
    else if (paintState.tool === "round")
      drawRound(ctx, a.x, a.y, p.x, p.y, rgba, paintState.fillShape);
    else if (paintState.tool === "gradient")
      gradientFill(ctx, a.x, a.y, p.x, p.y, rgba);
    else if (paintState.tool === "select")
      selection = {
        x: Math.min(a.x, p.x),
        y: Math.min(a.y, p.y),
        w: Math.abs(p.x - a.x) + 1,
        h: Math.abs(p.y - a.y) + 1,
      };
    else if (paintState.tool === "select_free") {
      if (!paintState.polyPts.length) paintState.polyPts = [[a.x, a.y]];
      paintState.polyPts.push([p.x, p.y]);
      selection = freeformToSelection(paintState.polyPts);
      paintState.polyPts = [];
      toast(selection ? "自由选区已创建" : "自由选区路径过短");
    }
    if (DRAG_PREVIEW.indexOf(paintState.tool) >= 0) markPainted();
    strokeBase = null;
    strokePts = [];
    moveSelShot = null;
    redraw();
  }
  function sizeView() {
    if (!view || !viewCtx) return;
    paintState.zoom = clamp(Number(paintState.zoom) || 1, ZOOM_MIN, ZOOM_MAX);
    var dpr = Math.max(1, Math.round(global.devicePixelRatio || 1));
    var cssW = Math.max(1, viewCssW());
    var cssH = Math.max(1, viewCssH());
    view.width = Math.max(1, Math.round(cssW * dpr));
    view.height = Math.max(1, Math.round(cssH * dpr));
    view.style.width = cssW + "px";
    view.style.height = cssH + "px";
    view.style.imageRendering = "pixelated";
    viewCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    crispCtx(viewCtx);
    applyPan();
    centerViewInFixedWorkbench();
  }
  function drawDragPreview() {
    if (!dragging || !dragOrigin || !last || !viewCtx) return;
    if (DRAG_PREVIEW.indexOf(paintState.tool) < 0) return;
    var z = paintState.zoom;
    var ax = dragOrigin.x * z + 0.5,
      ay = dragOrigin.y * z + 0.5;
    var bx = last.x * z + 0.5,
      by = last.y * z + 0.5;
    viewCtx.save();
    viewCtx.strokeStyle = "rgba(120,200,255,.95)";
    viewCtx.lineWidth = 1;
    viewCtx.setLineDash([4, 3]);
    if (paintState.tool === "line" || paintState.tool === "gradient") {
      viewCtx.beginPath();
      viewCtx.moveTo(ax, ay);
      viewCtx.lineTo(bx, by);
      viewCtx.stroke();
    } else if (
      paintState.tool === "select" ||
      paintState.tool === "rect" ||
      paintState.tool === "round"
    ) {
      var x = Math.min(ax, bx),
        y = Math.min(ay, by);
      viewCtx.strokeRect(x, y, Math.abs(bx - ax), Math.abs(by - ay));
    } else if (paintState.tool === "ellipse") {
      var rx = Math.abs(bx - ax) / 2,
        ry = Math.abs(by - ay) / 2;
      viewCtx.beginPath();
      viewCtx.ellipse(
        (ax + bx) / 2,
        (ay + by) / 2,
        Math.max(1, rx),
        Math.max(1, ry),
        0,
        0,
        Math.PI * 2,
      );
      viewCtx.stroke();
    } else if (
      paintState.tool === "select_free" &&
      paintState.polyPts.length > 1
    ) {
      viewCtx.beginPath();
      viewCtx.moveTo(
        paintState.polyPts[0][0] * z + 0.5,
        paintState.polyPts[0][1] * z + 0.5,
      );
      for (var i = 1; i < paintState.polyPts.length; i++) {
        viewCtx.lineTo(
          paintState.polyPts[i][0] * z + 0.5,
          paintState.polyPts[i][1] * z + 0.5,
        );
      }
      viewCtx.stroke();
    }
    viewCtx.restore();
  }
  function redraw(skipSync) {
    if (!viewCtx) return;
    crispCtx(viewCtx);
    var cssW = viewCssW();
    var cssH = viewCssH();
    var z = Number(paintState.zoom) || 1;
    // 保持显示画布本身透明，让 .paint-view 的棋盘背景只从真正透明的纹理像素中透出。
    viewCtx.clearRect(0, 0, cssW, cssH);
    var previewMode =
      (paintState.workflowStage === "preview" ||
        paintState.workflowStage === "fio") &&
      !isSkin();
    var src = activeCanvas();
    if (previewMode) {
      var pf =
        paintState.workflowStage === "fio"
          ? canvasFrame(fourInOneCanvas(512))
          : pbrPreviewFrame(
              Math.min(512, Math.max(128, Math.max(texW(), texH()))),
            );
      if (pf) {
        var pc = document.createElement("canvas");
        pc.width = pf.width;
        pc.height = pf.height;
        pc.getContext("2d").putImageData(frameImageData(pf), 0, 0);
        viewCtx.imageSmoothingEnabled = false;
        if (
          paintState.workflowStage === "fio" &&
          selectedTarget() === "renderdragon"
        ) {
          var groupScale = Math.min(cssW / pc.width, cssH / pc.height),
            groupW = pc.width * groupScale,
            groupH = pc.height * groupScale;
          viewCtx.drawImage(
            pc,
            0,
            0,
            pc.width,
            pc.height,
            (cssW - groupW) / 2,
            (cssH - groupH) / 2,
            groupW,
            groupH,
          );
        } else
          viewCtx.drawImage(pc, 0, 0, pc.width, pc.height, 0, 0, cssW, cssH);
      }
    } else {
      crispCtx(src.getContext("2d"));
      if (
        ["emissive", "roughness", "metal", "sub"].indexOf(paintState.layer) >= 0
      ) {
        drawFrameScaled(
          viewCtx,
          displayFrameForStage(paintState.layer, canvasFrame(src)),
          0,
          0,
          cssW,
          cssH,
        );
      } else {
        viewCtx.drawImage(src, 0, 0, texW(), texH(), 0, 0, cssW, cssH);
      }
    }
    if (!previewMode && z >= 8) {
      viewCtx.strokeStyle = "rgba(255,255,255,.12)";
      viewCtx.lineWidth = 1;
      for (var i = 0; i <= texW(); i++) {
        viewCtx.beginPath();
        viewCtx.moveTo(i * z, 0);
        viewCtx.lineTo(i * z, cssH);
        viewCtx.stroke();
      }
      for (var j = 0; j <= texH(); j++) {
        viewCtx.beginPath();
        viewCtx.moveTo(0, j * z);
        viewCtx.lineTo(cssW, j * z);
        viewCtx.stroke();
      }
    }
    if (!previewMode && selection && selection.w > 0 && selection.h > 0) {
      viewCtx.strokeStyle = "rgba(255,220,80,.9)";
      viewCtx.lineWidth = 1;
      viewCtx.strokeRect(
        selection.x * z,
        selection.y * z,
        selection.w * z,
        selection.h * z,
      );
    }
    if (!previewMode) {
      drawSkinGuides();
      drawDragPreview();
    }
    paintLit();
    drawSkinPreview();
    // 统一由同一帧刷新侧边预览和纹理列表，避免两套刷新顺序造成一边新一边旧。
    if (paintState.loaded && !skipSync) scheduleAllLivePreviewSync();
  }
  function drawSkinGuides() {
    if (
      !isSkin() ||
      !viewCtx ||
      paintState.layer !== "color" ||
      !paintState.skinShowGuides
    )
      return;
    var z = Number(paintState.zoom) || 1;
    var picked = selectedSkinParts();
    viewCtx.save();
    viewCtx.lineWidth = 1;
    SKIN_PARTS.forEach(function (row) {
      var id = row[0],
        layer = row[1];
      var faces = skinUvFaces(id, paintState.skinModel);
      if (!faces.length) return;
      var on = picked.indexOf(id) >= 0;
      viewCtx.strokeStyle = on
        ? "rgba(255,220,80,.95)"
        : layer === "outer"
          ? "rgba(220,90,200,.5)"
          : "rgba(80,200,255,.55)";
      faces.forEach(function (b) {
        viewCtx.strokeRect(b[0] * z + 0.5, b[1] * z + 0.5, b[2] * z, b[3] * z);
      });
    });
    viewCtx.restore();
  }
  function paintLit() {
    if (!litView) return;
    litView.style.display = isSkin() ? "none" : "";
    var f = pbrPreviewFrame(240);
    if (!f) return;
    litView.width = f.width;
    litView.height = f.height;
    litView.getContext("2d").putImageData(frameImageData(f), 0, 0);
  }
  function toast(msg) {
    if (api.toast) api.toast(msg);
  }
  var paintProgressMask = null;
  var paintProgressTitle = null;
  var paintProgressDetail = null;
  var paintProgressPct = null;
  var paintProgressRemain = null;
  var paintProgressBar = null;
  var paintProgressTimer = 0;
  var paintProgressValue = 0;
  function ensurePaintProgressUi() {
    if (paintProgressMask) return;
    paintProgressMask = el("div", "paint-progress-mask");
    var card = el("div", "paint-progress-card");
    paintProgressTitle = el("div", "paint-progress-title", "处理中");
    paintProgressDetail = el("div", "paint-progress-detail", "准备中");
    var meta = el("div", "paint-progress-meta");
    meta.appendChild(el("span", "", "保存 / 导出进度"));
    var metaRight = el("span", "", "");
    paintProgressPct = el("b", "", "0%");
    paintProgressRemain = el("span", "", " · 剩余 100%");
    metaRight.appendChild(paintProgressPct);
    metaRight.appendChild(paintProgressRemain);
    meta.appendChild(metaRight);
    var track = el("div", "paint-progress-track");
    paintProgressBar = el("div", "paint-progress-bar");
    track.appendChild(paintProgressBar);
    card.appendChild(paintProgressTitle);
    card.appendChild(paintProgressDetail);
    card.appendChild(meta);
    card.appendChild(track);
    paintProgressMask.appendChild(card);
    document.body.appendChild(paintProgressMask);
  }
  function setPaintProgress(value, detail) {
    ensurePaintProgressUi();
    paintProgressValue = clamp(Math.round(Number(value) || 0), 0, 100);
    paintProgressMask.classList.add("show");
    if (detail != null) paintProgressDetail.textContent = String(detail);
    paintProgressPct.textContent = "已完成 " + paintProgressValue + "%";
    if (paintProgressRemain)
      paintProgressRemain.textContent =
        " · 剩余 " + (100 - paintProgressValue) + "%";
    paintProgressBar.style.width = paintProgressValue + "%";
  }
  function startPaintProgress(title, detail) {
    ensurePaintProgressUi();
    clearInterval(paintProgressTimer);
    paintProgressTitle.textContent = title || "处理中";
    setPaintProgress(4, detail || "准备中");
    paintProgressTimer = setInterval(function () {
      var next = paintProgressValue + (paintProgressValue < 30 ? 2 : 1);
      if (next > 88) next = 88;
      if (next !== paintProgressValue)
        setPaintProgress(next, "正在等待文件系统完成当前步骤");
    }, 260);
  }
  function finishPaintProgress(detail) {
    ensurePaintProgressUi();
    clearInterval(paintProgressTimer);
    setPaintProgress(100, detail || "已完成");
    setTimeout(function () {
      if (paintProgressMask) paintProgressMask.classList.remove("show");
    }, 240);
  }
  function abortPaintProgress(detail) {
    ensurePaintProgressUi();
    clearInterval(paintProgressTimer);
    if (detail)
      setPaintProgress(Math.min(96, Math.max(8, paintProgressValue)), detail);
    setTimeout(function () {
      if (paintProgressMask) paintProgressMask.classList.remove("show");
    }, 320);
  }
  function withPaintProgress(title, runner) {
    startPaintProgress(title, "准备中");
    return Promise.resolve()
      .then(function () {
        return runner(function (v, detail) {
          setPaintProgress(v, detail);
        });
      })
      .then(
        function (result) {
          finishPaintProgress("已完成");
          return result;
        },
        function (err) {
          abortPaintProgress("操作失败");
          throw err;
        },
      );
  }
  var pendingFlush = null;
  var textureLoadSerial = 0;
  var textureRequestSerial = 0;
  var textureLoading = Promise.resolve();
  var finishTextureLoading = null;
  function onTextureReady(action) {
    var token = textureLoadSerial;
    return textureLoading.then(function () {
      if (
        token !== textureLoadSerial ||
        !paintState.loaded ||
        paintState.loadError
      )
        return;
      return action();
    });
  }
  function generateNormalChannel() {
    if (paintState.loading) return onTextureReady(generateNormalChannel);
    if (!paintState.loaded || isSkin()) return;
    snapshot();
    paintState.workflowStage = "normal";
    paintState.layer = "normal";
    paintState.algorithmLive = true;
    regenerateActiveChannel(true);
    toast("已生成法线与辅助高度  游戏中使用独立法线图");
  }
  function isDirty() {
    return (
      !!paintState.loaded &&
      !!(
        paintState.undo.length ||
        (paintState.painted &&
          (paintState.painted.color ||
            paintState.painted.mer ||
            paintState.painted.height ||
            paintState.painted.normal)) ||
        (paintState.origin &&
          (paintState.origin._merMode !== paintState.merMode ||
            paintState.origin._bump !== paintState.bump))
      )
    );
  }
  function contentVersion() {
    return [
      textureLoadSerial,
      liveLayerMutationRevision,
      paintState.merMode,
      paintState.bump,
      JSON.stringify(paintState.algorithm),
      paintState.exportFioUsePbrColor,
    ].join("|");
  }
  function flushPending() {
    if (pendingFlush) return pendingFlush;
    pendingFlush = (async function () {
      var lastDoc = {
        ok: true,
        unchanged: true,
      };
      while (true) {
        var expected;
        do {
          expected = textureLoading;
          await expected;
        } while (expected !== textureLoading);
        if (paintState.loadError)
          return {
            ok: false,
            reason: paintState.loadError,
          };
        await flushLiveAlgorithm();
        if (!isDirty()) return lastDoc;
        if (!api.deskCall)
          return {
            ok: false,
            reason: "材质桥接未就绪",
          };
        if (!paintState.packOpen || isSkin())
          return {
            ok: false,
            reason: "当前内容需要先保存到材质库或导出 PNG",
          };
        var payload = paintPayload(),
          version = contentVersion(),
          token = textureLoadSerial;
        lastDoc = await api.deskCall("paint_save", payload);
        if (!lastDoc || !lastDoc.ok) return lastDoc;
        if (token !== textureLoadSerial)
          return {
            ok: false,
            reason: "暂存期间纹理已切换  不会清除新纹理的修改",
          };
        // 异步保存时继续绘制不能被旧请求误标记为已经保存
        if (
          version === contentVersion() &&
          !Object.keys(algorithmPendingKeys).length
        ) {
          markSaved("pack");
          return lastDoc;
        }
      }
    })().finally(function () {
      pendingFlush = null;
    });
    return pendingFlush;
  }
  function confirmLeave(next) {
    if (!isDirty()) {
      Promise.resolve(textureLoading).then(next);
      return;
    }
    if (paintState.packOpen && !isSkin()) {
      flushPending().then(function (doc) {
        if (doc && doc.ok) next();
        else toast((doc && doc.reason) || "暂存失败");
      });
      return;
    }
    if (window.confirm("当前纹理存在未保存修改  是否放弃修改并重新打开"))
      next();
  }
  function resetWorkspaceTexture() {
    if (!paintState.rel || !paintState.packOpen)
      return toast("请先选择当前工作区中的纹理");
    if (
      !window.confirm(
        "恢复当前纹理到打开工作区时的状态  此纹理的改动将不再下载",
      )
    )
      return;
    api
      .deskCall("reset_texture", {
        rel: paintState.rel,
      })
      .then(function (doc) {
        if (!doc || !doc.ok) return toast((doc && doc.reason) || "恢复失败");
        paintState.undo = [];
        paintState.redo = [];
        paintState.painted = {};
        return api
          .deskCall("texture_get", {
            rel: paintState.rel,
            kind: paintState.kind,
            stem: paintState.stem,
          })
          .then(function (d) {
            if (d && d.ok) afterLoad(d, false);
          });
      });
  }
  function painterVisible() {
    var panel = parent.document.getElementById("painterOverlay");
    return !document.hidden && (!panel || !panel.hidden);
  }
  function suggestName() {
    if (paintState.fromRef || isSkin()) return paintState.stem || "skin";
    var base = paintState.stem || paintState.zh || "mat";
    var look = "";
    if (
      (paintState.uniform.metal || 0) >= 200 &&
      (paintState.uniform.roughness || 0) <= 40
    )
      look = "_mirror";
    else if ((paintState.uniform.emissive || 0) >= 160) look = "_glow";
    else if ((paintState.uniform.sub || 0) >= 120) look = "_sss";
    else if ((paintState.uniform.roughness || 0) >= 180) look = "_matte";
    return look ? base + look : base;
  }
  function fillName(force) {
    var name = paintState.libName || suggestName();
    var nodes = paintQueryAll("[data-lib-name]");
    if (!nodes.length) return;
    nodes.forEach(function (inp) {
      if (force || paintState.nameAuto || !inp.value) {
        inp.value = name;
        paintState.nameAuto = true;
      }
    });
    if (force || paintState.nameAuto) paintState.libName = name;
  }
  function toolZh(id) {
    for (var i = 0; i < TOOLS.length; i++) {
      if (TOOLS[i].id === id) return TOOLS[i].zh;
    }
    return id || "笔";
  }
  function toolNature(id) {
    var map = {
      select_free: "拖出不规则范围，松手成选区",
      select: "拖方框选区，可剪切复制粘贴",
      move_sel: "拖动已有选区（先方选/套索）",
      hand: "抓手平移画布，也可按住空格拖",
      pencil: "像素笔；像素精确开时去掉直角拐点",
      brush: "按粗细和笔头形状盖章；对称开时左右/上下镜像",
      soft: "边缘发虚的软笔",
      airbrush: "随机撒点喷枪，拖动能连喷",
      spray: "更稀的喷雾",
      eraser: paintState.colorEraser
        ? "颜色匹配橡皮：只擦接近画笔色的像素"
        : "标准橡皮：擦成透明/默认灰",
      fill: "油漆桶：连通同色区域",
      fill_all: "整张图里同色全换",
      flood: "整层直接涂满",
      line: "拖出直线，松手落笔",
      curve: "点 4 下画贝塞尔曲线",
      rect: "拖方框" + (paintState.fillShape ? "（填实）" : "（描边）"),
      ellipse: "拖椭圆" + (paintState.fillShape ? "（填实）" : "（描边）"),
      poly: "逐点多边形，双击闭合",
      round: "圆角方框" + (paintState.fillShape ? "（填实）" : "（描边）"),
      noise: "随机噪点",
      dither: "棋盘网纹",
      checker: "棋盘点",
      dodge: "提亮像素",
      burn: "压暗像素",
      smudge: "把颜色往拖的方向抹",
      replace: "同色全换（替换色）",
      gradient: "从起点到终点渐变",
      pick: "点一下画布吸色到画笔（快捷键 I；任意笔按住 Alt 点也可吸）",
      zoom: "点放大，Shift+点缩小",
      text: "点一下输入文字",
      flip_h: "水平翻转当前层",
      flip_v: "垂直翻转当前通道",
    };
    return map[id] || "当前工具";
  }
  function brushPropsText() {
    var shapeZh = "圆";
    BRUSH_SHAPES.forEach(function (sh) {
      if (sh.id === paintState.shape) shapeZh = sh.zh;
    });
    var colorPart = layerIsColor()
      ? "色 " +
        (paintState.color || "#000000").toUpperCase() +
        " α" +
        (paintState.alpha | 0)
      : "灰阶 " + (paintState.gray | 0);
    var bits = [
      "工具 " + toolZh(paintState.tool),
      "笔刷大小 " + (paintState.size | 0),
      "笔刷形状 " + shapeZh,
      colorPart,
      "缩放 " + zoomLabel(paintState.zoom) + "×",
    ];
    if (paintState.fillShape) bits.push("填充形状");
    if (paintState.colorEraser) bits.push("颜色匹配橡皮已启用");
    if (paintState.pixelPerfect) bits.push("像素精确模式");
    if (paintState.symmetry && paintState.symmetry !== "none")
      bits.push(
        "对称" +
          ({
            h: "左右",
            v: "上下",
            both: "四向",
          }[paintState.symmetry] || paintState.symmetry),
      );
    bits.push(
      "通道 " +
        (
          LAYERS.filter(function (r) {
            return r.id === paintState.layer;
          })[0] || {
            zh: paintState.layer,
          }
        ).zh,
    );
    return bits.join(" · ") + "\n" + toolNature(paintState.tool);
  }
  function refreshBrushProps() {
    if (!host) return;
    var box = host.querySelector("[data-brush-props]");
    if (box) box.textContent = brushPropsText();
    var chip = host.querySelector("[data-brush-swatch]");
    if (chip) {
      if (layerIsColor()) {
        var a = clamp((paintState.alpha | 0) / 255, 0, 1);
        var activeHex =
          paintState.layer === "normal"
            ? paintState.normalColor || "#8080ff"
            : paintState.color || "#000000";
        var rgb = hexRgb(activeHex);
        chip.style.backgroundColor = "#c8c8c8";
        chip.style.backgroundImage =
          "linear-gradient(rgba(" +
          rgb[0] +
          "," +
          rgb[1] +
          "," +
          rgb[2] +
          "," +
          a +
          "),rgba(" +
          rgb[0] +
          "," +
          rgb[1] +
          "," +
          rgb[2] +
          "," +
          a +
          ")),linear-gradient(45deg,#8e8e8e 25%,transparent 25%),linear-gradient(-45deg,#8e8e8e 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#8e8e8e 75%),linear-gradient(-45deg,transparent 75%,#8e8e8e 75%)";
        chip.style.backgroundSize = "100% 100%,8px 8px,8px 8px,8px 8px,8px 8px";
        chip.style.backgroundPosition = "0 0,0 0,0 4px,4px -4px,-4px 0";
        chip.title =
          activeHex.toUpperCase() +
          (paintState.layer === "normal"
            ? " · 法线方向 " + String(paintState.normalBrushKey || "平面")
            : " · 不透明度 " + (paintState.alpha | 0));
      } else {
        var g = paintState.gray | 0;
        chip.style.background = "rgb(" + g + "," + g + "," + g + ")";
        chip.title = "灰 " + g;
      }
    }
    var pickHint = host.querySelector("[data-pick-hint]");
    if (pickHint) {
      pickHint.hidden = paintState.tool !== "pick";
      pickHint.textContent =
        "取色工具已启用  点击画布采样  当前值 " +
        (layerIsColor()
          ? (
              (paintState.layer === "normal"
                ? paintState.normalColor
                : paintState.color) || ""
            ).toUpperCase()
          : "灰" + (paintState.gray | 0));
    }
  }
  function statusText() {
    if (paintState.loading) return "正在加载纹理并准备法线与辅助高度";
    if (paintState.loadError) return paintState.loadError;
    if (isSkin())
      return (
        "皮肤区 " +
        texW() +
        "×" +
        texH() +
        " " +
        (paintState.skinModel === "slim" ? "细臂" : "宽臂") +
        " · 只画色图 PNG。存库 / 导出。不要 steve/alex。不写 texture_set。"
      );
    if (paintState.fromRef) {
      var pg = paintState.pigment || {};
      return (
        "参考资源 " +
        (paintState.stem || "") +
        " · 金属度 " +
        (pg.metal || 0) +
        " · 自发光 " +
        (pg.emissive || 0) +
        " · 粗糙度 " +
        (pg.roughness || 0) +
        "。参考资源不会自动写入当前包。"
      );
    }
    if (!paintState.loaded)
      return "选择左侧纹理开始编辑。未打开资源包时仍可编辑并保存到材质库。";
    if (
      paintState.registration &&
      paintState.registration.warnings &&
      paintState.registration.warnings.length
    )
      return (
        paintState.registration.warnings.join("  ") +
        "  该提示仅针对原生资源包通道定义"
      );
    if (isDirty())
      return (
        "当前纹理存在未保存修改。建议名称：" +
        suggestName() +
        (paintState.packOpen
          ? "。可保存到当前资源包或材质库。"
          : "。当前未打开资源包，可先保存到材质库。")
      );
    if (paintState.savedTo === "lib")
      return "已保存到材质库。打开资源包后可将此材质写入当前包。";
    if (paintState.savedTo === "pack")
      return "已暂存当前工作区  下载时按所选目标编码  游戏中需要对应光影支持";
    if (paintState.fromLibrary)
      return (
        "当前载入材质库条目「" +
        (paintState.libName || paintState.zh) +
        "」。可继续编辑后保存到材质库，或写入当前资源包。"
      );
    var registration = paintState.registration;
    if (registration) {
      var text = registration.defined
        ? "读取独立材质定义 " + registration.file
        : "读取分类默认材质 " + registration.file;
      text +=
        "  来源 " +
        (registration.source_mode || "普通纹理") +
        "  输出 " +
        (paintState.merMode === "none"
          ? "普通纹理"
          : selectedTarget() === "opengl"
            ? "OP FIO 四分区"
            : "渲染龙 MERS RGBA");
      if (registration.warnings && registration.warnings.length)
        text += "  " + registration.warnings.join("  ");
      if (registration.shared && registration.shared.length)
        text +=
          "  有 " +
          registration.shared.length +
          " 张共享贴图  编辑默认只影响当前材质";
      if (registration.animation && registration.animation.length)
        text += "  已识别动画帧配置  导出时保留";
      if (paintState.bump === "none")
        text += "  法线与辅助高度已准备候选预览  未启用或写入 PBR";
      else if (
        paintState.bump === "normal" &&
        registration.height_source === "default"
      )
        text += "  原法线保持不变  辅助高度由基色估算  不额外导出";
      return (
        text +
        (registration.height_source === "generated"
          ? "  已保留本次生成的辅助高度  不额外导出高度图"
          : "") +
        "  已绘制通道不会被预览覆盖"
      );
    }
    return "编辑完成后暂存当前纹理  下载时只包含修改和必要依赖";
  }
  function markSaved(where) {
    paintState.savedTo = where;
    paintState.painted = {
      color: false,
      mer: false,
      height: false,
      normal: false,
    };
    paintState.undo = [];
    paintState.redo = [];
    paintState.origin = capture();
    paintChrome();
  }
  function resizeNormalFrameTo(frame, targetW, targetH) {
    var out = new Uint8ClampedArray(targetW * targetH * 4),
      sx = frame.width / targetW,
      sy = frame.height / targetH;
    for (var ty = 0; ty < targetH; ty++)
      for (var tx = 0; tx < targetW; tx++) {
        var x0 = Math.floor(tx * sx),
          x1 = Math.max(x0 + 1, Math.ceil((tx + 1) * sx)),
          y0 = Math.floor(ty * sy),
          y1 = Math.max(y0 + 1, Math.ceil((ty + 1) * sy)),
          nx = 0,
          ny = 0,
          nz = 0,
          aa = 0,
          n = 0;
        for (var y = y0; y < Math.min(frame.height, y1); y++)
          for (var x = x0; x < Math.min(frame.width, x1); x++) {
            var o = (y * frame.width + x) * 4,
              a = frame.data[o + 3] / 255;
            nx += ((frame.data[o] / 255) * 2 - 1) * a;
            ny += ((frame.data[o + 1] / 255) * 2 - 1) * a;
            nz += ((frame.data[o + 2] / 255) * 2 - 1) * a;
            aa += a;
            n++;
          }
        var len = Math.hypot(nx, ny, nz) || 1,
          d = (ty * targetW + tx) * 4;
        nx /= len;
        ny /= len;
        nz /= len;
        out[d] = clamp(Math.round((nx * 0.5 + 0.5) * 255), 0, 255);
        out[d + 1] = clamp(Math.round((ny * 0.5 + 0.5) * 255), 0, 255);
        out[d + 2] = clamp(Math.round((nz * 0.5 + 0.5) * 255), 0, 255);
        out[d + 3] = clamp(Math.round((n ? aa / n : 0) * 255), 0, 255);
      }
    return {
      width: targetW,
      height: targetH,
      data: out,
    };
  }
  function resizeLayerCanvas(id, src, n) {
    var c = document.createElement("canvas");
    c.width = n;
    c.height = n;
    if (n < src.width || n < src.height) {
      var f = canvasFrame(src),
        rf =
          id === "normal"
            ? resizeNormalFrameTo(f, n, n)
            : averageFrameTo(f, n, n);
      putFrame(c, rf);
      return c;
    }
    var ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, n, n);
    return c;
  }
  function setSize(n) {
    n = n | 0;
    if (isSkin()) {
      toast("皮肤请用上面的尺寸按钮");
      return;
    }
    if (paintState.kind === "entity") {
      toast("生物贴图按原版宽高，不改成方的");
      return;
    }
    if (!n || n === paintState.sizePx) return;
    snapshot();
    LAYERS.forEach(function (row) {
      var src = layers[row.id];
      if (src) layers[row.id] = resizeLayerCanvas(row.id, src, n);
    });
    trackMaterialLayers();
    paintState.sizePx = n;
    paintState.sizeW = n;
    paintState.sizeH = n;
    if (paintState.baseColor)
      paintState.baseColor = layers.color.toDataURL("image/png");
    resetLiveAdjustBase();
    sizeView();
    fitView();
    redraw();
    paintChrome();
    scheduleAllLivePreviewSync();
    toast("已改成 " + n + "px · 放大保持完整像素格 · 缩小使用区域平均");
  }
  var JSP_CURSOR = {
    pencil: ["pencil", 13, 23, "crosshair"],
    brush: ["precise-dotted", 16, 16, "crosshair"],
    soft: ["precise-dotted", 16, 16, "crosshair"],
    airbrush: ["airbrush", 7, 22, "crosshair"],
    spray: ["airbrush", 7, 22, "crosshair"],
    eraser: ["precise", 16, 16, "crosshair"],
    fill: ["fill-bucket", 8, 22, "crosshair"],
    fill_all: ["fill-bucket", 8, 22, "crosshair"],
    flood: ["fill-bucket", 8, 22, "crosshair"],
    replace: ["fill-bucket", 8, 22, "crosshair"],
    pick: ["eye-dropper", 9, 22, "crosshair"],
    zoom: ["magnifier", 16, 16, "zoom-in"],
    line: ["precise", 16, 16, "crosshair"],
    curve: ["precise", 16, 16, "crosshair"],
    rect: ["precise", 16, 16, "crosshair"],
    ellipse: ["precise", 16, 16, "crosshair"],
    poly: ["precise", 16, 16, "crosshair"],
    round: ["precise", 16, 16, "crosshair"],
    select: ["precise", 16, 16, "crosshair"],
    select_free: ["precise", 16, 16, "crosshair"],
    move_sel: ["precise", 16, 16, "move"],
    gradient: ["precise", 16, 16, "crosshair"],
    text: ["precise", 16, 16, "text"],
    noise: ["precise-dotted", 16, 16, "crosshair"],
    dither: ["precise-dotted", 16, 16, "crosshair"],
    checker: ["precise-dotted", 16, 16, "crosshair"],
    dodge: ["precise-dotted", 16, 16, "crosshair"],
    burn: ["precise-dotted", 16, 16, "crosshair"],
    smudge: ["precise-dotted", 16, 16, "crosshair"],
  };
  function applyToolCursor() {
    if (!view) return;
    if (paintState.tool === "hand" || spaceDown) {
      view.style.cursor = dragging ? "grabbing" : "grab";
      return;
    }
    var spec = JSP_CURSOR[paintState.tool] || ["precise", 16, 16, "crosshair"];
    view.style.cursor = spec[3];
  }
  function syncInspectorSections() {
    if (!host) return;
    host.querySelectorAll("[data-editor-tab]").forEach(function (x) {
      x.classList.toggle(
        "on",
        x.getAttribute("data-editor-tab") === inspectorTabState,
      );
    });
    host.querySelectorAll("[data-editor-panel]").forEach(function (x) {
      x.classList.toggle(
        "on",
        x.getAttribute("data-editor-panel") === inspectorTabState,
      );
    });
  }
  function paintChrome() {
    if (!host) return;
    syncFromApi();
    if (colorOnlyMode()) paintState.layer = "color";
    var grayBox = host.querySelector("[data-gray]");
    var colorBox = host.querySelector("[data-color]");
    if (grayBox) grayBox.style.display = layerIsColor() ? "none" : "";
    if (colorBox) colorBox.style.display = layerIsColor() ? "" : "none";
    var g = host.querySelector("[data-gray-range]");
    var gv = host.querySelector("[data-gray-num]");
    if (g) g.value = paintState.gray;
    if (gv) gv.value = paintState.gray;
    var c = host.querySelector("[data-color-input]");
    if (c) {
      var activePaintHex =
        paintState.layer === "normal"
          ? paintState.normalColor || "#8080ff"
          : paintState.color;
      if (c.tagName === "INPUT") c.value = activePaintHex;
      else c.style.background = activePaintHex;
    }
    host.querySelectorAll("[data-tool]").forEach(function (btn) {
      btn.classList.toggle(
        "on",
        btn.getAttribute("data-tool") === paintState.tool,
      );
    });
    host.querySelectorAll("[data-layer]").forEach(function (btn) {
      var id = btn.getAttribute("data-layer");
      var current = id === paintState.layer;
      var dirty = layerPaintedState(id);
      btn.classList.toggle("on", current);
      btn.classList.toggle("state-current", current);
      btn.classList.toggle("state-dirty", !current && dirty);
      btn.classList.toggle("state-clean", !current && !dirty);
      btn.setAttribute(
        "data-layer-state",
        current ? "current" : dirty ? "dirty" : "clean",
      );
      if (colorOnlyMode()) btn.style.display = id === "color" ? "" : "none";
      else btn.style.display = "";
    });
    var layerBar = host.querySelector("[data-layer-bar]");
    if (layerBar) layerBar.style.display = colorOnlyMode() ? "none" : "";
    var title = host.querySelector("[data-stem-title]");
    if (title) {
      title.textContent =
        (paintState.stem || paintState.zh) +
        " · " +
        kindZh(paintState.kind) +
        " · " +
        texW() +
        "×" +
        texH() +
        (paintState.fromRef ? " · ref" : "") +
        (isSkin() ? " · skin" : "") +
        (paintState.fromLibrary
          ? " · 材质库"
          : paintState.fromVanilla
            ? " · 原始纹理"
            : "");
    }
    paintHistoryButtons();
    paintViewButtons();
    host.setAttribute(
      "data-skin",
      isSkin() || paintState.kindFilter === "skin" ? "1" : "0",
    );
    (textureHost || host)
      .querySelectorAll("[data-kind]")
      .forEach(function (btn) {
        btn.classList.toggle(
          "on",
          btn.getAttribute("data-kind") === paintState.kindFilter,
        );
      });
    host.querySelectorAll("[data-skin-model]").forEach(function (btn) {
      btn.classList.toggle(
        "on",
        btn.getAttribute("data-skin-model") === paintState.skinModel,
      );
    });
    host.querySelectorAll("[data-skin-layer]").forEach(function (btn) {
      btn.classList.toggle(
        "on",
        btn.getAttribute("data-skin-layer") === paintState.skinLayer,
      );
    });
    host.querySelectorAll("[data-skin-part]").forEach(function (btn) {
      btn.classList.toggle(
        "on",
        btn.getAttribute("data-skin-part") === paintState.skinPart,
      );
    });
    host.querySelectorAll("[data-skin-face]").forEach(function (btn) {
      btn.classList.toggle(
        "on",
        btn.getAttribute("data-skin-face") === paintState.skinFace,
      );
    });
    host.querySelectorAll("[data-skin-axis]").forEach(function (btn) {
      btn.classList.toggle(
        "on",
        btn.getAttribute("data-skin-axis") === paintState.skinGradAxis,
      );
    });
    paintQueryAll("[data-lib-name]").forEach(function (inp) {
      if (isSkin())
        inp.placeholder = "请输入英文文件名，且不要使用 steve 或 alex";
    });
    refreshSkinPalette();
    paintQueryAll("[data-lib-name]").forEach(function (inp) {
      if (!inp.value && paintState.libName) inp.value = paintState.libName;
    });
    paintQueryAll("[data-save-pack]").forEach(function (btn) {
      btn.style.display = paintState.packOpen ? "" : "none";
    });
    paintQueryAll("[data-need-pack]").forEach(function (btn) {
      btn.style.display = paintState.packOpen ? "" : "none";
    });
    host.querySelectorAll("[data-vv-only]").forEach(function (btn) {
      if (btn.getAttribute("data-need-pack") != null)
        btn.style.display = paintState.packOpen ? "" : "none";
      else btn.style.display = "";
    });
    paintQueryAll("[data-material-workflow-status]").forEach(function (lab) {
      lab.textContent =
        paintState.merMode === "none" ? "普通纹理工作流" : "PBR 工作流";
    });
    paintQueryAll("[data-material-workflow]").forEach(function (btn) {
      btn.classList.toggle(
        "on",
        btn.getAttribute("data-material-workflow") ===
          (paintState.merMode === "none" ? "plain" : "pbr"),
      );
    });
    paintQueryAll("[data-fio-export-four]").forEach(function (btn) {
      btn.disabled = !paintState.loaded || isSkin();
    });
    paintQueryAll("[data-fio-use-pbr-color-check]").forEach(function (box) {
      box.checked = !!paintState.exportFioUsePbrColor;
    });
    paintQueryAll("[data-fio-use-pbr-color-wrap]").forEach(function (wrap) {
      wrap.classList.toggle("on", !!paintState.exportFioUsePbrColor);
    });
    paintQueryAll("[data-fio-use-pbr-color-status]").forEach(function (lab) {
      lab.textContent = paintState.exportFioUsePbrColor
        ? "PBR结果原色"
        : "原始原色";
    });
    var opTarget = selectedTarget() === "opengl";
    paintQueryAll("[data-target-help]").forEach(function (lab) {
      lab.textContent = opTarget
        ? "OP 采用已记录 FPBR 检测协议  每区 " +
          texW() +
          " × " +
          texH() +
          "  仅支持正方形法线分区  光影 iRES 须匹配  不是通用 OpenGL 标准  次表面不会编码进检测区"
        : "渲染龙导出当前材质文件组  基色 法线或高度 材质参数图分别保存  texture_set 负责关联  不导出四宫格  MERS 的 A 保持真实数据";
    });
    paintQueryAll("[data-target-select]").forEach(function (sel) {
      sel.value = selectedTarget();
    });
    paintQueryAll("[data-fio-use-pbr-color-wrap]").forEach(function (wrap) {
      wrap.style.display = opTarget ? "" : "none";
    });
    paintQueryAll("[data-fio-export-four]").forEach(function (btn) {
      btn.textContent = opTarget ? "导出 OP 四合一" : "导出渲染龙材质文件组";
      btn.title = opTarget
        ? "每区必须为正方形  独立高度需先生成法线  FIO 左上基色 左下法线 右上属性 右下检测区  需要匹配光影的 iRES"
        : "当前材质的基色 凹凸图 材质参数图和注册文件  ZIP 不包含其他材质的修改";
      btn.disabled = !paintState.loaded || isSkin();
    });
    paintQueryAll("[data-native-group-list]").forEach(function (btn) {
      btn.style.display = opTarget ? "none" : "";
      btn.disabled = !paintState.loaded || isSkin();
    });
    var fiolab =
      layerPreviewCards.fio &&
      layerPreviewCards.fio.querySelector(".paint-stage-label");
    if (fiolab)
      fiolab.textContent = opTarget
        ? "OP 四分区  实时同步"
        : "渲染龙材质文件组  实时预览";
    if (layerPreviewCards.fio) {
      layerPreviewCards.fio.title = opTarget
        ? "OP 检测区与数据分区  实时更新  点击放大"
        : "分开显示基色 凹凸图和材质参数  此排版仅预览 不导出成拼图";
      layerPreviewCards.fio.setAttribute("aria-label", fiolab.textContent);
    }
    var sublab =
      layerPreviewCards.sub &&
      layerPreviewCards.sub.querySelector(".paint-stage-label");
    if (sublab)
      sublab.textContent = opTarget
        ? "次表面  OP 不输出  数据保留"
        : "A 次表面散射";
    paintQueryAll("[data-sync-status]").forEach(function (lab) {
      lab.textContent = paintState.loading
        ? "正在载入"
        : paintState.syncBusy || Object.keys(algorithmPendingKeys).length
          ? "正在同步"
          : "已同步  " + publishedRevision;
      lab.setAttribute("data-sync-revision", String(publishedRevision));
    });
    var glowToggle = host.querySelector("[data-glow-toggle]");
    if (glowToggle) glowToggle.style.display = "none";
    syncInspectorSections();
    var si = host.querySelector("[data-skin-show-inner]");
    if (si) si.classList.toggle("on", !!paintState.skinShowInner);
    var so = host.querySelector("[data-skin-show-outer]");
    if (so) so.classList.toggle("on", !!paintState.skinShowOuter);
    var sd = host.querySelector("[data-skin-dither]");
    if (sd) sd.classList.toggle("on", !!paintState.skinDither);
    var sg = host.querySelector("[data-skin-guides]");
    if (sg) sg.classList.toggle("on", !!paintState.skinShowGuides);
    if (global.document && global.document.body) {
      global.document.body.setAttribute(
        "data-skin",
        isSkin() || paintState.kindFilter === "skin" ? "1" : "0",
      );
    }
    applyToolCursor();
    var eraseBtn = host.querySelector("[data-color-eraser]");
    if (eraseBtn) eraseBtn.classList.toggle("on", !!paintState.colorEraser);
    var pp = host.querySelector("[data-pixel-perfect]");
    if (pp) pp.classList.toggle("on", !!paintState.pixelPerfect);
    host.querySelectorAll("[data-sym]").forEach(function (btn) {
      btn.classList.toggle(
        "on",
        btn.getAttribute("data-sym") === paintState.symmetry,
      );
    });
    var st = host.querySelector("[data-paint-status]");
    if (st) st.textContent = statusText();
    fillName(false);
    refreshBrushProps();
    refreshAlgorithmPanel();
    // 所有显示层和纹理列表统一进入同一刷新队列。
    if (paintState.loaded) scheduleAllLivePreviewSync();
  }
  function punchEmissive(cores, coreLevel, haloLevel) {
    if (!layers.emissive || !cores.length) return;
    snapshot();
    var w = texW(),
      h = texH();
    var ctx = layers.emissive.getContext("2d");
    var img = ctx.getImageData(0, 0, w, h);
    var seen = {};
    cores.forEach(function (p) {
      var x = p[0],
        y = p[1];
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      var i = (y * w + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = coreLevel;
      img.data[i + 3] = 255;
      seen[x + "," + y] = 1;
    });
    if (haloLevel > 0) {
      cores.forEach(function (p) {
        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            var nx = p[0] + dx,
              ny = p[1] + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            if (seen[nx + "," + ny]) continue;
            var i = (ny * w + nx) * 4;
            if (img.data[i] < haloLevel) {
              img.data[i] = img.data[i + 1] = img.data[i + 2] = haloLevel;
              img.data[i + 3] = 255;
            }
          }
        }
      });
    }
    ctx.putImageData(img, 0, 0);
    paintState.painted.mer = true;
    redraw();
  }
  function lightSelection() {
    if (!selection || selection.w < 1 || selection.h < 1) {
      toast("请先创建选区。该操作只写入选区的自发光通道，不修改基础色。");
      return;
    }
    var cores = [];
    for (var y = selection.y; y < selection.y + selection.h; y++) {
      for (var x = selection.x; x < selection.x + selection.w; x++)
        cores.push([x, y]);
    }
    punchEmissive(cores, 255, 220);
    toast("已为选区写入自发光通道。该效果仅影响材质自发光，不提供局部光照。");
  }
  function lightBrushColor() {
    if (!layers.color) return;
    var target = hexRgb(paintState.color);
    var w = texW(),
      h = texH();
    var data = layers.color.getContext("2d").getImageData(0, 0, w, h).data;
    var cores = [];
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4;
        if (data[i + 3] < 16) continue;
        if (
          Math.abs(data[i] - target[0]) <= 8 &&
          Math.abs(data[i + 1] - target[1]) <= 8 &&
          Math.abs(data[i + 2] - target[2]) <= 8
        ) {
          cores.push([x, y]);
        }
      }
    }
    if (!cores.length) {
      toast(
        "颜色通道中未找到匹配颜色。请更换画笔颜色，或先建立选区后写入自发光。",
      );
      return;
    }
    punchEmissive(cores, 255, cores.length <= 16 ? 220 : 0);
    toast(
      "已为匹配颜色写入自发光通道。该效果仅影响材质自发光，不提供局部光照。",
    );
  }
  function glowEyes(preset, hex) {
    if (paintState.kind !== "entity") {
      if (preset === "末影紫色") paintState.stem = "enderman";
      else if (preset === "红色眼部" || preset === "绿色眼部")
        paintState.stem = "creeper";
      else paintState.stem = "zombie";
      paintState.kind = "entity";
    }
    if (paintState.stem === "steve" || paintState.stem === "alex") {
      toast("玩家皮肤各不一样，不上色、不点眼睛。");
      return;
    }
    if (!api.deskCall) return;
    confirmLeave(function () {
      api
        .deskCall("material_eye_glow", {
          stem: paintState.stem,
          kind: "entity",
          preset: preset || "",
          color: preset ? hex || paintState.eyeColor || "#FFFFFF" : undefined,
          halo: false,
          source_lib_name: paintState.fromLibrary ? paintState.libName : "",
          to_library: !paintState.packOpen,
          lib_name: (paintState.zh || paintState.stem) + (preset || "亮眼"),
        })
        .then(function (doc) {
          toast((doc && (doc.note || doc.reason)) || "写入自发光失败");
          if (doc && doc.library) paintState.library = doc.library;
          if (!doc || !doc.ok) return;
          if (paintState.packOpen) pickBlock(paintState.stem, false, "entity");
          else if (doc.lib_name) pickLibrary(doc.lib_name);
        });
    });
  }
  var textureThumbObserver = null;
  var livePreviewRaf = 0;
  var livePreviewDirty = false;
  var livePreviewWatchTimer = 0;
  var livePreviewLastSignature = "";
  var textureListWatchTimer = 0;
  var textureListWatchBusy = false;
  var textureListLastSignature = "";
  var textureListVisibilityBound = false;
  var livePreviewScratch = document.createElement("canvas");
  livePreviewScratch.width = 8;
  livePreviewScratch.height = 8;
  function currentColorThumbDataUrl(maxSize) {
    if (!layers.color) return "";
    maxSize = Math.max(16, Number(maxSize) || 128);
    var sw = layers.color.width,
      sh = layers.color.height,
      scale = Math.min(1, maxSize / Math.max(sw, sh)),
      w = Math.max(1, Math.round(sw * scale)),
      h = Math.max(1, Math.round(sh * scale));
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    var x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.drawImage(layers.color, 0, 0, sw, sh, 0, 0, w, h);
    return c.toDataURL("image/png");
  }
  function currentTextureListThumbDataUrl(maxSize) {
    maxSize = Math.max(32, Number(maxSize) || 128);
    try {
      var f = pbrPreviewFrame(maxSize);
      if (f) {
        var c = document.createElement("canvas");
        c.width = f.width;
        c.height = f.height;
        c.getContext("2d").putImageData(frameImageData(f), 0, 0);
        return c.toDataURL("image/png");
      }
    } catch (e) {}
    return currentColorThumbDataUrl(maxSize);
  }
  function syncCurrentTextureThumbNow() {
    if (
      !paintState.rel ||
      !layers.color ||
      paintState.fromLibrary ||
      paintState.fromRef ||
      isSkin()
    )
      return;
    var url = currentTextureListThumbDataUrl(128);
    if (!url) return;
    paintState.liveThumbs = paintState.liveThumbs || {};
    paintState.liveThumbRevision = paintState.liveThumbRevision || {};
    paintState.liveThumbs[paintState.rel] = url;
    paintState.liveThumbRevision[paintState.rel] =
      (paintState.liveThumbRevision[paintState.rel] || 0) + 1;
    var rev = String(paintState.liveThumbRevision[paintState.rel]);
    (paintState.items || []).forEach(function (row) {
      if ((row.rel || "") === paintState.rel) {
        row.thumb = url;
        row.thumb_revision = rev;
      }
    });
    var roots = [];
    if (textureHost) roots.push(textureHost);
    if (host && host !== textureHost) roots.push(host);
    if (global.document) roots.push(global.document);
    roots.forEach(function (root) {
      Array.prototype.forEach.call(
        root.querySelectorAll("img[data-thumb-rel]"),
        function (img) {
          if ((img.getAttribute("data-thumb-rel") || "") !== paintState.rel)
            return;
          img.src = url;
          img.classList.remove("texture-thumb-pending");
          img.setAttribute("data-thumb-live", "1");
          img.setAttribute("data-thumb-revision", rev);
          img.removeAttribute("data-thumb-loading");
        },
      );
    });
  }
  function materialPreviewSignature() {
    if (!paintState.loaded) return "";
    var ids = [
        "color",
        "normal",
        "roughness",
        "emissive",
        "metal",
        "sub",
        "height",
      ],
      hash = 2166136261 >>> 0;
    var sx = livePreviewScratch.getContext("2d", {
      willReadFrequently: true,
    });
    sx.imageSmoothingEnabled = false;
    ids.forEach(function (id) {
      var c = layers[id];
      if (!c) return;
      hash ^= c.width & 65535;
      hash = Math.imul(hash, 16777619) >>> 0;
      hash ^= c.height & 65535;
      hash = Math.imul(hash, 16777619) >>> 0;
      sx.clearRect(0, 0, 8, 8);
      sx.drawImage(c, 0, 0, c.width, c.height, 0, 0, 8, 8);
      var d = sx.getImageData(0, 0, 8, 8).data;
      for (var i = 0; i < d.length; i += 4) {
        hash ^= d[i];
        hash = Math.imul(hash, 16777619) >>> 0;
        hash ^= d[i + 1];
        hash = Math.imul(hash, 16777619) >>> 0;
        hash ^= d[i + 2];
        hash = Math.imul(hash, 16777619) >>> 0;
        hash ^= d[i + 3];
        hash = Math.imul(hash, 16777619) >>> 0;
      }
    });
    return (
      String(hash >>> 0) +
      "|" +
      (paintState.workflowStage || "") +
      "|" +
      (paintState.layer || "") +
      "|r" +
      String(liveLayerMutationRevision >>> 0) +
      "|" +
      selectedTarget() +
      "|" +
      paintState.merMode +
      "|" +
      paintState.bump +
      "|" +
      JSON.stringify(paintState.algorithm) +
      "|" +
      paintState.exportFioUsePbrColor
    );
  }
  function flushAllLivePreviewSync() {
    if (!paintState.loaded || paintState.loading || syncingPreviews) return;
    syncingPreviews = true;
    try {
      // 参数计算和所有视图发布使用同一次提交  不显示旧参数对应的合成图
      startScheduledAlgorithm();
      redraw(true);
      drawReferencePreview();
      drawMerPreview();
      drawLayerSwitchPreviews();
      syncCurrentTextureThumbNow();
      livePreviewLastSignature = materialPreviewSignature();
      publishedRevision++;
      document.querySelectorAll("[data-sync-status]").forEach(function (lab) {
        lab.textContent =
          (paintState.syncBusy ? "计算中  已显示版本 " : "已同步  ") +
          publishedRevision;
        lab.setAttribute("data-sync-revision", String(publishedRevision));
      });
      document
        .querySelectorAll(".paint-view,.paint-layer-preview")
        .forEach(function (c) {
          c.setAttribute("data-sync-revision", String(publishedRevision));
        });
    } finally {
      syncingPreviews = false;
    }
  }
  function scheduleAllLivePreviewSync() {
    livePreviewDirty = true;
    if (livePreviewRaf) return;
    livePreviewRaf = requestAnimationFrame(function () {
      livePreviewRaf = 0;
      if (!livePreviewDirty) return;
      livePreviewDirty = false;
      flushAllLivePreviewSync();
    });
  }
  function ensureLivePreviewWatch() {
    if (livePreviewWatchTimer) return;
    livePreviewWatchTimer = setInterval(function () {
      if (!paintState.loaded || !painterVisible()) return;
      var sig = materialPreviewSignature();
      if (sig !== livePreviewLastSignature) scheduleAllLivePreviewSync();
    }, 120);
  }
  function textureRowsSignature(items) {
    return (items || [])
      .map(function (row) {
        return (
          String(row.rel || "") +
          "|" +
          String(row.kind || "") +
          "|" +
          String(row.stem || "")
        );
      })
      .join("\n");
  }
  function applyWatchedTextureList(doc) {
    if (!doc || !doc.ok) return;
    var next = doc.items || [],
      sig = textureRowsSignature(next);
    if (sig === textureListLastSignature) return;
    textureListLastSignature = sig;
    var box =
      (textureHost || host) &&
      (textureHost || host).querySelector("[data-block-list]");
    var top = box ? box.scrollTop : 0;
    paintState.items = next;
    if (doc.pack_open != null) paintState.packOpen = !!doc.pack_open;
    fillList();
    requestAnimationFrame(function () {
      var nextBox =
        (textureHost || host) &&
        (textureHost || host).querySelector("[data-block-list]");
      if (nextBox) nextBox.scrollTop = top;
      scheduleAllLivePreviewSync();
    });
  }
  var textureListRevision = -2;
  function pollTextureListNow() {
    if (
      textureListWatchBusy ||
      !api.deskCall ||
      !painterVisible() ||
      !paintState.packOpen
    )
      return;
    var rev = parent.RenderDragonWorkspace
      ? parent.RenderDragonWorkspace.revision
      : -1;
    if (rev === textureListRevision) return;
    textureListRevision = rev;
    textureListWatchBusy = true;
    Promise.resolve(api.deskCall("textures_watch", {}))
      .then(function (doc) {
        applyWatchedTextureList(doc);
      })
      .catch(function () {})
      .then(function () {
        textureListWatchBusy = false;
      });
  }
  function ensureTextureListWatch() {
    if (textureListWatchTimer) return;
    textureListLastSignature = textureRowsSignature(paintState.items || []);
    textureListWatchTimer = setInterval(pollTextureListNow, 700);
    if (!textureListVisibilityBound) {
      textureListVisibilityBound = true;
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) pollTextureListNow();
      });
    }
  }
  function browseKind(kind) {
    return kind === "ui" ||
      kind === "block" ||
      kind === "item" ||
      kind === "entity" ||
      kind === "particle"
      ? kind
      : "other";
  }
  function setTextureCount(shown, total) {
    var count =
      (textureHost || host) &&
      (textureHost || host).querySelector("[data-texture-count]");
    if (count)
      count.textContent =
        String(shown || 0) +
        (Number.isFinite(total) ? " / " + total : "") +
        " 张";
  }
  function disconnectTextureThumbs() {
    if (textureThumbObserver) textureThumbObserver.disconnect();
    textureThumbObserver = null;
  }
  function requestTextureThumb(img) {
    if (!img || img.getAttribute("data-thumb-loading") === "1" || !api.deskCall)
      return;
    var rel = img.getAttribute("data-thumb-rel") || "";
    if (!rel) return;
    if (paintState.liveThumbs && paintState.liveThumbs[rel]) {
      img.src = paintState.liveThumbs[rel];
      img.classList.remove("texture-thumb-pending");
      img.setAttribute("data-thumb-live", "1");
      return;
    }
    img.setAttribute("data-thumb-loading", "1");
    var requestRevision =
      (paintState.liveThumbRevision && paintState.liveThumbRevision[rel]) || 0;
    api
      .deskCall("texture_thumb", {
        rel: rel,
        size: 128,
      })
      .then(function (doc) {
        // 任何晚到的磁盘结果都不能覆盖较新的内存结果。
        var currentRevision =
          (paintState.liveThumbRevision && paintState.liveThumbRevision[rel]) ||
          0;
        if (
          currentRevision > requestRevision ||
          (paintState.liveThumbs && paintState.liveThumbs[rel])
        ) {
          img.src = paintState.liveThumbs[rel];
          img.classList.remove("texture-thumb-pending");
          img.setAttribute("data-thumb-live", "1");
          img.setAttribute("data-thumb-revision", String(currentRevision));
          return;
        }
        if (doc && doc.ok && doc.thumb) {
          img.src = doc.thumb;
          img.classList.remove("texture-thumb-pending");
        }
      })
      .catch(function () {})
      .finally(function () {
        img.removeAttribute("data-thumb-loading");
      });
  }
  function hydrateTextureThumbs(box) {
    disconnectTextureThumbs();
    var imgs = Array.prototype.slice
      .call(box.querySelectorAll("img[data-thumb-rel]"))
      .filter(function (img) {
        var rel = img.getAttribute("data-thumb-rel") || "";
        if (paintState.liveThumbs && paintState.liveThumbs[rel]) {
          img.src = paintState.liveThumbs[rel];
          img.classList.remove("texture-thumb-pending");
          img.setAttribute("data-thumb-live", "1");
          return false;
        }
        return true;
      });
    if (!imgs.length) return;
    var first = imgs.slice(0, 30);
    var rest = imgs.slice(30);
    if (api.deskCall && first.length) {
      var rels = first
        .map(function (img) {
          img.setAttribute("data-thumb-loading", "1");
          return img.getAttribute("data-thumb-rel") || "";
        })
        .filter(Boolean);
      api
        .deskCall("texture_thumbs", {
          rels: rels,
          size: 128,
        })
        .then(function (doc) {
          var thumbs = (doc && doc.thumbs) || {};
          first.forEach(function (img) {
            var rel = img.getAttribute("data-thumb-rel") || "";
            // 实时内存缩略图优先级永远高于批量磁盘缩略图，避免异步旧图把新图盖回去。
            if (paintState.liveThumbs && paintState.liveThumbs[rel]) {
              img.src = paintState.liveThumbs[rel];
              img.classList.remove("texture-thumb-pending");
              img.setAttribute("data-thumb-live", "1");
              return;
            }
            if (thumbs[rel]) {
              img.src = thumbs[rel];
              img.classList.remove("texture-thumb-pending");
            }
          });
        })
        .catch(function () {})
        .finally(function () {
          first.forEach(function (img) {
            var ok = !!img.src && img.src !== location.href;
            img.removeAttribute("data-thumb-loading");
            if (!ok) requestTextureThumb(img);
          });
        });
    } else first.forEach(requestTextureThumb);
    if (!("IntersectionObserver" in window)) {
      rest.forEach(requestTextureThumb);
      return;
    }
    textureThumbObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          textureThumbObserver.unobserve(entry.target);
          requestTextureThumb(entry.target);
        });
      },
      {
        root: box,
        rootMargin: "260px 0px",
        threshold: 0.01,
      },
    );
    rest.forEach(function (img) {
      textureThumbObserver.observe(img);
    });
  }
  function fillList() {
    var box = (textureHost || host).querySelector("[data-block-list]");
    if (!box) return;
    disconnectTextureThumbs();
    box.innerHTML = "";
    var q = (paintState.filter || "").trim().toLowerCase();
    var shown = 0;
    if (paintState.kindFilter === "lib") {
      (paintState.library || []).forEach(function (row) {
        var hay = (
          (row.name || "") +
          " " +
          (row.zh || "") +
          " " +
          (row.stem || "")
        ).toLowerCase();
        if (q && hay.indexOf(q) < 0) return;
        shown += 1;
        var __rowKey = textureStateKeyForRow(row, "lib");
        var btn = el(
          "button",
          "paint-block" +
            (row.name === paintState.libName ? " on" : "") +
            (isTouchedTexture(__rowKey) ? " state-dirty" : " state-clean"),
        );
        btn.type = "button";
        if (row.thumb) {
          var img = el("img");
          img.src = row.thumb;
          img.alt = row.name || row.stem || "材质库纹理";
          btn.appendChild(img);
        }
        var copy = el("span", "paint-block-copy");
        copy.appendChild(
          el("span", "paint-block-name", row.name || row.zh || row.stem),
        );
        copy.appendChild(
          el("span", "paint-block-tag", kindZh(row.kind) + " · 材质库"),
        );
        btn.appendChild(copy);
        btn.onclick = function () {
          pickLibrary(row.name);
        };
        var del = el("button", "scope", "删除");
        del.type = "button";
        del.onclick = function (ev) {
          ev.stopPropagation();
          if (!window.confirm("确认删除材质库中的「" + row.name + "」？"))
            return;
          api
            .deskCall("material_library_delete", {
              name: row.name,
            })
            .then(function (doc) {
              toast((doc && doc.reason) || "删除失败");
              if (doc && doc.library) paintState.library = doc.library;
              fillList();
            });
        };
        btn.appendChild(del);
        box.appendChild(btn);
      });
      setTextureCount(shown, (paintState.library || []).length);
      if (!box.children.length)
        box.appendChild(
          el("div", "hint", "材质库为空。编辑纹理后可将当前材质保存到材质库。"),
        );
      return;
    }
    if (paintState.kindFilter === "ref") {
      (paintState.refs || []).forEach(function (row) {
        var hay = ((row.stem || "") + " " + (row.rel || "")).toLowerCase();
        if (q && hay.indexOf(q) < 0) return;
        shown += 1;
        var __rowKey = textureStateKeyForRow(row, "ref");
        var btn = el(
          "button",
          "paint-block" +
            (row.rel === paintState.rel && paintState.fromRef ? " on" : "") +
            (isTouchedTexture(__rowKey) ? " state-dirty" : " state-clean"),
        );
        btn.type = "button";
        if (row.thumb) {
          var img = el("img");
          img.src = row.thumb;
          img.alt = row.stem || "参考纹理";
          btn.appendChild(img);
        }
        var pg = row.pigment || {};
        var copy = el("span", "paint-block-copy");
        copy.appendChild(el("span", "paint-block-name", row.stem));
        copy.appendChild(el("span", "paint-block-path", row.rel || "参考资源"));
        copy.appendChild(
          el(
            "span",
            "paint-block-tag",
            "M" +
              (pg.metal || 0) +
              " · E" +
              (pg.emissive || 0) +
              " · R" +
              (pg.roughness || 0),
          ),
        );
        btn.appendChild(copy);
        btn.onclick = function () {
          pickRef(row.stem, row.rel, row.kind);
        };
        box.appendChild(btn);
      });
      setTextureCount(shown, (paintState.refs || []).length);
      if (!box.children.length)
        box.appendChild(el("div", "hint", "没有符合搜索条件的参考纹理"));
      return;
    }
    var matches = (paintState.items || []).filter(function (row) {
      var rowKind = browseKind(row.kind);
      if (paintState.kindFilter !== "all" && rowKind !== paintState.kindFilter)
        return false;
      var hay = (
        (row.zh || "") +
        " " +
        (row.search_zh || "") +
        " " +
        (row.stem || "") +
        " " +
        (row.rel || "") +
        " " +
        kindZh(rowKind)
      ).toLowerCase();
      return !q || hay.indexOf(q) >= 0;
    });
    var limit = Math.max(
      paintState.texturePageSize || 50,
      paintState.textureVisibleLimit || 50,
    );
    var visible = matches.slice(0, limit);
    visible.forEach(function (row) {
      var rowKind = browseKind(row.kind);
      shown += 1;
      var __rowKey = textureStateKeyForRow(row, browseKind(row.kind));
      var btn = el(
        "button",
        "paint-block" +
          (row.rel === paintState.rel &&
          !paintState.fromLibrary &&
          !paintState.fromRef
            ? " on"
            : "") +
          (isTouchedTexture(__rowKey) ? " state-dirty" : " state-clean"),
      );
      btn.type = "button";
      btn.title = row.rel || row.stem;
      var img = el("img", "texture-thumb-pending");
      img.alt = row.zh || row.stem || "资源包纹理";
      img.loading = "lazy";
      img.setAttribute("data-thumb-rel", row.rel || "");
      if (paintState.liveThumbs && paintState.liveThumbs[row.rel]) {
        img.src = paintState.liveThumbs[row.rel];
        img.classList.remove("texture-thumb-pending");
        img.setAttribute("data-thumb-live", "1");
      }
      btn.appendChild(img);
      var copy = el("span", "paint-block-copy");
      copy.appendChild(el("span", "paint-block-name", row.zh || row.stem));
      copy.appendChild(el("span", "paint-block-path", row.rel || ""));
      var extra =
        (row.flipbook ? " · 动画纹理" : "") + (row.water ? " · 水体" : "");
      copy.appendChild(el("span", "paint-block-tag", kindZh(rowKind) + extra));
      btn.appendChild(copy);
      btn.onclick = function () {
        pickBlock(row.stem, false, row.kind, row.rel);
      };
      box.appendChild(btn);
    });
    setTextureCount(shown, matches.length);
    if (!shown)
      box.appendChild(el("div", "hint", "没有符合当前分类或搜索条件的纹理"));
    else if (visible.length < matches.length)
      box.appendChild(
        el(
          "div",
          "hint texture-more-hint",
          "继续向下滚动加载 · 已显示 " +
            visible.length +
            " / " +
            matches.length,
        ),
      );
    box.onscroll = function () {
      if (box.scrollHeight - box.scrollTop - box.clientHeight > 180) return;
      if ((paintState.textureVisibleLimit || 50) >= matches.length) return;
      var top = box.scrollTop;
      paintState.textureVisibleLimit = Math.min(
        matches.length,
        (paintState.textureVisibleLimit || 50) +
          (paintState.texturePageSize || 50),
      );
      fillList();
      requestAnimationFrame(function () {
        var next = (textureHost || host).querySelector("[data-block-list]");
        if (next) next.scrollTop = top;
      });
    };
    hydrateTextureThumbs(box);
  }
  function afterLoad(doc, forceVanilla) {
    textureRequestSerial++;
    var token = ++textureLoadSerial;
    paintState.loadError = "";
    if (finishTextureLoading) finishTextureLoading();
    textureLoading = new Promise(function (resolve) {
      finishTextureLoading = resolve;
    });
    paintState.stem = doc.stem;
    paintState.zh =
      doc.from_ref || doc.from_skin || doc.kind === "skin"
        ? doc.stem || "skin"
        : doc.zh;
    paintState.kind = doc.kind;
    paintState.sizeW = doc.size_w || doc.size || paintState.sizePx;
    paintState.sizeH = doc.size_h || doc.size || paintState.sizePx;
    paintState.sizePx = paintState.sizeW;
    paintState.rel = doc.rel || "";
    paintState.eyes = doc.eyes || "";
    paintState.merMode = mersCodec().normalizeMode(doc.mer_mode, doc.bump);
    paintState.registration = doc.registration || null;
    if (doc.registration && doc.registration.defaults)
      paintState.uniform = Object.assign(
        {},
        paintState.uniform,
        doc.registration.defaults,
      );
    paintState.bump = doc.bump || "none";
    paintState.fromVanilla = !!doc.from_vanilla || !!forceVanilla;
    paintState.fromLibrary = !!doc.from_library;
    paintState.fromRef = !!doc.from_ref;
    paintState.fromSkin = !!doc.from_skin || doc.kind === "skin";
    paintState.skinModel = doc.model || paintState.skinModel || "wide";
    if (doc.palette && doc.palette.length) paintState.skinPalette = doc.palette;
    paintState.pigment = doc.pigment || null;
    paintState.libName =
      doc.lib_name || (paintState.fromSkin ? doc.stem || "" : "");
    paintState.loaded = false;
    paintState.loading = true;
    loadedNormalData = null;
    sourceFioBlue = null;
    previewCache = {};
    paintState.savedTo = paintState.fromLibrary ? "lib" : "";
    paintState.nameAuto = !paintState.libName;
    paintState.lockColor = !paintState.fromVanilla && !paintState.fromLibrary;
    paintState.adjust = {
      hue: 0,
      sat: 0,
      bri: 0,
      con: 0,
      tint: "#ffb070",
      tintAmt: 0,
    };
    paintState.adjustLiveBase = null;
    paintState.adjustLiveSnapshotTaken = false;
    paintState.adjustLiveRendering = false;
    paintState.workflowStage = "color";
    paintState.layer = "color";
    paintState.algorithmLive = true;
    paintState.algorithmSourceW =
      Number(doc.algorithm_source_width) || paintState.sizeW;
    paintState.algorithmSourceH =
      Number(doc.algorithm_source_height) || paintState.sizeH;
    loadAlgorithmForTexture();
    paintState.algorithmLive = true;
    paintState.liveChannels = {};
    algorithmColorSource = null;
    clearLiveAlgorithm();
    resetLayers();
    var extraReady = Promise.resolve();
    if (doc.layers && doc.layers.fioBlue)
      extraReady = Promise.resolve()
        .then(function () {
          var raw = atob(doc.layers.fioBlue.split(",")[1]),
            b = new Uint8Array(raw.length);
          for (var i = 0; i < raw.length; i++) b[i] = raw.charCodeAt(i);
          return parent.RenderDragonPNG.decode(b);
        })
        .then(function (f) {
          if (token === textureLoadSerial) sourceFioBlue = f;
        })
        .catch(function (e) {
          if (token === textureLoadSerial) paintState.loadError = e.message;
        });
    var n = 0;
    LAYERS.forEach(function (row) {
      loadLayer(row.id, (doc.layers || {})[row.id], function () {
        if (token !== textureLoadSerial) return;
        n += 1;
        if (n >= LAYERS.length) {
          ["metal", "emissive", "roughness", "sub", "height"].forEach(
            function (id) {
              paintState.uniform[id] = layers[id]
                .getContext("2d")
                .getImageData(0, 0, 1, 1).data[0];
            },
          );
          paintState.baseColor = layers.color.toDataURL("image/png");
          function finishLoad() {
            if (token !== textureLoadSerial) return;
            if (!paintState.loadError) {
              try {
                prepareInitialBumpPreview();
              } catch (error) {
                paintState.loadError = "法线预览准备失败 " + error.message;
                toast(paintState.loadError);
              }
            }
            paintState.loading = false;
            paintState.loaded = !paintState.loadError;
            paintState.origin = paintState.loaded ? capture() : null;
            paintState.undo = [];
            paintState.redo = [];
            if (paintState.fromSkin && !skinClassic() && inferSlimFromColor())
              paintState.skinModel = "slim";
            sizeView();
            fitView();
            redraw();
            syncCurrentTextureThumbNow();
            fillName(true);
            paintChrome();
            if (finishTextureLoading) {
              finishTextureLoading();
              finishTextureLoading = null;
            }
          }
          if (paintState.fromSkin) {
            ensureSkinSheets();
            var innerSrc = (doc.layers && doc.layers.inner) || "";
            var outerSrc = (doc.layers && doc.layers.outer) || "";
            if (innerSrc || outerSrc) {
              var left = 2;
              function oneDone() {
                left -= 1;
                if (left > 0) return;
                if (!innerSrc)
                  copyUvToSheet(layers.color, skinSheets.inner, "inner");
                if (!outerSrc)
                  copyUvToSheet(layers.color, skinSheets.outer, "outer");
                compositeSkinSheets();
                finishLoad();
              }
              loadSheetPng(skinSheets.inner, innerSrc, oneDone);
              loadSheetPng(skinSheets.outer, outerSrc, oneDone);
              return;
            }
            splitSkinSheets();
          }
          extraReady.then(finishLoad);
        }
      });
    });
    fillList();
    fillName(true);
    paintChrome();
    toast(
      paintState.fromRef
        ? "参考 " + paintState.stem
        : paintState.fromSkin
          ? "皮肤"
          : paintState.fromLibrary
            ? "已载入材质库条目"
            : paintState.fromVanilla
              ? "已载入原始纹理，可以开始编辑"
              : "已打开纹理",
    );
  }
  function pickRef(stem, rel, kind) {
    confirmLeave(function () {
      if (!api.deskCall) return;
      if (!paintState.refRoot) {
        toast("请先打开参考资源");
        return;
      }
      api
        .deskCall("material_ref_get", {
          src: paintState.refRoot,
          stem: stem,
          rel: rel || "",
          kind: kind || "",
          size: paintState.sizePx,
        })
        .then(function (doc) {
          if (!doc || !doc.ok) {
            toast((doc && doc.reason) || "无法读取参考资源");
            return;
          }
          afterLoad(doc, false);
        });
    });
  }
  function openRefFolder() {
    if (!api.deskCall) return;
    api
      .deskCall("material_ref_scan", {
        pick: true,
      })
      .then(function (doc) {
        if (!doc || !doc.ok) {
          toast((doc && doc.reason) || "未选择文件夹");
          return;
        }
        paintState.refs = doc.items || [];
        paintState.refRoot = doc.path || "";
        paintState.kindFilter = "ref";
        fillList();
        paintChrome();
        toast(
          "参考 " +
            (doc.count || 0) +
            " 条 · 未匹配中文名称 " +
            (doc.skipped_cjk || 0),
        );
        var first = paintState.refs[0];
        if (first) pickRef(first.stem, first.rel, first.kind);
      });
  }
  function pickBlock(stem, forceVanilla, kind, rel) {
    var request = ++textureRequestSerial;
    confirmLeave(function () {
      if (!api.deskCall || request !== textureRequestSerial) return;
      api
        .deskCall("texture_get", {
          stem: stem,
          kind: kind || paintState.kind,
          rel: rel || "",
          size: paintState.sizePx,
          force_vanilla: !!forceVanilla,
        })
        .then(function (doc) {
          if (request !== textureRequestSerial) return;
          if (!doc || !doc.ok) {
            toast((doc && doc.reason) || "无法读取当前纹理");
            return;
          }
          afterLoad(doc, forceVanilla);
        });
    });
  }
  function pickLibrary(name) {
    confirmLeave(function () {
      if (!api.deskCall) return;
      api
        .deskCall("texture_get", {
          lib_name: name,
          size: paintState.sizePx,
        })
        .then(function (doc) {
          if (!doc || !doc.ok) {
            toast((doc && doc.reason) || "无法读取材质库条目");
            return;
          }
          afterLoad(doc, false);
        });
    });
  }
  function frameDataUrl(f) {
    var c = document.createElement("canvas");
    c.width = f.width;
    c.height = f.height;
    c.getContext("2d").putImageData(frameImageData(f), 0, 0);
    return c.toDataURL("image/png");
  }
  function collectLayers() {
    var out = {};
    LAYERS.forEach(function (row) {
      out[row.id] = layers[row.id].toDataURL("image/png");
    });
    if (
      loadedNormalData &&
      layers.normal.width === loadedNormalData.width &&
      layers.normal.height === loadedNormalData.height
    ) {
      var pixels = layers.normal
        .getContext("2d")
        .getImageData(0, 0, texW(), texH()).data;
      if (
        pixels.every(function (value, index) {
          return value === loadedNormalData.display[index];
        })
      )
        out.normal = loadedNormalData.src;
    }
    if (sourceFioBlue) out.fioBlue = frameDataUrl(sourceFioBlue);
    return out;
  }
  function paintPayload() {
    flushLiveAlgorithm();
    return {
      stem: paintState.stem,
      zh: paintState.zh,
      kind: paintState.kind,
      size: paintState.sizePx,
      mer_mode: paintState.merMode,
      pbr_enabled: paintState.merMode !== "none",
      size_w: texW(),
      size_h: texH(),
      rel: paintState.rel || "",
      bump:
        (paintState.kind === "item" || paintState.kind === "entity") &&
        paintState.bump === "heightmap"
          ? "none"
          : paintState.bump,
      lock_color: paintState.lockColor,
      from_vanilla: paintState.fromVanilla,
      painted: Object.assign({}, paintState.painted),
      uniform: Object.assign({}, paintState.uniform),
      pipeline: paintState.pipeline || "",
      algorithm_source_width: Math.max(
        1,
        Number(paintState.algorithmSourceW) || texW(),
      ),
      algorithm_source_height: Math.max(
        1,
        Number(paintState.algorithmSourceH) || texH(),
      ),
      op_baked_color: paintState.exportFioUsePbrColor
        ? frameDataUrl(pbrPreviewFrame(Math.max(texW(), texH()), true))
        : null,
      layers: collectLayers(),
    };
  }
  function saveCurrent() {
    if (isSkin()) {
      saveSkinLib();
      return;
    }
    return withPaintProgress("暂存当前纹理", function (progress) {
      progress(15, "正在比较当前纹理改动");
      return flushPending().then(function (doc) {
        toast(
          doc && doc.ok
            ? doc.reason || "纹理没有变化  未新增导出文件"
            : (doc && doc.reason) || "暂存失败",
        );
        return doc;
      });
    });
  }
  function saveLibrary() {
    if (!api.deskCall) return;
    if (isSkin()) {
      saveSkinLib();
      return;
    }
    var name = libName();
    if (!name) {
      toast("请先输入材质库名称，例如 镜面铁锭");
      return;
    }
    paintState.libName = name;
    var payload = paintPayload();
    payload.lib_name = name;
    payload.to_library = true;
    withPaintProgress("保存到材质库", function (progress) {
      progress(16, "正在整理当前纹理图层");
      payload.onProgress = function (pct, detail) {
        progress(pct, detail);
      };
      return api.deskCall("paint_save", payload).then(function (doc) {
        progress(100, "正在刷新材质库列表");
        toast((doc && doc.reason) || "写入失败");
        if (doc && doc.library) paintState.library = doc.library;
        if (doc && doc.ok) {
          paintState.fromLibrary = true;
          paintState.kindFilter = "lib";
          markSaved("lib");
        }
        fillList();
      });
    });
  }
  function applyPreset(name) {
    var p = {
      镜面金属: {
        metal: 255,
        emissive: 0,
        roughness: 0,
        sub: 0,
      },
      哑光石材: {
        metal: 0,
        emissive: 0,
        roughness: 220,
        sub: 0,
      },
      自发光材质: {
        metal: 0,
        emissive: 220,
        roughness: 80,
        sub: 0,
      },
      半透叶片: {
        metal: 0,
        emissive: 0,
        roughness: 160,
        sub: 180,
      },
      木质材质: {
        metal: 0,
        emissive: 0,
        roughness: 190,
        sub: 40,
      },
    }[name];
    if (!p) return;
    snapshot();
    paintState.uniform.metal = p.metal;
    paintState.uniform.emissive = p.emissive;
    paintState.uniform.roughness = p.roughness;
    paintState.uniform.sub = p.sub;
    paintState.merMode = "mers";
    fillGray(layers.metal, p.metal);
    fillGray(layers.emissive, p.emissive);
    fillGray(layers.roughness, p.roughness);
    fillGray(layers.sub, p.sub);
    paintState.painted.mer = true;
    paintState.nameAuto = true;
    fillName(true);
    paintChrome();
    redraw();
    toast("已应用 " + name + "，建议名称 " + suggestName());
  }
  function fillGray(canvas, v) {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
    ctx.fillRect(0, 0, texW(), texH());
  }
  function fillUniformToLayer() {
    snapshot();
    if (paintState.layer === "metal") {
      fillGray(layers.metal, paintState.uniform.metal);
      paintState.gray = paintState.uniform.metal;
    }
    if (paintState.layer === "emissive") {
      fillGray(layers.emissive, paintState.uniform.emissive);
      paintState.gray = paintState.uniform.emissive;
    }
    if (paintState.layer === "roughness") {
      fillGray(layers.roughness, paintState.uniform.roughness);
      paintState.gray = paintState.uniform.roughness;
    }
    if (paintState.layer === "sub") {
      fillGray(layers.sub, paintState.uniform.sub);
      paintState.gray = paintState.uniform.sub;
    }
    if (paintState.layer === "height") {
      fillGray(layers.height, paintState.uniform.height);
      paintState.gray = paintState.uniform.height;
    }
    paintState.painted.mer =
      paintState.layer !== "color" && paintState.layer !== "height"
        ? true
        : paintState.painted.mer;
    paintState.painted.height =
      paintState.layer === "height" ? true : paintState.painted.height;
    markPainted();
    paintChrome();
    redraw();
  }
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h = 0,
      s = 0,
      l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  function hslToRgb(h, s, l) {
    function hue(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    if (!s) return [l * 255, l * 255, l * 255];
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    return [
      hue(p, q, h + 1 / 3) * 255,
      hue(p, q, h) * 255,
      hue(p, q, h - 1 / 3) * 255,
    ];
  }
  function mapColor(fn) {
    if (!layers.color) return;
    snapshot();
    var ctx = layers.color.getContext("2d");
    var img = ctx.getImageData(0, 0, texW(), texH());
    for (var i = 0; i < img.data.length; i += 4) {
      var out = fn(
        img.data[i],
        img.data[i + 1],
        img.data[i + 2],
        img.data[i + 3],
      );
      img.data[i] = clamp(out[0], 0, 255);
      img.data[i + 1] = clamp(out[1], 0, 255);
      img.data[i + 2] = clamp(out[2], 0, 255);
      img.data[i + 3] = clamp(out[3], 0, 255);
    }
    ctx.putImageData(img, 0, 0);
    paintState.painted.color = true;
    paintState.lockColor = false;
    paintState.baseColor = layers.color.toDataURL("image/png");
    resetLiveAdjustBase();
    redraw();
  }
  function resetLiveAdjustBase() {
    paintState.adjustLiveBase = null;
    paintState.adjustLiveSnapshotTaken = false;
  }
  function ensureLiveAdjustBase() {
    if (!layers.color) return false;
    var w = texW(),
      h = texH();
    if (
      !paintState.adjustLiveBase ||
      paintState.adjustLiveBase.width !== w ||
      paintState.adjustLiveBase.height !== h
    ) {
      var src = layers.color
        .getContext("2d", {
          willReadFrequently: true,
        })
        .getImageData(0, 0, w, h);
      paintState.adjustLiveBase = {
        width: w,
        height: h,
        data: new Uint8ClampedArray(src.data),
      };
      paintState.adjustLiveSnapshotTaken = false;
    }
    return true;
  }
  function renderAdjustLive(pushHistory) {
    if (!ensureLiveAdjustBase()) return;
    if (pushHistory !== false && !paintState.adjustLiveSnapshotTaken) {
      snapshot();
      paintState.adjustLiveSnapshotTaken = true;
    }
    var w = texW(),
      h = texH(),
      ctx = layers.color.getContext("2d", {
        willReadFrequently: true,
      });
    var data = new ImageData(
      new Uint8ClampedArray(paintState.adjustLiveBase.data),
      w,
      h,
    );
    var tint = hexRgb(paintState.adjust.tint),
      ta = (paintState.adjust.tintAmt || 0) / 100,
      c = 1 + (paintState.adjust.con || 0) / 100;
    for (var i = 0; i < data.data.length; i += 4) {
      if (data.data[i + 3] === 0) continue;
      var hsl = rgbToHsl(data.data[i], data.data[i + 1], data.data[i + 2]);
      hsl[0] = (hsl[0] + (paintState.adjust.hue || 0) / 360 + 1) % 1;
      hsl[1] = clamp(hsl[1] + (paintState.adjust.sat || 0) / 100, 0, 1);
      hsl[2] = clamp(hsl[2] + (paintState.adjust.bri || 0) / 100, 0, 1);
      var rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
      rgb[0] = clamp((rgb[0] - 128) * c + 128, 0, 255);
      rgb[1] = clamp((rgb[1] - 128) * c + 128, 0, 255);
      rgb[2] = clamp((rgb[2] - 128) * c + 128, 0, 255);
      data.data[i] = rgb[0] * (1 - ta) + tint[0] * ta;
      data.data[i + 1] = rgb[1] * (1 - ta) + tint[1] * ta;
      data.data[i + 2] = rgb[2] * (1 - ta) + tint[2] * ta;
    }
    paintState.adjustLiveRendering = true;
    ctx.putImageData(data, 0, 0);
    paintState.adjustLiveRendering = false;
    paintState.painted.color = true;
    paintState.lockColor = false;
    redraw();
    scheduleAllLivePreviewSync();
  }
  function applyAdjust() {
    if (!layers.color) return;
    renderAdjustLive(true);
    paintState.baseColor = layers.color.toDataURL("image/png");
    resetLiveAdjustBase();
    paintState.adjust = {
      hue: 0,
      sat: 0,
      bri: 0,
      con: 0,
      tint: paintState.adjust.tint || "#ffb070",
      tintAmt: 0,
    };
    paintChrome();
    redraw();
    toast("已确认当前色彩调整");
  }
  function editableHeightNormalFrame() {
    ensureAlgorithm();
    var w = texW(),
      h = texH(),
      src = layers.height
        .getContext("2d", {
          willReadFrequently: true,
        })
        .getImageData(0, 0, w, h),
      out = new ImageData(w, h);
    var strength =
      Math.max(0, Number(paintState.algorithm.normalStrength ?? 1)) *
      Math.max(0, Number(paintState.algorithm.normalContrast ?? 1.3)) *
      2.5;
    function at(x, y) {
      x = (x + w) % w;
      y = (y + h) % h;
      return src.data[(y * w + x) * 4] / 255;
    }
    for (var y = 0; y < h; y++)
      for (var x = 0; x < w; x++) {
        var gx = (at(x + 1, y) - at(x - 1, y)) * 0.5,
          gy = (at(x, y + 1) - at(x, y - 1)) * 0.5,
          nx = -gx * strength,
          ny = -gy * strength,
          nz = 1,
          len = Math.hypot(nx, ny, nz) || 1,
          o = (y * w + x) * 4;
        nx /= len;
        ny /= len;
        nz /= len;
        out.data[o] = Math.round((nx * 0.5 + 0.5) * 255);
        out.data[o + 1] = Math.round((ny * 0.5 + 0.5) * 255);
        out.data[o + 2] = Math.round((nz * 0.5 + 0.5) * 255);
        out.data[o + 3] = 255;
      }
    return out;
  }
  function prepareInitialBumpPreview() {
    if (isSkin()) return;
    var source =
      paintState.registration && paintState.registration.height_source;
    if (paintState.bump === "heightmap") {
      putFrame(layers.normal, editableHeightNormalFrame());
    } else if (
      paintState.bump !== "normal" ||
      (source !== "generated" &&
        source !== "registered" &&
        !paintState.fromLibrary)
    ) {
      var generated = algorithmGenerate(
        texW(),
        paintState.bump === "normal" ? "height" : "normal",
      );
      if (!generated || !generated.height)
        throw new Error("未取得辅助高度数据");
      if (paintState.bump !== "normal") {
        if (!generated.normal) throw new Error("未取得法线数据");
        putFrame(layers.normal, generated.normal);
      }
      putFrame(layers.height, generated.height);
    }
    if (paintState.bump !== "normal" && paintState.bump !== "heightmap") {
      paintState.liveChannels.normal = "preview";
      paintState.liveChannels.height = "preview";
    }
    invalidateNormalDirectionBase();
  }
  function normalFromEditableHeight() {
    if (paintState.loading) return onTextureReady(normalFromEditableHeight);
    if (!paintState.loaded || !layers.height || !layers.normal) return;
    snapshot();
    putFrame(layers.normal, editableHeightNormalFrame());
    invalidateNormalDirectionBase();
    paintState.painted.normal = true;
    paintState.bump = "normal";
    paintState.merMode = "mers";
    paintState.layer = "normal";
    paintState.workflowStage = "normal";
    delete paintState.liveChannels.normal;
    paintChrome();
    redraw();
    toast("已由当前高度层生成独立法线层，可继续手绘修改");
  }
  function colorToHeight() {
    snapshot();
    var src = layers.color.getContext("2d").getImageData(0, 0, texW(), texH());
    var ctx = layers.height.getContext("2d");
    var dest = ctx.getImageData(0, 0, texW(), texH());
    for (var i = 0; i < src.data.length; i += 4) {
      var y =
        (src.data[i] * 0.3 + src.data[i + 1] * 0.59 + src.data[i + 2] * 0.11) |
        0;
      dest.data[i] = dest.data[i + 1] = dest.data[i + 2] = y;
      dest.data[i + 3] = 255;
    }
    ctx.putImageData(dest, 0, 0);
    paintState.painted.height = true;
    paintState.layer = "height";
    paintChrome();
    redraw();
    toast("已根据基础色生成高度通道，可继续手绘后再生成法线层");
  }
  function loadList() {
    if (!api.deskCall) return;
    api.deskCall("textures", {}).then(function (doc) {
      paintState.items = (doc && doc.items) || [];
      textureListLastSignature = textureRowsSignature(paintState.items);
      paintState.library = (doc && doc.library) || [];
      paintState.examples = (doc && doc.examples) || [];
      paintState.eyePresets = (doc && doc.eye_presets) || {
        "Him 白色眼部": "#FFFFFF",
        红色眼部: "#FF2020",
        绿色眼部: "#40FF40",
        末影紫色: "#C040FF",
      };
      paintState.glowPresets =
        (doc && doc.glow_presets) || paintState.glowPresets || [];
      paintState.packOpen = !!(doc && doc.pack_open);
      fillExamples();
      fillList();
      paintChrome();
      if (
        !paintState.loaded &&
        !paintState.loading &&
        paintState.kindFilter !== "ref"
      ) {
        var first =
          (paintState.items || []).filter(function (row) {
            return (
              row.common &&
              (paintState.kindFilter === "all" ||
                row.kind === paintState.kindFilter)
            );
          })[0] || (paintState.items || [])[0];
        if (first) pickBlock(first.stem, false, first.kind, first.rel);
      }
      if (doc && doc.audit && doc.audit.length) toast(doc.audit[0]);
    });
  }
  function fillExamples() {
    var box = (textureHost || host).querySelector("[data-examples]");
    if (!box) return;
    box.innerHTML = "";
    box.appendChild(el("span", "paint-eg-lab", "常用材质预设"));
    (paintState.examples || []).forEach(function (row) {
      var btn = el("button", "scope", row.name);
      btn.type = "button";
      btn.onclick = function () {
        paintState.libName = row.name;
        var inp = host.querySelector("[data-lib-name]");
        if (inp) inp.value = row.name;
        paintState.kindFilter = row.kind || "block";
        pickBlock(row.stem, false, row.kind);
      };
      box.appendChild(btn);
    });
  }
  function styleAct(btn) {
    btn.type = "button";
    btn.style.color = "var(--ink)";
    btn.style.background = "var(--chip)";
    return btn;
  }
  function paintHistoryButtons() {
    var nodes =
      global.document && global.document.querySelectorAll
        ? global.document.querySelectorAll(
            "[data-undo], [data-redo], [data-reset]",
          )
        : [];
    nodes.forEach(function (btn) {
      if (btn.hasAttribute("data-undo")) {
        btn.textContent = "撤销 " + paintState.undo.length + "/" + HISTORY_MAX;
        btn.disabled = !paintState.undo.length;
      } else if (btn.hasAttribute("data-redo")) {
        btn.textContent = "恢复 " + paintState.redo.length + "/" + HISTORY_MAX;
        btn.disabled = !paintState.redo.length;
      } else if (btn.hasAttribute("data-reset")) {
        btn.disabled = !paintState.origin;
      }
    });
  }
  function addTopBtn(row, label, fn, key, title) {
    var btn = styleAct(el("button", "tb-btn paint-act", label));
    if (key) btn.setAttribute("data-" + key, "1");
    if (title) btn.title = title;
    btn.onclick = fn;
    row.appendChild(btn);
    return btn;
  }
  function makeTopBarRows() {
    var wrap = el("div", "paint-topbar-inner");
    wrap.setAttribute("data-paint-topbar", "1");
    var file = el("div", "paint-topbar-row");
    file.appendChild(el("b", "paint-topbar-lab", "文件"));
    var targetLabel = el("label", "plain", "导出目标  ");
    var targetSelect = document.createElement("select");
    targetSelect.className = "search";
    targetSelect.setAttribute("data-target-select", "1");
    targetSelect.setAttribute("aria-label", "导出目标");
    [
      ["opengl", "OP 专用  四分区"],
      ["renderdragon", "渲染龙专用  材质文件组"],
    ].forEach(function (row) {
      var op = document.createElement("option");
      op.value = row[0];
      op.textContent = row[1];
      targetSelect.appendChild(op);
    });
    targetSelect.value = selectedTarget();
    targetSelect.onchange = function () {
      chooseTarget(targetSelect.value);
    };
    targetSelect.style.cssText = "width:218px;min-width:170px;margin:0";
    targetLabel.appendChild(targetSelect);
    file.appendChild(targetLabel);
    var syncLabel = el("span", "hint", "正在准备");
    syncLabel.setAttribute("data-sync-status", "1");
    syncLabel.setAttribute("role", "status");
    file.appendChild(syncLabel);
    var nameInp = el("input", "search");
    nameInp.setAttribute("data-lib-name", "1");
    nameInp.placeholder = "材质名称，例如 镜面铁锭";
    nameInp.title = "保存到材质库用的名字";
    nameInp.style.margin = "0";
    nameInp.style.width = "148px";
    nameInp.style.minWidth = "120px";
    nameInp.value = paintState.libName || "";
    nameInp.oninput = function () {
      paintState.nameAuto = false;
      syncLibName(nameInp.value);
    };
    file.appendChild(nameInp);
    var fioSetting = el("label", "fio-export-setting");
    fioSetting.setAttribute("data-fio-use-pbr-color-wrap", "1");
    fioSetting.title = "四合一导出时左上原色层的来源设置";
    var fioCheck = document.createElement("input");
    fioCheck.type = "checkbox";
    fioCheck.setAttribute("data-fio-use-pbr-color-check", "1");
    fioCheck.onchange = function () {
      setFourInOneColorSourceToggle(!!fioCheck.checked);
    };
    var fioTitle = el("strong", "", "OP 高级选项  将光照效果烘焙到基色");
    var fioHelp = el("small", "", "左上基色来源  预览与导出同步");
    var fioStatus = el("span", "fio-export-status", "原始原色");
    fioStatus.setAttribute("data-fio-use-pbr-color-status", "1");
    fioSetting.appendChild(fioCheck);
    fioSetting.appendChild(fioTitle);
    fioSetting.appendChild(fioHelp);
    fioSetting.appendChild(fioStatus);
    file.appendChild(fioSetting);
    var workflow = el("div", "paint-chips");
    workflow.setAttribute("data-workflow-toolbar", "1");
    var status = el("strong", "hint", "");
    status.setAttribute("data-material-workflow-status", "1");
    workflow.appendChild(status);
    [
      [false, "普通纹理"],
      [true, "启用 PBR"],
    ].forEach(function (row) {
      var b = el("button", "scope", row[1]);
      b.type = "button";
      b.setAttribute("data-material-workflow", row[0] ? "pbr" : "plain");
      b.onclick = function () {
        setMaterialWorkflow(row[0]);
      };
      workflow.appendChild(b);
    });
    file.appendChild(workflow);
    var fioExportBtn = addTopBtn(
      file,
      "导出四合一 · 原始原色",
      exportFourInOneTexture,
      "",
      "OP 导出四分区 PNG  渲染龙导出多个独立图片和注册文件组成的 ZIP",
    );
    fioExportBtn.setAttribute("data-fio-export-four", "1");
    addTopBtn(
      file,
      "当前材质文件清单",
      function () {
        return exportNativeMaterialFiles(true);
      },
      "native-group-list",
      "只列出当前材质和必要依赖  不下载",
    );
    addTopBtn(
      file,
      "暂存当前纹理",
      saveCurrent,
      "save-pack",
      "Ctrl+S  仅暂存修改  不会下载整个素材库",
    );
    addTopBtn(
      file,
      "撤销此纹理全部修改",
      resetWorkspaceTexture,
      "need-pack",
      "恢复工作区打开时的原始状态  从下载清单移除此纹理",
    );
    addTopBtn(
      file,
      "保存到材质库",
      saveLibrary,
      "",
      "未打开资源包时也可保存到本机材质库",
    );
    addTopBtn(file, "导入资源包纹理", importPack, "", "从其他资源包读取纹理");
    addTopBtn(
      file,
      "下载修改包",
      exportPack,
      "",
      "只下载已修改的参数和纹理及必要依赖",
    );
    addTopBtn(
      file,
      "打开参考资源",
      openRefFolder,
      "",
      "读取其他资源包中的 Texture Set 作为参考，不写入当前包",
    );
    addTopBtn(file, "导入 PNG", importPng, "", "Ctrl+O · 将 PNG 导入当前通道");
    addTopBtn(file, "导出 PNG", exportPng, "", "Ctrl+Shift+S · 本层另存 PNG");
    addTopBtn(
      file,
      "导出 PBR 合成原色",
      exportPbrCompositeAsColor,
      "",
      "将最终 PBR 合成预览烘焙成普通原色 PNG · 保留完整分辨率和透明通道",
    );
    addTopBtn(
      file,
      "从材质库写入",
      applyLibraryToPack,
      "need-pack",
      "将当前材质库条目写入资源包",
    );
    var r1 = el("div", "paint-topbar-row");
    r1.appendChild(el("b", "paint-topbar-lab", "基础"));
    addTopBtn(
      r1,
      "撤销 0/" + HISTORY_MAX,
      undo,
      "undo",
      "Ctrl+Z，最多保留 50 个历史步骤",
    );
    addTopBtn(
      r1,
      "重做 0/" + HISTORY_MAX,
      redo,
      "redo",
      "Ctrl+Y 或 Ctrl+Shift+Z · 重做",
    );
    addTopBtn(r1, "重置", resetPaint, "reset", "恢复到本次打开纹理时的状态");
    addTopBtn(
      r1,
      "恢复原始纹理",
      function () {
        pickBlock(paintState.stem, true, paintState.kind);
      },
      "vanilla",
      "放弃当前修改并重新载入资源包中的原始纹理",
    );
    addTopBtn(r1, "清空当前通道", clearLayer, "", "清空当前通道");
    var r2 = el("div", "paint-topbar-row");
    r2.appendChild(el("b", "paint-topbar-lab", "选区"));
    addTopBtn(r2, "剪切", cutSelection, "", "Ctrl+X");
    addTopBtn(r2, "复制", copySelection, "", "Ctrl+C");
    addTopBtn(r2, "粘贴", pasteSelection, "", "Ctrl+V");
    addTopBtn(r2, "清空选区", clearSelection, "", "Delete");
    addTopBtn(r2, "全选", selectAll, "", "Ctrl+A");
    addTopBtn(r2, "取消选择", deselect, "", "Esc");
    addTopBtn(
      r2,
      "裁剪到选区",
      cropKeepSelection,
      "",
      "清除选区外像素并保持纹理尺寸不变",
    );
    var r3 = el("div", "paint-topbar-row");
    r3.appendChild(el("b", "paint-topbar-lab", "变形"));
    addTopBtn(
      r3,
      "水平翻转",
      function () {
        flipLayer(true);
      },
      "",
      "翻转当前通道",
    );
    addTopBtn(
      r3,
      "垂直翻转",
      function () {
        flipLayer(false);
      },
      "",
      "翻转当前通道",
    );
    addTopBtn(
      r3,
      "顺时针 90°",
      function () {
        rotateActive(true);
      },
      "",
      "旋转当前纹理",
    );
    addTopBtn(
      r3,
      "逆时针 90°",
      function () {
        rotateActive(false);
      },
      "",
      "旋转当前纹理",
    );
    addTopBtn(r3, "反相", invertActive, "", "反相当前通道");
    addTopBtn(
      r3,
      "尺寸 ×2",
      function () {
        stretchInPlace(2);
      },
      "",
      "按比例缩放当前通道",
    );
    addTopBtn(
      r3,
      "尺寸 ×0.5",
      function () {
        stretchInPlace(0.5);
      },
      "",
      "按比例缩放当前通道",
    );
    addTopBtn(r3, "描边", outlineLayer, "", "为透明像素边缘生成画笔颜色描边");
    var r4 = el("div", "paint-topbar-row");
    r4.appendChild(el("b", "paint-topbar-lab", "视图"));
    addTopBtn(
      r4,
      "视图放大",
      function () {
        zoomBy(1);
      },
      "",
      "放大纹理视图",
    );
    addTopBtn(
      r4,
      "视图缩小",
      function () {
        zoomBy(-1);
      },
      "",
      "缩小纹理视图",
    );
    var zoomRead = addTopBtn(
      r4,
      "缩放 " + zoomLabel(paintState.zoom) + "x",
      function () {
        fitView();
      },
      "zoom-readout",
      "适应画布窗口",
    );
    zoomRead.setAttribute("data-zoom-readout", "1");
    addTopBtn(
      r4,
      "适应窗口",
      fitView,
      "",
      "按最近邻缩放将纹理完整显示在画布区域",
    );
    addTopBtn(
      r4,
      "左移",
      function () {
        nudgePan(-PAN_STEP, 0);
      },
      "",
      "平移视图",
    );
    addTopBtn(
      r4,
      "右移",
      function () {
        nudgePan(PAN_STEP, 0);
      },
      "",
      "平移视图",
    );
    addTopBtn(
      r4,
      "上移",
      function () {
        nudgePan(0, -PAN_STEP);
      },
      "",
      "平移视图",
    );
    addTopBtn(
      r4,
      "下移",
      function () {
        nudgePan(0, PAN_STEP);
      },
      "",
      "平移视图",
    );
    addTopBtn(r4, "视图居中", recenterView, "", "平移归零");
    wrap.appendChild(file);
    wrap.appendChild(r1);
    wrap.appendChild(r2);
    wrap.appendChild(r3);
    wrap.appendChild(r4);
    return wrap;
  }
  function fillTopBar() {
    var slot = global.document.getElementById("paintTopBar");
    var bar = makeTopBarRows();
    if (slot) {
      slot.innerHTML = "";
      slot.appendChild(bar);
    } else if (host && !host.querySelector("[data-paint-topbar]")) {
      host.insertBefore(bar, host.firstChild);
    }
    paintHistoryButtons();
    paintViewButtons();
  }
  function mount(target, nextApi) {
    installLayerMutationHooks();
    api = nextApi || {};
    syncFromApi();
    if (host === target && target.getAttribute("data-paint-ready") === "1") {
      paintChrome();
      loadList();
      return;
    }
    host = target;
    textureHost = global.document.getElementById("paintTextureBrowserHost");
    host.innerHTML = "";
    if (textureHost) textureHost.innerHTML = "";
    host.className = "paint-tools-pane paint-inspector";
    host.setAttribute("data-paint-ready", "1");
    if (!layers.color) resetLayers();
    var head = el("div", "paint-head");
    head.appendChild(el("b", "", "材质属性"));
    var title = el(
      "span",
      "",
      paintState.zh + " · " + paintState.sizePx + "px",
    );
    title.setAttribute("data-stem-title", "1");
    head.appendChild(title);
    host.appendChild(head);
    var status = el("div", "hint");
    status.setAttribute("data-paint-status", "1");
    status.setAttribute("data-editor-section", "paint");
    status.textContent = statusText();
    host.appendChild(status);
    var kindBar = el("div", "paint-chips");
    [
      ["all", "全部"],
      ["ui", "UI"],
      ["entity", "生物展开图"],
      ["item", "物品贴图"],
      ["block", "方块纹理"],
      ["particle", "粒子贴图"],
      ["other", "其他"],
      ["lib", "材质库"],
      ["ref", "参考资源"],
    ].forEach(function (row) {
      var btn = el(
        "button",
        "scope" + (paintState.kindFilter === row[0] ? " on" : ""),
        row[1],
      );
      btn.type = "button";
      btn.setAttribute("data-kind", row[0]);
      btn.onclick = function () {
        paintState.kindFilter = row[0];
        paintState.textureVisibleLimit = paintState.texturePageSize || 50;
        fillList();
        paintChrome();
      };
      kindBar.appendChild(btn);
    });
    var textureBrowserPanel = el("section", "texture-browser-panel");
    textureBrowserPanel.setAttribute("data-texture-browser", "1");
    (textureHost || host).appendChild(textureBrowserPanel);
    var paintFirst = !!(api && api.paintFirst);
    var eyeBox = el("div", "paint-opts paint-preset-zone");
    eyeBox.setAttribute("data-eye-box", "1");
    eyeBox.setAttribute("data-editor-section", "glow");
    eyeBox.appendChild(
      el(
        "div",
        "plain",
        "发光预设用于批量写入材质自发光与动画参数。各预设独立处理目标纹理，避免相互覆盖。",
      ),
    );
    eyeBox.appendChild(
      el(
        "div",
        "plain",
        "生物眼部自发光会根据预设区域写入发光通道。该效果不产生局部光源。",
      ),
    );
    if (api && api.buildTargetPackRow) {
      try {
        var targetRow = api.buildTargetPackRow();
        if (targetRow) eyeBox.appendChild(targetRow);
      } catch (errTarget) {}
    }
    var eyeChip = el("div", "color-chip");
    eyeChip.setAttribute("data-eye-color", "1");
    eyeChip.style.width = "28px";
    eyeChip.style.height = "28px";
    eyeChip.style.borderRadius = "8px";
    eyeChip.style.background = paintState.eyeColor || "#FFFFFF";
    eyeBox.appendChild(eyeChip);
    twoBoards(
      eyeBox,
      "hex",
      function (hex) {
        paintState.eyeColor = hex;
        if (eyeChip) eyeChip.style.background = hex;
      },
      "选择颜色",
    );
    eyeBox.appendChild(
      el(
        "div",
        "plain",
        "动画周期以秒为单位，并写入 query.life_time 或 flipbook 参数。局部光照颜色不参与逐帧闪烁。",
      ),
    );
    var timeRow = el("div", "paint-time");
    [
      ["保持时长", "blink_loop", "2.5", "0.1"],
      ["闭合时长", "blink_close", "0.1", "0.1"],
      ["每周期次数", "blinks", "1", "1"],
      ["矿物呼吸自发光循环", "ore_seconds", "9.6", "0.5"],
      ["火把闪烁周期", "flicker_seconds", "1.6", "0.2"],
      ["彩色循环周期", "rainbow_seconds", "2", "0.2"],
      ["铜傀儡循环周期", "copper_seconds", "12", "0.5"],
      ["铁傀儡变色周期", "iron_seconds", "3", "0.5"],
      ["爆炸保持时长", "creeper_hold", "2", "0.1"],
      ["淡出时长", "creeper_fade", "1", "0.1"],
      ["箭矢循环周期", "arrow_seconds", "0.7", "0.1"],
      ["箭矢渐变比例", "arrow_spin_pct", "50", "1"],
      ["箭头区域比例", "arrow_head_pct", "30", "1"],
      ["短时着地效果", "arrow_ground_short", "5", "1"],
      ["长时着地效果", "arrow_ground_long", "10", "1"],
    ].forEach(function (row) {
      var lab = el("label", "paint-time-item", row[0]);
      var inp = document.createElement("input");
      inp.type = "number";
      inp.min = row[3];
      inp.step = row[3];
      inp.value = row[2];
      inp.setAttribute("data-time", row[1]);
      try {
        var kept =
          window.localStorage &&
          localStorage.getItem("renderdragon_time_" + row[1]);
        if (kept) inp.value = kept;
      } catch (err) {}
      inp.onchange = function () {
        try {
          if (window.localStorage)
            localStorage.setItem("renderdragon_time_" + row[1], inp.value);
        } catch (err2) {}
      };
      lab.appendChild(inp);
      timeRow.appendChild(lab);
    });
    eyeBox.appendChild(timeRow);
    function catalogTimes() {
      function val(key, fallback) {
        var node = host.querySelector("[data-time='" + key + "']");
        var n = node ? parseFloat(node.value) : fallback;
        return isFinite(n) ? n : fallback;
      }
      return {
        blink_loop: val("blink_loop", 2.5),
        blink_close: val("blink_close", 0.1),
        blinks: val("blinks", 1),
        ore_seconds: val("ore_seconds", 9.6),
        flicker_seconds: val("flicker_seconds", 1.6),
        rainbow_seconds: val("rainbow_seconds", 2),
        copper_seconds: val("copper_seconds", 12),
        iron_seconds: val("iron_seconds", 3),
        creeper_hold: val("creeper_hold", 2),
        creeper_fade: val("creeper_fade", 1),
        arrow_seconds: val("arrow_seconds", 0.7),
        arrow_spin_pct: val("arrow_spin_pct", 50),
        arrow_head_pct: val("arrow_head_pct", 30),
        arrow_ground_short: val("arrow_ground_short", 5),
        arrow_ground_long: val("arrow_ground_long", 10),
        pumpkin_color: paintState.eyeColor || "#FFDC60",
        halo: false,
      };
    }
    function selectedGlowIds() {
      var ids = [];
      host.querySelectorAll("[data-glow-id]").forEach(function (box) {
        if (box.checked) ids.push(box.getAttribute("data-glow-id"));
      });
      return ids;
    }
    function glowPayload(all) {
      var t = catalogTimes();
      t.ids = all ? "all" : selectedGlowIds();
      var targetPath = "";
      if (api.getTargetPackPath) {
        try {
          targetPath = api.getTargetPackPath() || "";
        } catch (err) {
          targetPath = "";
        }
      }
      if (!targetPath && api.targetPackPath) targetPath = api.targetPackPath;
      if (targetPath) t.path = targetPath;
      return t;
    }
    function applyGlow(all) {
      if (!api.deskCall) return;
      var payload = glowPayload(all);
      if (!paintState.packOpen && !payload.path) {
        toast("请先选择目标资源包或打开当前资源包");
        return;
      }
      toast("正在应用自发光预设…");
      api.deskCall("material_glow_apply", payload).then(function (doc) {
        toast((doc && (doc.note || doc.reason)) || "写入失败");
      });
    }
    function diyPayload() {
      var t = catalogTimes();
      t.stem = paintState.stem;
      t.kind = paintState.kind;
      t.color = paintState.eyeColor || paintState.color || "#FFFFFF";
      t.target =
        paintState.diyTarget ||
        (paintState.kind === "entity" ? "eyes" : "texture");
      t.random = paintState.diyRandom || "none";
      t.keep_color = !!paintState.diyKeep;
      t.halo = !!paintState.diyHalo;
      t.emissive = paintState.diyEmissive;
      t.metal = paintState.diyMetal;
      t.roughness = paintState.diyRough;
      t.color_alpha = paintState.diyAlpha;
      t.seconds = paintState.diySeconds;
      t.halo_emissive = paintState.diyHaloE;
      t.halo_blend = paintState.diyHaloBlend;
      t.halo_alpha = paintState.diyAlpha;
      t.match = paintState.color;
      if (t.target === "selection" && selection) {
        t.rect = {
          x: selection.x,
          y: selection.y,
          w: selection.w,
          h: selection.h,
        };
      }
      t.source_lib_name = paintState.fromLibrary ? paintState.libName : "";
      t.to_library = !paintState.packOpen;
      t.lib_name = (paintState.zh || paintState.stem) + " 自发光";
      return t;
    }
    function applyDiy() {
      if (!api.deskCall) return;
      if (!paintState.stem) {
        toast("请先选择一张纹理");
        return;
      }
      api.deskCall("material_diy_glow", diyPayload()).then(function (doc) {
        toast((doc && (doc.note || doc.reason)) || "写入失败");
        if (doc && doc.ok && paintState.packOpen)
          pickBlock(paintState.stem, false, paintState.kind);
        else if (doc && doc.ok && doc.lib_name) pickLibrary(doc.lib_name);
      });
    }
    var presetRow = el("div", "paint-preset-row");
    presetRow.setAttribute("data-glow-presets", "1");
    var presetList =
      paintState.glowPresets && paintState.glowPresets.length
        ? paintState.glowPresets
        : [
            {
              id: "eyes",
              zh: "生物眼部眨眼",
            },
            {
              id: "warden",
              zh: "监守者彩色循环",
            },
            {
              id: "creeper_fuse",
              zh: "苦力怕爆炸闪烁",
            },
            {
              id: "arrow",
              zh: "箭矢发光",
            },
            {
              id: "ore",
              zh: "矿物呼吸自发光",
            },
            {
              id: "lights",
              zh: "发光材质微光",
            },
            {
              id: "lamps",
              zh: "灯具自发光",
            },
            {
              id: "weapons",
              zh: "武器材质微光",
            },
          ];
    presetList.forEach(function (row) {
      var lab = el("label", "", "");
      var box = document.createElement("input");
      box.type = "checkbox";
      box.setAttribute("data-glow-id", row.id);
      box.checked = true;
      try {
        var keptOn =
          window.localStorage &&
          localStorage.getItem("renderdragon_glow_on_" + row.id);
        if (keptOn === "0") box.checked = false;
        if (keptOn === "1") box.checked = true;
      } catch (err3) {}
      box.onchange = function () {
        try {
          if (window.localStorage)
            localStorage.setItem(
              "renderdragon_glow_on_" + row.id,
              box.checked ? "1" : "0",
            );
        } catch (err4) {}
      };
      lab.appendChild(box);
      lab.appendChild(document.createTextNode(row.zh));
      presetRow.appendChild(lab);
    });
    eyeBox.appendChild(presetRow);
    var glowBtns = el("div", "paint-chips");
    var applySel = el("button", "pick-ok", "应用已选预设");
    applySel.type = "button";
    applySel.setAttribute("data-need-pack", "1");
    applySel.onclick = function () {
      applyGlow(false);
    };
    var applyAll = el("button", "pick-ok", "应用全部预设");
    applyAll.type = "button";
    applyAll.setAttribute("data-need-pack", "1");
    applyAll.onclick = function () {
      applyGlow(true);
    };
    var autoLab = el("label", "", "");
    var autoBox = document.createElement("input");
    autoBox.type = "checkbox";
    autoBox.setAttribute("data-glow-auto", "1");
    try {
      autoBox.checked = !!(
        window.localStorage &&
        localStorage.getItem("renderdragon_glow_auto") === "1"
      );
    } catch (err5) {}
    autoBox.onchange = function () {
      try {
        if (window.localStorage)
          localStorage.setItem(
            "renderdragon_glow_auto",
            autoBox.checked ? "1" : "0",
          );
      } catch (err6) {}
    };
    autoLab.appendChild(autoBox);
    autoLab.appendChild(document.createTextNode("创建后自动应用"));
    glowBtns.appendChild(applySel);
    glowBtns.appendChild(applyAll);
    glowBtns.appendChild(autoLab);
    eyeBox.appendChild(glowBtns);
    eyeBox.appendChild(
      el(
        "div",
        "plain",
        "自定义发光只作用于当前纹理。可设置目标区域、颜色、自发光强度、动画模式与透明光晕。",
      ),
    );
    var diyAim = el("div", "paint-chips");
    [
      ["eyes", "眼部区域"],
      ["selection", "当前选区"],
      ["color", "匹配画笔颜色"],
      ["texture", "整张纹理"],
    ].forEach(function (row) {
      var btn = el(
        "button",
        "scope" + (paintState.diyTarget === row[0] ? " on" : ""),
        row[1],
      );
      btn.type = "button";
      btn.setAttribute("data-diy-target", row[0]);
      btn.onclick = function () {
        paintState.diyTarget = row[0];
        diyAim.querySelectorAll("[data-diy-target]").forEach(function (n) {
          n.classList.toggle(
            "on",
            n.getAttribute("data-diy-target") === paintState.diyTarget,
          );
        });
      };
      diyAim.appendChild(btn);
    });
    eyeBox.appendChild(diyAim);
    var diyRand = el("div", "paint-chips");
    [
      ["none", "静态"],
      ["cycle", "呼吸循环"],
      ["flicker", "闪烁"],
    ].forEach(function (row) {
      var btn = el(
        "button",
        "scope" + (paintState.diyRandom === row[0] ? " on" : ""),
        row[1],
      );
      btn.type = "button";
      btn.setAttribute("data-diy-random", row[0]);
      btn.onclick = function () {
        paintState.diyRandom = row[0];
        diyRand.querySelectorAll("[data-diy-random]").forEach(function (n) {
          n.classList.toggle(
            "on",
            n.getAttribute("data-diy-random") === paintState.diyRandom,
          );
        });
      };
      diyRand.appendChild(btn);
    });
    eyeBox.appendChild(diyRand);
    var diyFlags = el("div", "paint-chips");
    var keepLab = el("label", "", "");
    var keepBox = document.createElement("input");
    keepBox.type = "checkbox";
    keepBox.checked = !!paintState.diyKeep;
    keepBox.onchange = function () {
      paintState.diyKeep = keepBox.checked;
    };
    keepLab.appendChild(keepBox);
    keepLab.appendChild(document.createTextNode("保留原色"));
    var haloLab = el("label", "", "");
    var haloBox = document.createElement("input");
    haloBox.type = "checkbox";
    haloBox.setAttribute("data-diy-halo", "1");
    haloBox.checked = !!paintState.diyHalo;
    haloBox.onchange = function () {
      paintState.diyHalo = haloBox.checked;
    };
    haloLab.appendChild(haloBox);
    haloLab.appendChild(document.createTextNode("透明光晕"));
    diyFlags.appendChild(keepLab);
    diyFlags.appendChild(haloLab);
    eyeBox.appendChild(diyFlags);
    var diyTime = el("div", "paint-time");
    [
      ["亮度", "diyEmissive", "220", "1"],
      ["金属度", "diyMetal", "0", "1"],
      ["粗糙度", "diyRough", "80", "1"],
      ["不透明度", "diyAlpha", "255", "1"],
      ["循环时长", "diySeconds", "4", "0.2"],
      ["光晕强度", "diyHaloE", "90", "1"],
      ["光晕混合比例", "diyHaloBlend", "0.15", "0.05"],
    ].forEach(function (row) {
      var lab = el("label", "paint-time-item", row[0]);
      var inp = document.createElement("input");
      inp.type = "number";
      inp.min = row[0] === "光晕混合比例" ? "0" : "0";
      inp.step = row[3];
      inp.value = String(
        paintState[row[1]] != null ? paintState[row[1]] : row[2],
      );
      inp.setAttribute("data-diy", row[1]);
      inp.onchange = function () {
        var n = parseFloat(inp.value);
        if (!isFinite(n)) return;
        paintState[row[1]] = n;
      };
      lab.appendChild(inp);
      diyTime.appendChild(lab);
    });
    eyeBox.appendChild(diyTime);
    var diyGo = el("button", "pick-ok", "写入当前纹理");
    diyGo.type = "button";
    diyGo.onclick = applyDiy;
    eyeBox.appendChild(diyGo);
    paintState.applyGlow = applyGlow;
    paintState.applyDiy = applyDiy;
    paintState.catalogTimes = catalogTimes;
    paintState.selectedGlowIds = selectedGlowIds;
    var eyeBtns = el("div", "paint-chips");
    [
      ["红色眼部", "creeper"],
      ["绿色眼部", "creeper"],
      ["末影紫色", "enderman"],
    ].forEach(function (row) {
      var btn = el("button", "scope", row[0]);
      btn.type = "button";
      btn.onclick = function () {
        if (paintState.kind !== "entity") {
          paintState.stem = row[1];
          paintState.kind = "entity";
        }
        glowEyes(row[0], (paintState.eyePresets || {})[row[0]]);
      };
      eyeBtns.appendChild(btn);
    });
    var customEye = el("button", "pick-ok", "识别眼部区域并写入自发光");
    customEye.type = "button";
    customEye.onclick = function () {
      if (paintState.kind !== "entity" && !paintState.eyes) {
        toast(
          "当前纹理没有可用的眼部定位。请选择对应生物纹理，或使用矩形选区指定区域后写入自发光。",
        );
        return;
      }
      glowEyes("", paintState.eyeColor || "#FFFFFF");
    };
    var allEyes = el("button", "pick-ok", "应用生物眼部预设");
    allEyes.type = "button";
    allEyes.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api
        .deskCall("material_eyes_catalog", catalogTimes())
        .then(function (doc) {
          toast((doc && (doc.note || doc.reason)) || "写入自发光失败");
        });
    };
    var oreBreath = el("button", "pick-ok", "矿物缓慢呼吸");
    oreBreath.type = "button";
    oreBreath.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api.deskCall("material_ore_breath", catalogTimes()).then(function (doc) {
        toast((doc && (doc.note || doc.reason)) || "写入失败");
      });
    };
    var creativeLamps = el("button", "pick-ok", "灯具自发光");
    creativeLamps.type = "button";
    creativeLamps.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api.deskCall("material_creative_lamps", {}).then(function (doc) {
        toast((doc && (doc.note || doc.reason)) || "写入失败");
      });
    };
    var lightGlow = el("button", "pick-ok", "发光材质微光");
    lightGlow.type = "button";
    lightGlow.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api
        .deskCall("material_light_sources", catalogTimes())
        .then(function (doc) {
          toast((doc && (doc.note || doc.reason)) || "写入失败");
        });
    };
    var swordGlow = el("button", "pick-ok", "钻石剑微光");
    swordGlow.type = "button";
    swordGlow.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api.deskCall("material_diamond_sword_glow", {}).then(function (doc) {
        toast((doc && (doc.note || doc.reason)) || "写入失败");
      });
    };
    var weaponGlow = el("button", "pick-ok", "武器材质微光");
    weaponGlow.type = "button";
    weaponGlow.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api.deskCall("material_weapon_glow", {}).then(function (doc) {
        toast((doc && (doc.note || doc.reason)) || "写入失败");
      });
    };
    var mobBlink = el("button", "pick-ok", "生物眨眼");
    mobBlink.type = "button";
    mobBlink.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api.deskCall("material_mob_blink", catalogTimes()).then(function (doc) {
        toast((doc && (doc.note || doc.reason)) || "写入失败");
      });
    };
    var wardenRainbow = el("button", "pick-ok", "监守者彩色循环");
    wardenRainbow.type = "button";
    wardenRainbow.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api
        .deskCall("material_warden_rainbow", catalogTimes())
        .then(function (doc) {
          toast((doc && (doc.note || doc.reason)) || "写入失败");
        });
    };
    var copperFlash = el("button", "pick-ok", "铜傀儡闪灯");
    copperFlash.type = "button";
    copperFlash.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api
        .deskCall("material_copper_golem_flash", catalogTimes())
        .then(function (doc) {
          toast((doc && (doc.note || doc.reason)) || "写入失败");
        });
    };
    var arrowGlow = el("button", "pick-ok", "箭矢发光");
    arrowGlow.type = "button";
    arrowGlow.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api.deskCall("material_arrow_glow", catalogTimes()).then(function (doc) {
        toast((doc && (doc.note || doc.reason)) || "写入失败");
      });
    };
    var creeperFuse = el("button", "pick-ok", "苦力怕爆炸闪烁");
    creeperFuse.type = "button";
    creeperFuse.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      api
        .deskCall("material_creeper_fuse", catalogTimes())
        .then(function (doc) {
          toast((doc && (doc.note || doc.reason)) || "写入失败");
        });
    };
    var hurtFlash = el("button", "pick-ok", "受伤红色闪烁");
    hurtFlash.type = "button";
    hurtFlash.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      var payload = catalogTimes();
      payload.hurt_color = "#FF3030";
      payload.hurt_seconds = 0.18;
      api.deskCall("material_hurt_flash", payload).then(function (doc) {
        toast((doc && (doc.note || doc.reason)) || "写入失败");
      });
    };
    var finishAll = el("button", "pick-ok", "写入全部可用预设");
    finishAll.type = "button";
    finishAll.onclick = function () {
      if (!api.deskCall) return;
      if (!paintState.packOpen) {
        toast("先打开包");
        return;
      }
      toast("正在写入可用自发光预设…");
      api.deskCall("material_finish_all", catalogTimes()).then(function (doc) {
        toast((doc && (doc.note || doc.reason)) || "写入失败");
      });
    };
    var lightSel = el("button", "pick-ok", "写入选区自发光");
    lightSel.type = "button";
    lightSel.onclick = lightSelection;
    var lightCol = el("button", "pick-ok", "写入匹配颜色自发光");
    lightCol.type = "button";
    lightCol.onclick = lightBrushColor;
    eyeBox.appendChild(eyeBtns);
    eyeBox.appendChild(customEye);
    eyeBox.appendChild(allEyes);
    eyeBox.appendChild(oreBreath);
    eyeBox.appendChild(lightGlow);
    eyeBox.appendChild(creativeLamps);
    eyeBox.appendChild(swordGlow);
    eyeBox.appendChild(weaponGlow);
    eyeBox.appendChild(mobBlink);
    eyeBox.appendChild(wardenRainbow);
    eyeBox.appendChild(copperFlash);
    eyeBox.appendChild(arrowGlow);
    eyeBox.appendChild(creeperFuse);
    eyeBox.appendChild(hurtFlash);
    eyeBox.appendChild(finishAll);
    eyeBox.appendChild(lightSel);
    eyeBox.appendChild(lightCol);
    if (!paintFirst) host.appendChild(eyeBox);
    var browserHead = el("div", "texture-browser-head");
    browserHead.appendChild(el("b", "", "纹理资源"));
    var textureCount = el("span", "", "0 张");
    textureCount.setAttribute("data-texture-count", "1");
    browserHead.appendChild(textureCount);
    textureBrowserPanel.appendChild(browserHead);
    var search = el("input", "search");
    search.placeholder =
      "搜索中文名称、英文文件名或路径，例如 石头、钻石剑、textures/ui";
    search.setAttribute(
      "aria-label",
      "按中文名称、英文文件名或路径搜索当前资源包纹理",
    );
    search.oninput = function () {
      paintState.filter = search.value;
      paintState.textureVisibleLimit = paintState.texturePageSize || 50;
      fillList();
    };
    textureBrowserPanel.appendChild(search);
    textureBrowserPanel.appendChild(kindBar);
    var list = el("div", "paint-blocks");
    list.setAttribute("data-block-list", "1");
    textureBrowserPanel.appendChild(list);
    var eg = el("div", "paint-chips");
    eg.setAttribute("data-examples", "1");
    textureBrowserPanel.appendChild(eg);
    var layerBar = el("div", "paint-chips");
    layerBar.setAttribute("data-layer-bar", "1");
    layerBar.setAttribute("data-editor-section", "paint");
    LAYERS.forEach(function (row) {
      var btn = el("button", "scope", row.zh);
      btn.type = "button";
      btn.setAttribute("data-layer", row.id);
      btn.onclick = function () {
        if (colorOnlyMode() && row.id !== "color") {
          toast("皮肤只使用颜色层");
          return;
        }
        paintState.layer = row.id;
        if (
          [
            "color",
            "normal",
            "height",
            "roughness",
            "metal",
            "emissive",
            "sub",
          ].indexOf(row.id) >= 0
        )
          paintState.workflowStage = row.id;
        if (!row.color)
          paintState.gray =
            paintState.uniform[row.id === "height" ? "height" : row.id] ||
            paintState.gray;
        paintChrome();
        redraw();
      };
      layerBar.appendChild(btn);
    });
    host.appendChild(layerBar);
    TOOL_GROUPS.forEach(function (group) {
      var wrap = el("div", "paint-tool-group");
      wrap.setAttribute("data-editor-section", "paint");
      wrap.appendChild(el("b", "", group.zh));
      var bar = el("div", "paint-tools");
      TOOLS.filter(function (tool) {
        return tool.group === group.id;
      }).forEach(function (tool) {
        var btn = el("button", "tab", tool.zh);
        btn.type = "button";
        btn.setAttribute("data-tool", tool.id);
        btn.title = tool.zh;
        btn.onclick = function () {
          paintState.tool = tool.id;
          paintState.curvePts = [];
          paintState.polyPts = [];
          paintChrome();
        };
        bar.appendChild(btn);
      });
      wrap.appendChild(bar);
      host.appendChild(wrap);
    });
    var opt = el("div", "paint-opts");
    opt.setAttribute("data-editor-section", "paint");
    opt.appendChild(
      labelRange("笔刷大小", 1, 16, paintState.size, function (v) {
        paintState.size = v;
        refreshBrushProps();
      }),
    );
    opt.appendChild(
      labelRange(
        "画布缩放",
        ZOOM_MIN,
        ZOOM_MAX,
        paintState.zoom,
        function (v) {
          setZoom(v);
        },
        0.01,
      ),
    );
    var shapeBox = el("div", "paint-chips");
    BRUSH_SHAPES.forEach(function (sh) {
      var btn = el("button", "scope", sh.zh);
      btn.type = "button";
      btn.onclick = function () {
        paintState.shape = sh.id;
        toast("笔刷大小 " + sh.zh);
        paintChrome();
      };
      shapeBox.appendChild(btn);
    });
    opt.appendChild(shapeBox);
    var fillBtn = el("button", "scope", "填充形状");
    fillBtn.type = "button";
    fillBtn.onclick = function () {
      paintState.fillShape = !paintState.fillShape;
      fillBtn.classList.toggle("on", paintState.fillShape);
      refreshBrushProps();
    };
    opt.appendChild(fillBtn);
    var eraseMode = el("button", "scope", "颜色匹配橡皮");
    eraseMode.type = "button";
    eraseMode.setAttribute("data-color-eraser", "1");
    eraseMode.title =
      "启用后仅擦除与画笔颜色接近的像素；右键使用橡皮时可临时启用";
    eraseMode.onclick = function () {
      paintState.colorEraser = !paintState.colorEraser;
      eraseMode.classList.toggle("on", paintState.colorEraser);
      toast(paintState.colorEraser ? "颜色匹配橡皮已启用" : "标准橡皮");
      refreshBrushProps();
    };
    opt.appendChild(eraseMode);
    var symBox = el("div", "paint-chips");
    [
      ["none", "关闭对称"],
      ["h", "左右对称"],
      ["v", "上下对称"],
      ["both", "四向对称"],
    ].forEach(function (row) {
      var btn = el("button", "scope", row[1]);
      btn.type = "button";
      btn.setAttribute("data-sym", row[0]);
      btn.onclick = function () {
        paintState.symmetry = row[0];
        paintChrome();
        toast(row[1]);
      };
      symBox.appendChild(btn);
    });
    opt.appendChild(symBox);
    var ppBtn = el("button", "scope", "像素精确");
    ppBtn.type = "button";
    ppBtn.setAttribute("data-pixel-perfect", "1");
    ppBtn.onclick = function () {
      paintState.pixelPerfect = !paintState.pixelPerfect;
      ppBtn.classList.toggle("on", paintState.pixelPerfect);
      toast(paintState.pixelPerfect ? "像素精确已启用" : "像素精确已关闭");
      refreshBrushProps();
    };
    opt.appendChild(ppBtn);
    var alphaLab = labelRange(
      "不透明度",
      0,
      255,
      paintState.alpha,
      function (v) {
        paintState.alpha = v;
        refreshBrushProps();
      },
    );
    opt.appendChild(alphaLab);
    host.appendChild(opt);
    var propsRow = el("div", "paint-opts paint-brush-props");
    propsRow.setAttribute("data-editor-section", "paint");
    propsRow.appendChild(el("div", "plain", "当前画笔"));
    var swatchRow = el("div", "row");
    var swatch = el("div", "color-chip");
    swatch.setAttribute("data-brush-swatch", "1");
    swatch.style.width = "28px";
    swatch.style.height = "28px";
    swatch.style.borderRadius = "8px";
    swatch.style.background = paintState.color;
    swatchRow.appendChild(swatch);
    var pickHint = el("div", "hint");
    pickHint.setAttribute("data-pick-hint", "1");
    pickHint.hidden = true;
    pickHint.textContent = "正在取色";
    swatchRow.appendChild(pickHint);
    propsRow.appendChild(swatchRow);
    var props = el("div", "hint");
    props.setAttribute("data-brush-props", "1");
    props.style.whiteSpace = "pre-wrap";
    props.style.lineHeight = "1.45";
    props.textContent = brushPropsText();
    propsRow.appendChild(props);
    host.appendChild(propsRow);
    var colorBox = el("div", "paint-color");
    colorBox.setAttribute("data-editor-section", "paint");
    colorBox.setAttribute("data-color", "1");
    colorBox.appendChild(el("div", "plain", "画笔颜色"));
    var chip = el("div", "color-chip");
    chip.setAttribute("data-color-input", "1");
    chip.style.width = "28px";
    chip.style.height = "28px";
    chip.style.borderRadius = "8px";
    chip.style.background = paintState.color;
    colorBox.appendChild(chip);
    twoBoards(
      colorBox,
      "hex",
      function (hex) {
        setPaintColor(hex);
      },
      "选择颜色",
    );
    host.appendChild(colorBox);
    var vanillaBox = el("div", "paint-opts");
    vanillaBox.setAttribute("data-editor-section", "material");
    var vanBtn = el("button", "pick-ok", "恢复原始纹理");
    vanBtn.type = "button";
    vanBtn.onclick = function () {
      pickBlock(paintState.stem, true, paintState.kind);
    };
    vanillaBox.appendChild(vanBtn);
    vanillaBox.appendChild(
      labelRange("色相", -180, 180, paintState.adjust.hue, function (v) {
        paintState.adjust.hue = v;
        renderAdjustLive(true);
      }),
    );
    vanillaBox.appendChild(
      labelRange("饱和", -80, 80, paintState.adjust.sat, function (v) {
        paintState.adjust.sat = v;
        renderAdjustLive(true);
      }),
    );
    vanillaBox.appendChild(
      labelRange("亮度", -80, 80, paintState.adjust.bri, function (v) {
        paintState.adjust.bri = v;
        renderAdjustLive(true);
      }),
    );
    vanillaBox.appendChild(
      labelRange("对比", -80, 80, paintState.adjust.con, function (v) {
        paintState.adjust.con = v;
        renderAdjustLive(true);
      }),
    );
    vanillaBox.appendChild(
      labelRange("染色强度", 0, 80, paintState.adjust.tintAmt, function (v) {
        paintState.adjust.tintAmt = v;
        renderAdjustLive(true);
      }),
    );
    var tintBox = el("div", "paint-color");
    tintBox.appendChild(el("div", "plain", "染色"));
    twoBoards(
      tintBox,
      "hex",
      function (hex) {
        paintState.adjust.tint = hex;
        renderAdjustLive(true);
      },
      "选择颜色",
    );
    vanillaBox.appendChild(tintBox);
    var applyBtn = el("button", "pick-ok", "确认色彩调整");
    applyBtn.type = "button";
    applyBtn.onclick = applyAdjust;
    vanillaBox.appendChild(applyBtn);
    var tweaks = el("div", "paint-chips");
    [
      [
        "反相",
        function () {
          mapColor(function (r, g, b, a) {
            return [255 - r, 255 - g, 255 - b, a];
          });
        },
      ],
      [
        "去色",
        function () {
          mapColor(function (r, g, b, a) {
            var y = r * 0.3 + g * 0.59 + b * 0.11;
            return [y, y, y, a];
          });
        },
      ],
      [
        "暖色偏移",
        function () {
          mapColor(function (r, g, b, a) {
            return [r + 28, g + 10, b - 18, a];
          });
        },
      ],
      [
        "冷色偏移",
        function () {
          mapColor(function (r, g, b, a) {
            return [r - 18, g + 6, b + 28, a];
          });
        },
      ],
      [
        "增强红色",
        function () {
          mapColor(function (r, g, b, a) {
            return [r + 36, g - 8, b - 8, a];
          });
        },
      ],
      [
        "增强绿色",
        function () {
          mapColor(function (r, g, b, a) {
            return [r - 8, g + 36, b - 8, a];
          });
        },
      ],
      [
        "增强蓝色",
        function () {
          mapColor(function (r, g, b, a) {
            return [r - 8, g - 8, b + 36, a];
          });
        },
      ],
      [
        "压暗阴影",
        function () {
          mapColor(function (r, g, b, a) {
            var y = r * 0.3 + g * 0.59 + b * 0.11;
            var k = y < 80 ? 0.7 : 1;
            return [r * k, g * k, b * k, a];
          });
        },
      ],
      ["根据基础色生成高度", colorToHeight],
    ].forEach(function (row) {
      var btn = el("button", "scope", row[0]);
      btn.type = "button";
      btn.onclick = row[1];
      tweaks.appendChild(btn);
    });
    vanillaBox.appendChild(tweaks);
    host.appendChild(vanillaBox);
    var grayBox = el("div");
    grayBox.setAttribute("data-gray", "1");
    grayBox.setAttribute("data-editor-section", "material");
    grayBox.appendChild(el("div", "plain", "当前通道灰度"));
    grayBox.appendChild(
      labelRange("灰度值 0–255", 0, 255, paintState.gray, function (v) {
        setPaintGray(v);
      }),
    );
    twoBoards(
      grayBox,
      "gray255",
      function (hex) {
        setPaintGray(hex);
      },
      "选择颜色",
    );
    var fillU = el("button", "pick-ok", "填充整个通道");
    fillU.type = "button";
    fillU.onclick = fillUniformToLayer;
    grayBox.appendChild(fillU);
    host.appendChild(grayBox);
    var studioTabs = el("div", "paint-inspector-tabs");
    [
      ["algorithm", "PBR算法"],
      ["paint", "绘制"],
      ["material", "材质"],
      ["glow", "发光"],
    ].forEach(function (row) {
      var b = el(
        "button",
        "paint-inspector-tab" + (row[0] === inspectorTabState ? " on" : ""),
        row[1],
      );
      b.type = "button";
      b.setAttribute("data-editor-tab", row[0]);
      b.onclick = function () {
        inspectorTabState = row[0];
        syncInspectorSections();
        var active = host.querySelector(
          '[data-editor-panel="' + inspectorTabState + '"]',
        );
        if (active) active.scrollTop = 0;
        if (
          window.RenderDragonPbrLayoutEngine &&
          window.RenderDragonPbrLayoutEngine.queueRefresh
        )
          window.RenderDragonPbrLayoutEngine.queueRefresh();
      };
      studioTabs.appendChild(b);
    });
    host.insertBefore(studioTabs, status.nextSibling);
    host.insertBefore(makeAlgorithmPanel(), studioTabs.nextSibling);
    fillTopBar();
    var dock = global.document.getElementById("paintDock");
    if (dock) {
      dock.hidden = false;
      dock.innerHTML = "";
      var stage = el("div", "paint-stage");
      referenceView = null;
      merView = null;
      var activeCard = el("div", "paint-preview-card paint-active-card");
      var activeLab = el("div", "paint-stage-label", "当前层 · 可直接绘制");
      activeLab.setAttribute("data-active-layer-label", "1");
      activeCard.appendChild(activeLab);
      view = document.createElement("canvas");
      view.className = "paint-view";
      viewCtx = view.getContext("2d");
      bindPointer(view);
      viewScroller = el("div", "paint-canvas-scroll");
      viewScroller.setAttribute("data-canvas-scroll", "1");
      viewScroller.appendChild(view);
      activeCard.appendChild(viewScroller);
      litView = null;
      skin3d = document.createElement("canvas");
      skin3d.className = "paint-skin3d";
      skin3d.width = 120;
      skin3d.height = 160;
      var side = el("div", "paint-side-preview");
      layerPreviewRail = side;
      layerPreviewCards = {};
      layerPreviewViews = {};
      side.appendChild(skin3d);
      [
        ["preview", "材质效果预览"],
        ["fio", "输出文件实时预览"],
        ["color", "原色"],
        ["normal", "法线"],
        ["metal", "金属度"],
        ["emissive", "自发光"],
        ["roughness", "粗糙度"],
        ["sub", "次表面散射"],
      ].forEach(function (row) {
        var card = el("div", "paint-preview-card small paint-preview-switch");
        card.setAttribute("data-preview-stage", row[0]);
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", "切换到" + row[1]);
        card.appendChild(el("div", "paint-stage-label", row[1]));
        var c = document.createElement("canvas");
        c.className = "paint-layer-preview";
        var media = el("div", "paint-preview-scroll");
        media.appendChild(c);
        card.appendChild(media);
        card.onclick = function () {
          setWorkflowStage(row[0]);
        };
        card.onkeydown = function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setWorkflowStage(row[0]);
          }
        };
        if (row[0] === "fio")
          card.title = "按所选目标实时预览合成数据  点击放大查看";
        layerPreviewCards[row[0]] = card;
        layerPreviewViews[row[0]] = c;
        side.appendChild(card);
      });
      stage.appendChild(activeCard);
      stage.appendChild(side);
      dock.appendChild(stage);
    } else {
      view = document.createElement("canvas");
      view.className = "paint-view";
      viewCtx = view.getContext("2d");
      bindPointer(view);
      host.appendChild(view);
    }
    var nameRow = el("div", "paint-opts paint-dup-name");
    nameRow.setAttribute("data-editor-section", "material");
    var nameInp = el("input", "search");
    nameInp.setAttribute("data-lib-name", "1");
    nameInp.placeholder = "材质库名称，例如 镜面铁锭";
    nameInp.value = paintState.libName || "";
    nameInp.oninput = function () {
      paintState.nameAuto = false;
      syncLibName(nameInp.value);
    };
    nameRow.appendChild(nameInp);
    host.appendChild(nameRow);
    var actions = el("div", "paint-actions paint-dup-actions");
    actions.setAttribute("data-editor-section", "material");
    [
      ["暂存当前纹理", saveCurrent, "save-pack"],
      ["保存到材质库", saveLibrary, ""],
      ["将材质库条目写入当前包", applyLibraryToPack, "need-pack"],
      ["由高度生成法线", normalFromEditableHeight, "", "vv"],
      [
        "应用常用材质参数",
        function () {
          flushPending().then(function (saved) {
            if (saved && saved.ok === false) {
              toast(saved.reason);
              return;
            }
            return api
              .deskCall("material_apply", {
                mode: "values",
                rels: [paintState.rel],
                mer_mode: paintState.merMode,
                bump: paintState.bump,
                uniform: Object.assign({}, paintState.uniform),
                painted: {
                  color: false,
                  mer: false,
                  height: false,
                },
              })
              .then(async function (d) {
                toast((d && d.reason) || "应用失败");
                if (d && d.ok) {
                  var current = await api.deskCall("texture_get", {
                    rel: paintState.rel,
                  });
                  if (current && current.ok) afterLoad(current);
                }
              });
          });
        },
        "need-pack",
        "vv",
      ],
      ["批量使用通配算法生成PBR", generateAllTexturesPbr, "need-pack", "vv"],
      ["从其他资源包读取", importPack, ""],
      ["导出材质包", exportPack, ""],
      ["导出当前目标材质", exportFourInOneTexture, ""],
      [
        "检查材质通道与引用",
        function () {
          api.deskCall("material_audit", {}).then(function (d) {
            toast((d && d.reason) || "检查完成");
          });
        },
        "need-pack",
      ],
    ].forEach(function (row) {
      var btn = el("button", "tb-btn paint-act", row[0]);
      btn.type = "button";
      if (row[2]) btn.setAttribute("data-" + row[2], "1");
      if (row[3] === "vv") btn.setAttribute("data-vv-only", "1");
      btn.style.color = "var(--ink)";
      btn.style.background = "var(--chip)";
      btn.onclick = row[1];
      actions.appendChild(btn);
    });
    host.appendChild(actions);
    var presets = el("div", "paint-chips");
    presets.setAttribute("data-vv-only", "1");
    presets.setAttribute("data-editor-section", "material");
    ["镜面金属", "哑光石材", "自发光材质", "半透叶片", "木质材质"].forEach(
      function (name) {
        var btn = el("button", "scope", name);
        btn.type = "button";
        btn.setAttribute("data-vv-only", "1");
        btn.onclick = function () {
          applyPreset(name);
        };
        presets.appendChild(btn);
      },
    );
    host.appendChild(presets);
    var lock = el("label", "check");
    lock.setAttribute("data-vv-only", "1");
    lock.setAttribute("data-editor-section", "material");
    var ck = document.createElement("input");
    ck.type = "checkbox";
    ck.checked = paintState.lockColor;
    ck.onchange = function () {
      paintState.lockColor = ck.checked;
    };
    lock.appendChild(ck);
    lock.appendChild(document.createTextNode("锁定基础色，仅修改 PBR 通道"));
    host.appendChild(lock);
    var mer = el("div", "paint-chips");
    mer.setAttribute("data-editor-section", "material");
    [
      ["none", "普通纹理"],
      ["mers", "启用 PBR"],
    ].forEach(function (row) {
      var btn = el("button", "scope", row[1]);
      btn.type = "button";
      btn.setAttribute(
        "data-material-workflow",
        row[0] === "none" ? "plain" : "pbr",
      );
      btn.onclick = function () {
        setMaterialWorkflow(row[0] !== "none");
      };
      mer.appendChild(btn);
    });
    [
      ["normal", "生成法线"],
      ["heightmap", "保留高度图"],
      ["none", "不生成高度或法线信息"],
    ].forEach(function (row) {
      var btn = el("button", "scope", row[1]);
      btn.type = "button";
      btn.setAttribute("data-vv-only", "1");
      btn.onclick = function () {
        if (row[0] === "normal") {
          return generateNormalChannel();
        }
        if (row[0] === "heightmap" && paintState.kind === "item") {
          toast("物品需要使用法线  不能注册高度图");
          return;
        }
        snapshot();
        paintState.bump = row[0];
        if (paintState.bump !== "none") paintState.merMode = "mers";
        paintChrome();
        redraw();
        toast(row[1]);
      };
      mer.appendChild(btn);
    });
    pbrAlgo().RESOLUTIONS.forEach(function (n) {
      var btn = el("button", "scope", n + "X");
      btn.type = "button";
      btn.onclick = function () {
        setSize(n);
      };
      mer.appendChild(btn);
    });
    host.appendChild(mer);
    if (paintFirst) host.appendChild(eyeBox);
    var inspectorBody = el("div", "paint-inspector-body");
    var studioPanels = {};
    [
      ["algorithm", "PBR算法"],
      ["paint", "绘制"],
      ["material", "材质"],
      ["glow", "发光"],
    ].forEach(function (row) {
      var panel = el("section", "paint-inspector-panel");
      panel.setAttribute("data-editor-panel", row[0]);
      studioPanels[row[0]] = panel;
      inspectorBody.appendChild(panel);
    });
    Array.prototype.slice.call(host.children).forEach(function (node) {
      var section =
        node.getAttribute && node.getAttribute("data-editor-section");
      if (section && studioPanels[section])
        studioPanels[section].appendChild(node);
    });
    host.insertBefore(inspectorBody, studioTabs.nextSibling);
    syncInspectorSections();
    sizeView();
    paintChrome();
    redraw();
    loadList();
    ensureLivePreviewWatch();
    ensureTextureListWatch();
  }
  function labelRange(zh, min, max, value, on, step) {
    var wrap = el("label", "paint-range", zh);
    var range = document.createElement("input");
    range.type = "range";
    range.min = String(min);
    range.max = String(max);
    range.step = String(step || 1);
    range.value = String(value);
    var num = document.createElement("input");
    num.className = "num";
    num.type = "number";
    num.step = String(step || 1);
    num.value = String(value);
    if (zh.indexOf("255") >= 0) {
      range.setAttribute("data-gray-range", "1");
      num.setAttribute("data-gray-num", "1");
    }
    function set(v) {
      v = clamp(Number(v), min, max);
      range.value = String(v);
      num.value = String(v);
      on(v);
    }
    range.oninput = function () {
      set(range.value);
    };
    num.oninput = function () {
      if (num.value !== "" && Number.isFinite(Number(num.value)))
        set(num.value);
    };
    wrap.appendChild(range);
    wrap.appendChild(num);
    return wrap;
  }
  function bindPointer(canvas) {
    canvas.oncontextmenu = function (e) {
      e.preventDefault();
    };
    canvas.addEventListener(
      "wheel",
      function (e) {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        zoomBy(e.deltaY < 0 ? 1 : -1);
      },
      {
        passive: false,
      },
    );
    var lastScreen = null;
    canvas.onmousedown = function (e) {
      if (paintState.loading || !paintState.loaded) {
        toast(paintState.loadError || "正在准备纹理 法线与辅助高度");
        return;
      }
      if (
        paintState.layer === "color" &&
        paintState.adjustLiveBase &&
        paintState.workflowStage !== "preview"
      ) {
        paintState.baseColor = layers.color.toDataURL("image/png");
        resetLiveAdjustBase();
        paintState.adjust = {
          hue: 0,
          sat: 0,
          bri: 0,
          con: 0,
          tint: paintState.adjust.tint || "#ffb070",
          tintAmt: 0,
        };
        paintChrome();
      }
      if (
        paintState.workflowStage === "preview" &&
        !(paintState.tool === "hand" || spaceDown)
      ) {
        toast(
          "最终PBR效果为预览状态，点击右侧原色 / 法线 / 发光 / 粗糙可切换到对应可绘制层",
        );
        return;
      }
      var p = posFromEvent(e);
      dragging = true;
      dragOrigin = {
        x: p.x,
        y: p.y,
      };
      last = null;
      lastScreen = {
        x: e.clientX,
        y: e.clientY,
      };
      if (paintState.tool === "hand" || spaceDown) {
        last = p;
        return;
      }
      applyTool("down", p, e);
    };
    canvas.onmousemove = function (e) {
      if (!dragging) return;
      var p = posFromEvent(e);
      if (paintState.tool === "hand" || spaceDown) {
        if (lastScreen) {
          paintState.panX += e.clientX - lastScreen.x;
          paintState.panY += e.clientY - lastScreen.y;
          applyPan();
        }
        lastScreen = {
          x: e.clientX,
          y: e.clientY,
        };
        last = p;
        return;
      }
      if (
        DRAG_PREVIEW.indexOf(paintState.tool) >= 0 &&
        paintState.tool !== "select_free"
      ) {
        last = p;
        redraw();
        return;
      }
      applyTool("move", p, e);
    };
    window.addEventListener("mouseup", function (e) {
      if (!dragging) return;
      var p = view ? posFromEvent(e) : last;
      if (!(paintState.tool === "hand" || spaceDown))
        finishDrag(
          p ||
            last || {
              x: 0,
              y: 0,
            },
        );
      dragging = false;
      last = null;
      dragOrigin = null;
      lastScreen = null;
      strokeBase = null;
      strokePts = [];
      moveSelShot = null;
      paintChrome();
    });
    canvas.onkeydown = function () {};
    window.addEventListener("keydown", function (e) {
      if (!host || !host.parentNode) return;
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") {
        spaceDown = true;
        applyToolCursor();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (e.ctrlKey && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }
      if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        if (e.shiftKey) exportPng();
        else saveSmart();
        return;
      }
      if (e.ctrlKey && (e.key === "o" || e.key === "O")) {
        e.preventDefault();
        importPng();
        return;
      }
      if (e.ctrlKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        selectAll();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        deselect();
        return;
      }
      if (e.ctrlKey && (e.key === "x" || e.key === "X")) {
        e.preventDefault();
        cutSelection();
        return;
      }
      if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        copySelection();
        return;
      }
      if (e.ctrlKey && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        pasteSelection();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        clearSelection();
        return;
      }
      if (e.key === "b" || e.key === "B") paintState.tool = "brush";
      if (e.key === "p" || e.key === "P") paintState.tool = "pencil";
      if (e.key === "e" || e.key === "E") paintState.tool = "eraser";
      if (e.key === "g" || e.key === "G") paintState.tool = "fill";
      if (e.key === "i" || e.key === "I") paintState.tool = "pick";
      if (e.key === "h" || e.key === "H") paintState.tool = "hand";
      if (e.key === "m" || e.key === "M") paintState.tool = "move_sel";
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomBy(1);
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomBy(-1);
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        fitView();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        nudgePan(-PAN_STEP, 0);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nudgePan(PAN_STEP, 0);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        nudgePan(0, -PAN_STEP);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        nudgePan(0, PAN_STEP);
        return;
      }
      paintChrome();
    });
    window.addEventListener("keyup", function (e) {
      if (e.code === "Space") {
        spaceDown = false;
        applyToolCursor();
      }
    });
  }
  function unmount() {
    clearLiveAlgorithm();
    if (livePreviewWatchTimer) {
      clearInterval(livePreviewWatchTimer);
      livePreviewWatchTimer = 0;
    }
    if (textureListWatchTimer) {
      clearInterval(textureListWatchTimer);
      textureListWatchTimer = 0;
    }
    textureListWatchBusy = false;
    textureListLastSignature = "";
    textureListRevision = -2;
    if (livePreviewRaf) {
      cancelAnimationFrame(livePreviewRaf);
      livePreviewRaf = 0;
    }
    livePreviewDirty = false;
    livePreviewLastSignature = "";
    if (host) host.removeAttribute("data-paint-ready");
    var dock = global.document.getElementById("paintDock");
    if (dock) dock.innerHTML = "";
    var bar = global.document.getElementById("paintTopBar");
    if (bar) bar.innerHTML = "";
  }
  global.RenderDragonPaint = {
    mount: mount,
    isDirty: isDirty,
    flushPending: flushPending,
    resetWorkspaceTexture: resetWorkspaceTexture,
    loadTexture: afterLoad,
    getPayload: paintPayload,
    openBatchDialog: generateAllTexturesPbr,
    unmount: unmount,
    session: paintState,
    setMaterialWorkflow: setMaterialWorkflow,
    setWorkflowStage: setWorkflowStage,
    encodeMERS: encodeCurrentMERS,
    exportMERS: exportNativeMERS,
    encodeFIO: encodeCurrentFIO,
    encodeSelected: encodeSelected,
    getCombinedFrame: getCombinedFrame,
    setTarget: chooseTarget,
    flushPreviews: flushAllLivePreviewSync,
    exportFIO: exportFourInOneTexture,
    exportNativeGroup: exportNativeMaterialFiles,
    flushLive: flushLiveAlgorithm,
    setChannelValue: function (id, value) {
      if (["metal", "emissive", "roughness", "sub"].indexOf(id) < 0)
        throw new Error("未知 MERS 通道");
      paintState.layer = id;
      paintState.workflowStage = id;
      paintState.uniform[id] = Math.max(
        0,
        Math.min(255, Math.round(Number(value) || 0)),
      );
      fillUniformToLayer();
    },
    undo: undo,
    redo: redo,
    resetPaint: resetPaint,
    tools: TOOLS,
    syncPipeline: function (pipe, open) {
      if (pipe != null) paintState.pipeline = pipe;
      if (open != null) paintState.packOpen = !!open;
      previewCache = {};
      paintChrome();
      scheduleAllLivePreviewSync();
    },
    applySelected: function () {
      if (paintState.applyGlow) paintState.applyGlow(false);
    },
    applyAll: function () {
      if (paintState.applyGlow) paintState.applyGlow(true);
    },
    catalogTimes: function () {
      return paintState.catalogTimes ? paintState.catalogTimes() : {};
    },
    selectedGlowIds: function () {
      return paintState.selectedGlowIds ? paintState.selectedGlowIds() : [];
    },
    glowPayload: function (all) {
      var t = paintState.catalogTimes ? paintState.catalogTimes() : {};
      t.ids = all
        ? "all"
        : paintState.selectedGlowIds
          ? paintState.selectedGlowIds()
          : "all";
      return t;
    },
  };
})(window);
