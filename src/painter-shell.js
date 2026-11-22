(function () {
  var packOpen = false;
  var currentPipeline = "";
  var selected = {
    path: "",
    name: "",
  };
  function $(id) {
    return document.getElementById(id);
  }
  function toast(msg) {
    var el = $("toast");
    if (!el) return;
    el.textContent = msg || "";
    el.style.display = "block";
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.style.display = "none";
    }, 2200);
  }
  var pbrLayoutEngine = null;
  function pbrLayoutKey(el, prefix, index) {
    var current = el.getAttribute("data-layout-key");
    if (current) return current;
    var id = el.id || "";
    var lab =
      el.querySelector &&
      el.querySelector("b,.plain,.phd,.paint-pane-heading,.paint-head");
    var text = ((lab && lab.textContent) || el.textContent || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 72);
    return prefix + ":" + (id || text || "item") + ":" + index;
  }
  function bindHorizontalWheel(el) {
    if (!el || el.getAttribute("data-wheel-bound") === "1") return;
    el.setAttribute("data-wheel-bound", "1");
    el.addEventListener(
      "wheel",
      function (e) {
        if (
          el.scrollWidth <= el.clientWidth + 1 ||
          Math.abs(e.deltaY) <= Math.abs(e.deltaX)
        )
          return;
        var max = Math.max(0, el.scrollWidth - el.clientWidth),
          d = e.deltaY;
        if (
          (d < 0 && el.scrollLeft <= 1) ||
          (d > 0 && el.scrollLeft >= max - 1)
        )
          return;
        e.preventDefault();
        el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + d));
      },
      {
        passive: false,
      },
    );
  }
  function setPackSidebar(open) {
    var panel = $("packPanel"),
      btn = $("packDrawerBtn");
    if (!panel) return;
    panel.classList.toggle("collapsed", !open);
    if (btn) {
      btn.classList.toggle("on", !!open);
      btn.setAttribute("aria-pressed", open ? "true" : "false");
    }
    try {
      localStorage.setItem("renderdragon_pbr_pack_sidebar", open ? "1" : "0");
    } catch (e) {}
    if (pbrLayoutEngine && pbrLayoutEngine.queueRefresh)
      pbrLayoutEngine.queueRefresh();
  }
  function setupPbrLayout() {
    var core = parent && parent.RenderDragonDockLayout;
    if (!core || !core.create) return;
    try {
      [
        "renderdragon_pbr_layout",
        "renderdragon_pbr_texture_browser_h",
        "renderdragon_pbr_flow_layout_v3",
        "renderdragon_pbr_flow_layout_v4",
        "renderdragon_pbr_dock_layout_v5",
      ].forEach(function (k) {
        localStorage.removeItem(k);
      });
    } catch (e) {}
    pbrLayoutEngine = core.create({
      document: document,
      storageKey: "renderdragon_pbr_dock_layout_v6",
      rootClass: "pbr-layout-editing",
      editButton: "#pbrLayoutEditBtn",
      resetButton: "#pbrLayoutResetBtn",
      editText: "调整布局",
      doneText: "完成布局",
      groups: [
        {
          id: "pbr-shell",
          parent: ".workspace",
          selector: ":scope > #packPanel,:scope > #pbrEditorPanel",
          axis: "x",
          minWidth: 240,
          minHeight: 320,
          key: function (el, i) {
            return pbrLayoutKey(el, "shell", i);
          },
        },
        {
          id: "pbr-panes",
          parent: "#paintSplit",
          selector:
            ":scope > #paintTexturePane,:scope > #paintDock,:scope > #paintStudioHost",
          axis: "x",
          minWidth: 260,
          minHeight: 260,
          key: function (el, i) {
            return pbrLayoutKey(el, "pane", i);
          },
        },
        {
          id: "pbr-tools-paint",
          parent: '[data-editor-panel="paint"]',
          selector: ":scope > *",
          axis: "y",
          minWidth: 240,
          minHeight: 38,
          key: function (el, i) {
            return pbrLayoutKey(el, "paint", i);
          },
        },
        {
          id: "pbr-tools-material",
          parent: '[data-editor-panel="material"]',
          selector: ":scope > *",
          axis: "y",
          minWidth: 240,
          minHeight: 38,
          key: function (el, i) {
            return pbrLayoutKey(el, "material", i);
          },
        },
        {
          id: "pbr-tools-glow",
          parent: '[data-editor-panel="glow"]',
          selector: ":scope > *",
          axis: "y",
          minWidth: 240,
          minHeight: 38,
          key: function (el, i) {
            return pbrLayoutKey(el, "glow", i);
          },
        },
        {
          id: "pbr-pack-content",
          parent: function () {
            return document.querySelector("#packPanel > .preview-wrap");
          },
          selector:
            ":scope > .pack-status,:scope > .pack-field,:scope > #createPackBtnSide,:scope > .hint,:scope > .pack-list-head,:scope > .pack-list",
          axis: "y",
          minWidth: 210,
          minHeight: 34,
          key: function (el, i) {
            return pbrLayoutKey(el, "pack", i);
          },
        },
        {
          id: "pbr-topbar",
          parent: function () {
            return document.querySelector("#paintTopBar .paint-topbar-inner");
          },
          selector: ":scope > .paint-topbar-row",
          axis: "wrap",
          minWidth: 110,
          minHeight: 38,
          key: function (el, i) {
            return pbrLayoutKey(el, "topbar", i);
          },
        },
      ],
    });
    window.RenderDragonPbrLayoutEngine = pbrLayoutEngine;
    var edit = $("pbrLayoutEditBtn");
    if (edit)
      edit.addEventListener("click", function () {
        toast(
          document.documentElement.classList.contains("pbr-layout-editing")
            ? "布局编辑模式已开启。可拖动面板调整位置，并通过边缘或角点调整尺寸。"
            : "PBR 布局已保存",
        );
      });
    var reset = $("pbrLayoutResetBtn");
    if (reset)
      reset.addEventListener("click", function () {
        toast("PBR 布局已复位");
      });
    var packBtn = $("packDrawerBtn"),
      closeBtn = $("closePackPanelBtn");
    if (packBtn)
      packBtn.onclick = function () {
        setPackSidebar($("packPanel").classList.contains("collapsed"));
      };
    if (closeBtn)
      closeBtn.onclick = function () {
        setPackSidebar(false);
      };
    var kept = false;
    try {
      kept = localStorage.getItem("renderdragon_pbr_pack_sidebar") === "1";
    } catch (e) {}
    setPackSidebar(kept);
    bindHorizontalWheel(document.querySelector(".tb-actions"));
    bindHorizontalWheel($("paintTopBar"));
  }
  function deskCall(op, data) {
    if (
      !parent ||
      !parent.RenderDragonBridge ||
      !parent.RenderDragonBridge.materialCall
    ) {
      return Promise.resolve({
        ok: false,
        reason: "材质桥接未加载",
      });
    }
    return Promise.resolve(
      parent.RenderDragonBridge.materialCall(op, data || {}),
    );
  }
  function pipelineZh(pipe) {
    return pipe === "opengl" ? "OP FIO 四分区" : "渲染龙材质文件组";
  }
  function remountPaint() {
    if (!window.RenderDragonPaint) return;
    var host = document.getElementById("paintStudioHost");
    if (!host) return;
    if (window.RenderDragonPaint.unmount) {
      try {
        window.RenderDragonPaint.unmount();
      } catch (e) {}
    }
    window.RenderDragonPaint.mount(host, {
      deskCall: deskCall,
      toast: toast,
      packOpen: packOpen,
      state: {
        pipeline: currentPipeline,
      },
      pipeline: currentPipeline,
      pendingPipeline: currentPipeline,
      paintFirst: false,
      getTargetPackPath: function () {
        var sel = document.getElementById("glowTargetPack");
        if (sel && sel.value) return sel.value;
        return (
          (selected && selected.path) ||
          ($("packPath") && $("packPath").value) ||
          ""
        );
      },
      buildTargetPackRow: function () {
        var wrap = document.createElement("div");
        wrap.className = "paint-opts";
        var lab = document.createElement("div");
        lab.className = "plain";
        lab.textContent = "自发光写入目标资源包";
        wrap.appendChild(lab);
        var row = document.createElement("div");
        row.className = "row";
        var sel = document.createElement("select");
        sel.id = "glowTargetPack";
        sel.className = "search";
        sel.style.margin = "0";
        sel.style.flex = "1";
        var cur =
          (selected && selected.path) ||
          ($("packPath") && $("packPath").value) ||
          "";
        var opt0 = document.createElement("option");
        opt0.value = "";
        opt0.textContent = packOpen
          ? "当前打开的资源包"
          : "请先打开资源包或从已授权资源包中选择";
        sel.appendChild(opt0);
        (window._renderDragonPainterPacks || []).forEach(function (item) {
          var o = document.createElement("option");
          o.value = item.path || "";
          o.textContent =
            (item.name || "未命名") +
            (item.pipeline ? " · " + item.pipeline : "");
          if (item.path && item.path === cur) o.selected = true;
          sel.appendChild(o);
        });
        var browse = document.createElement("button");
        browse.type = "button";
        browse.className = "tb-btn";
        browse.style.color = "var(--ink)";
        browse.style.background = "var(--chip)";
        browse.textContent = "选择资源包";
        browse.onclick = function () {
          openPack(true);
        };
        row.appendChild(sel);
        row.appendChild(browse);
        wrap.appendChild(row);
        return wrap;
      },
    });
    if (pbrLayoutEngine) pbrLayoutEngine.queueRefresh();
  }
  function applyPackDoc(doc) {
    if (!doc || !doc.ok) return;
    packOpen = true;
    var pipe = doc.pipeline || (doc.meta && doc.meta.pipeline) || "";
    currentPipeline = pipe;
    if (window.RenderDragonPaint && window.RenderDragonPaint.session) {
      window.RenderDragonPaint.session.packOpen = true;
      window.RenderDragonPaint.session.pipeline = pipe;
    }
    var name = (doc.meta && doc.meta.name) || "已打开";
    var root = (doc.meta && doc.meta.root) || "";
    var pipeZh = pipelineZh(pipe);
    if ($("capName"))
      $("capName").textContent = name + (pipeZh ? " · " + pipeZh : "");
    if ($("capPro"))
      $("capPro").textContent = root || "RenderDragon PBR 材质写入当前资源包";
    if (
      $("packPipeline") &&
      $("packPipeline").querySelector('option[value="' + pipe + '"]')
    )
      $("packPipeline").value = pipe;
    if ($("phdLive"))
      $("phdLive").textContent = name + (pipeZh ? " · " + pipeZh : " · 已打开");
    if ($("packPath") && root) $("packPath").value = root;
    selected = {
      path: root,
      name: name,
    };
    try {
      if (root) localStorage.setItem("renderdragon-mat-pack-path", root);
    } catch (e) {}
    remountPaint();
    if (window.RenderDragonPaint && window.RenderDragonPaint.syncPipeline)
      window.RenderDragonPaint.syncPipeline(pipe, true);
  }
  function fillLibrary(items, libDir) {
    window._renderDragonPainterPacks = items || [];
    var box = $("packList");
    if (!box) return;
    box.innerHTML = "";
    if (libDir && $("libHint")) {
      $("libHint").textContent =
        "浏览器本机授权记录  RenderDragon 写 Texture Set / MER / MERS / Normal";
    }
    (items || []).forEach(function (row) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "pack-item" +
        (selected.path && row.path === selected.path ? " on" : "");
      btn.innerHTML = "<b></b><span></span>";
      btn.querySelector("b").textContent = row.name || "未命名";
      btn.querySelector("span").textContent = row.path || "";
      btn.onclick = function () {
        selected = {
          path: row.path || "",
          name: row.name || "",
        };
        if ($("packPath")) $("packPath").value = selected.path;
        openPack(false);
      };
      box.appendChild(btn);
    });
    if (!(items || []).length) {
      var empty = document.createElement("div");
      empty.className = "hint";
      empty.textContent =
        "当前没有已授权的资源包。可创建新资源包或选择现有资源包。";
      box.appendChild(empty);
    }
    var glowSel = document.getElementById("glowTargetPack");
    if (glowSel) {
      var keep = glowSel.value || (selected && selected.path) || "";
      glowSel.innerHTML = "";
      var opt0 = document.createElement("option");
      opt0.value = "";
      opt0.textContent = packOpen
        ? "当前打开的资源包"
        : "请先打开资源包或从已授权资源包中选择";
      glowSel.appendChild(opt0);
      (items || []).forEach(function (item) {
        var o = document.createElement("option");
        o.value = item.path || "";
        o.textContent =
          (item.name || "未命名") +
          (item.pipeline ? " · " + item.pipeline : "");
        if (item.path && item.path === keep) o.selected = true;
        glowSel.appendChild(o);
      });
    }
  }
  function loadMine() {
    deskCall("library", {})
      .then(function (doc) {
        fillLibrary((doc && doc.items) || [], doc && doc.library_dir);
      })
      .catch(function () {
        fillLibrary([], "");
      });
  }
  async function openPack(forcePick) {
    var path = (($("packPath") && $("packPath").value) || "").trim();
    if (!path && selected.path) path = selected.path;
    try {
      var doc = await deskCall("open", {
        path: path,
        pick: !!forcePick || !path,
      });
      if (!doc || !doc.ok) {
        toast((doc && doc.reason) || "打开失败");
        return;
      }
      applyPackDoc(doc);
      loadMine();
      toast("已打开 " + ((doc.meta && doc.meta.name) || ""));
    } catch (e) {
      toast("打开失败");
    }
  }
  async function createPack() {
    var name = (($("newPackName") && $("newPackName").value) || "").trim();
    var pipeline =
      ($("packPipeline") && $("packPipeline").value) || "renderdragon";
    try {
      var doc = await deskCall("create", {
        name: name || "材质包",
        pipeline: pipeline,
      });
      if (!doc || !doc.ok) {
        toast((doc && doc.reason) || "创建失败");
        return;
      }
      applyPackDoc(doc);
      loadMine();
      var pipeZh = pipelineZh(pipeline) || pipeline;
      toast("已创建" + pipeZh + " " + ((doc.meta && doc.meta.name) || ""));
    } catch (e) {
      toast("创建失败");
    }
  }
  $("browseBtn").onclick = function () {
    openPack(true);
  };
  $("openPackBtn").onclick = function () {
    openPack(false);
  };
  $("createPackBtn").onclick = createPack;
  if ($("createPackBtnSide")) $("createPackBtnSide").onclick = createPack;
  $("themeBtn").onclick = function () {
    if (parent && parent.document && parent.document.getElementById("themeBtn"))
      parent.document.getElementById("themeBtn").click();
    else {
      var html = document.documentElement;
      html.setAttribute(
        "data-theme",
        html.getAttribute("data-theme") === "light" ? "dark" : "light",
      );
    }
  };
  try {
    var kept = localStorage.getItem("renderdragon-mat-pack-path");
    if (kept && $("packPath")) $("packPath").value = kept;
  } catch (e) {}
  if ($("packPipeline")) {
    $("packPipeline").onchange = function () {
      currentPipeline = $("packPipeline").value || "";
      if (window.RenderDragonPaint && window.RenderDragonPaint.syncPipeline) {
        window.RenderDragonPaint.syncPipeline(currentPipeline, packOpen);
      }
    };
    currentPipeline = $("packPipeline").value || currentPipeline;
  }
  remountPaint();
  setupPbrLayout();
  loadMine();
  deskCall("read", {})
    .then(function (doc) {
      if (doc && doc.open)
        applyPackDoc(
          Object.assign(
            {
              ok: true,
            },
            doc,
          ),
        );
    })
    .catch(function () {});
})();
