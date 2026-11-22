(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const schema = window.RenderDragonSchema;
  const bridge = window.RenderDragonBridge;
  const colorPicker = window.RenderDragonColorPicker;
  let state = {
    open: false,
    biomes: [],
    categories: {},
    recipes: [],
    reference_presets: [],
    biome_meta: {},
  };
  let biome = "cherry_grove";
  let activeTab = "fog";
  let dirty = false;
  let loadedBaseline = null;
  let busy = false;
  let painterProject = null;
  let preparedPainter = null;
  const workspace = window.RenderDragonWorkspace;
  let biomeMode = "current";
  const selectedBiomes = new Set();
  let toastTimer = 0;
  let modalResolver = null;
  let painterLoaded = false;
  let workspaceLayoutBound = false;
  function clone(v) {
    return v == null ? v : JSON.parse(JSON.stringify(v));
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function num(v, d = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function toast(msg, bad = false) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.className = "toast"), 2300);
  }
  async function api(op, data = {}) {
    const d = await bridge.editorCall(
      op,
      Object.assign(
        {
          biome,
        },
        data,
      ),
    );
    if (!d?.ok) {
      toast(d?.reason || "操作失败", true);
    } else if (d.reason) {
      toast(d.reason);
    }
    return d;
  }
  function getPath(obj, path) {
    return window.RenderDragonCore.getPath(obj, path);
  }
  function setPath(obj, path, val) {
    return window.RenderDragonCore.setPath(obj, path, val);
  }
  function isKey(v) {
    return (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      Object.keys(v).length > 0 &&
      Object.keys(v).every((k) => Number.isFinite(Number(k)))
    );
  }
  function slotKey(slot) {
    return (
      state.time_slots?.[slot] ||
      {
        noon: "0.0",
        dusk: "0.25",
        night: "0.5",
        dawn: "0.75",
      }[slot] ||
      String(slot || "0.0")
    );
  }
  function timed(v, slot) {
    if (!isKey(v)) return v;
    const key = slotKey(slot);
    if (Object.prototype.hasOwnProperty.call(v, key)) return v[key];
    const ks = Object.keys(v).sort(
      (a, b) =>
        Math.abs(Number(a) - Number(key)) - Math.abs(Number(b) - Number(key)),
    );
    return v[ks[0]];
  }
  function categoryData(cat = activeTab) {
    return state.categories?.[cat]?.data || {};
  }
  function markDirty() {
    const p = stagedPayload();
    dirty = !!(Object.keys(p.categories).length || p.binding);
    renderMeta();
    renderStatus();
  }
  function stagePath(category, path, value, slot = null) {
    const body = state.categories?.[category]?.data;
    if (!body) return false;
    if (slot) {
      const old = getPath(body, path);
      let out;
      if (isKey(old)) out = clone(old);
      else
        out = {
          "0.0": clone(old),
          0.25: clone(old),
          0.5: clone(old),
          0.75: clone(old),
        };
      out[slotKey(slot)] = clone(value);
      setPath(body, path, out);
    } else setPath(body, path, value);
    markDirty();
    return true;
  }
  function stageReferenceValue(category, path, value) {
    const body = state.categories?.[category]?.data;
    if (!body) return false;
    const old = getPath(body, path);
    if (isKey(old)) {
      const out = clone(old);
      Object.keys(out).forEach((k) => (out[k] = clone(value)));
      setPath(body, path, out);
    } else setPath(body, path, value);
    return true;
  }
  function hexFromArray(a, norm = false) {
    if (!Array.isArray(a))
      return typeof a === "string" && /^#[0-9a-f]{6}$/i.test(a)
        ? a.toUpperCase()
        : "#000000";
    const z = a
      .slice(0, 3)
      .map((x) => clamp(Math.round(Number(x || 0) * (norm ? 255 : 1)), 0, 255));
    return (
      "#" +
      z
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  }
  function rgbFromHex(h, norm = false) {
    h = String(h || "#000000").replace("#", "");
    if (h.length === 3)
      h = h
        .split("")
        .map((x) => x + x)
        .join("");
    const a = [
      parseInt(h.slice(0, 2), 16) || 0,
      parseInt(h.slice(2, 4), 16) || 0,
      parseInt(h.slice(4, 6), 16) || 0,
    ];
    return norm ? a.map((x) => Math.round((x / 255) * 1000000) / 1000000) : a;
  }
  function preserveColorType(old, hex, normalized = false) {
    if (Array.isArray(old))
      return rgbFromHex(
        hex,
        normalized || old.some((x) => Number(x) > 0 && Number(x) < 1),
      );
    return String(hex).toUpperCase();
  }
  function biomeMeta(id) {
    return (
      state.biome_meta?.[id] || {
        name_cn: id,
        category: "其他",
      }
    );
  }
  function currentChips() {
    const l = categoryData("lighting"),
      f = categoryData("fog");
    let sun = getPath(l, "directional_lights.orbital.sun.illuminance"),
      orbit = getPath(l, "directional_lights.orbital.orbital_offset_degrees");
    if (isKey(sun)) sun = timed(sun, "noon");
    if (isKey(orbit)) orbit = timed(orbit, "noon");
    return {
      sun,
      orbit,
      fog_density: getPath(f, "volumetric.density.air.max_density"),
      anisotropy: getPath(
        f,
        "volumetric.henyey_greenstein_g.air.henyey_greenstein_g",
      ),
    };
  }
  function stagedPayload(full = false) {
    const categories = {};
    for (const [key, value] of Object.entries(state.categories || {})) {
      if (
        value?.exists &&
        value.data &&
        typeof value.data === "object" &&
        !Array.isArray(value.data) &&
        (full ||
          !workspace.equal(value.data, loadedBaseline?.categories?.[key]?.data))
      )
        categories[key] = clone(value.data);
    }
    const payload = {
      categories,
    };
    if (
      full ||
      !workspace.equal(
        state.binding?.components || {},
        loadedBaseline?.binding?.components || {},
      )
    )
      payload.binding = {
        components: clone(state.binding?.components || {}),
      };
    if (full) payload.chips = currentChips();
    return payload;
  }
  function professionalLabel(v) {
    v = String(v || "");
    const i = v.indexOf(" · ");
    return (i > 0 ? v.slice(0, i) : v).trim();
  }
  let mainLayoutManager = null;
  const UI_THEME_STORAGE = "renderdragon_ui_theme_v1";
  const UI_LAYOUT_STORAGE = "renderdragon_main_dock_layout_v6";
  const PBR_LAYOUT_STORAGE = "renderdragon_pbr_dock_layout_v6";
  const UI_THEME_TOKENS = [
    ["--bg", "页面背景"],
    ["--surface", "主面板"],
    ["--surface-2", "次级面板"],
    ["--surface-3", "悬停与浮层"],
    ["--input", "输入框背景"],
    ["--line", "分隔线"],
    ["--line-strong", "强调边框"],
    ["--text", "主要文字"],
    ["--muted", "次要文字"],
    ["--faint", "弱提示文字"],
    ["--accent", "主操作色"],
    ["--accent-strong", "强调文字"],
    ["--accent-ink", "主操作色文字"],
    ["--danger", "错误"],
    ["--warning", "警告"],
    ["--success", "成功"],
  ];
  const UI_THEME_DEFAULTS = {
    dark: {
      "--bg": "#000000",
      "--surface": "#1C1F22",
      "--surface-2": "#23272B",
      "--surface-3": "#2A2F34",
      "--input": "#121416",
      "--line": "#343A40",
      "--line-strong": "#505860",
      "--text": "#F2EFE8",
      "--muted": "#AAA69D",
      "--faint": "#8D8A83",
      "--accent": "#D6A45A",
      "--accent-strong": "#EFC779",
      "--accent-ink": "#1A1309",
      "--danger": "#DF777C",
      "--warning": "#D6A45A",
      "--success": "#77B58E",
    },
    light: {
      "--bg": "#EBE9E4",
      "--surface": "#F8F6F1",
      "--surface-2": "#EFEDE7",
      "--surface-3": "#E4E1D9",
      "--input": "#FFFDFA",
      "--line": "#CDC8BD",
      "--line-strong": "#AAA497",
      "--text": "#292824",
      "--muted": "#67645D",
      "--faint": "#706C65",
      "--accent": "#8A5A24",
      "--accent-strong": "#6D4218",
      "--accent-ink": "#FFFAF0",
      "--danger": "#A54E54",
      "--warning": "#94631F",
      "--success": "#4F7F61",
    },
  };
  let uiThemeState = {
    dark: {},
    light: {},
  };
  function safeStorageJson(key, fallback = {}) {
    try {
      return JSON.parse(localStorage.getItem(key) || "") || fallback;
    } catch (e) {
      return fallback;
    }
  }
  function currentThemeMode() {
    return document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
  }
  function validHex(v) {
    return /^#[0-9a-f]{6}$/i.test(String(v || ""));
  }
  function loadThemeState() {
    const d = safeStorageJson(UI_THEME_STORAGE, {
      dark: {},
      light: {},
    });
    uiThemeState = {
      dark: d.dark && typeof d.dark === "object" ? d.dark : {},
      light: d.light && typeof d.light === "object" ? d.light : {},
    };
  }
  function saveThemeState() {
    try {
      localStorage.setItem(UI_THEME_STORAGE, JSON.stringify(uiThemeState));
    } catch (e) {}
  }
  function themeValue(token, mode = currentThemeMode()) {
    const custom = uiThemeState?.[mode]?.[token];
    return validHex(custom)
      ? custom.toUpperCase()
      : UI_THEME_DEFAULTS[mode][token];
  }
  function resolvedThemeMap(mode) {
    const out = {};
    UI_THEME_TOKENS.forEach(
      ([token]) => (out[token] = themeValue(token, mode)),
    );
    return out;
  }
  function applyThemeState() {
    const root = document.documentElement,
      mode = currentThemeMode();
    UI_THEME_TOKENS.forEach(([token]) => {
      const v = uiThemeState?.[mode]?.[token];
      if (validHex(v)) root.style.setProperty(token, v.toUpperCase());
      else root.style.removeProperty(token);
    });
    root.style.colorScheme = mode;
    syncThemeToPainter();
  }
  function setThemeMode(mode) {
    mode = mode === "light" ? "light" : "dark";
    document.documentElement.classList.toggle("light", mode === "light");
    try {
      localStorage.setItem("renderdragon_theme", mode);
    } catch (e) {}
    applyThemeState();
    renderAppearancePanel();
  }
  function syncThemeToPainter() {
    const frame = $("#painterFrame");
    if (!frame || !frame.contentDocument) return;
    const pr = frame.contentDocument.documentElement;
    if (!pr) return;
    const mode = currentThemeMode();
    pr.setAttribute("data-theme", mode);
    const map = {
      "--bg": "--bg0",
      "--surface": "--panel",
      "--surface-2": "--panel2",
      "--text": "--ink",
      "--muted": "--muted",
      "--line": "--line",
      "--line-strong": "--line-strong",
      "--accent": "--accent",
      "--accent-strong": "--accent-strong",
      "--accent-ink": "--accent-ink",
      "--input": "--input",
      "--danger": "--danger",
      "--warning": "--warning",
      "--success": "--success",
    };
    Object.entries(map).forEach(([src, dst]) =>
      pr.style.setProperty(dst, themeValue(src, mode)),
    );
    pr.style.setProperty("--chip", themeValue("--surface-2", mode));
    pr.style.setProperty("--title", themeValue("--surface", mode));
  }
  let appearanceSelectedToken = "--accent";
  function hexRgbUi(hex) {
    hex = String(hex || "").replace("#", "");
    return [
      parseInt(hex.slice(0, 2), 16) || 0,
      parseInt(hex.slice(2, 4), 16) || 0,
      parseInt(hex.slice(4, 6), 16) || 0,
    ];
  }
  function rgbHexUi(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map((v) =>
          clamp(Math.round(Number(v) || 0), 0, 255)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
        .toUpperCase()
    );
  }
  function setThemeToken(
    token,
    value,
    mode = currentThemeMode(),
    persistNow = true,
  ) {
    if (!validHex(value)) return false;
    value = value.toUpperCase();
    if (!uiThemeState[mode]) uiThemeState[mode] = {};
    uiThemeState[mode][token] = value;
    if (persistNow) saveThemeState();
    applyThemeState();
    return true;
  }
  function syncAppearanceLiveEditor() {
    const mode = currentThemeMode();
    if (!UI_THEME_TOKENS.some((row) => row[0] === appearanceSelectedToken))
      appearanceSelectedToken = "--accent";
    const meta = UI_THEME_TOKENS.find(
      (row) => row[0] === appearanceSelectedToken,
    ) || ["--accent", "主操作色"];
    const value = themeValue(appearanceSelectedToken, mode),
      rgb = hexRgbUi(value);
    const title = $("#appearanceSelectedTitle"),
      swatch = $("#appearanceSelectedSwatch"),
      hex = $("#appearanceSelectedHex");
    if (title) title.textContent = meta[1];
    if (swatch) swatch.style.background = value;
    if (hex) hex.textContent = value;
    [
      ["#appearanceR", "#appearanceRValue", rgb[0]],
      ["#appearanceG", "#appearanceGValue", rgb[1]],
      ["#appearanceB", "#appearanceBValue", rgb[2]],
    ].forEach(([a, b, v]) => {
      const i = $(a),
        o = $(b);
      if (i) i.value = String(v);
      if (o) o.textContent = String(v);
    });
  }
  function renderAppearancePanel() {
    const host = $("#appearanceColors");
    if (!host) return;
    const mode = currentThemeMode();
    $("#appearanceModeLabel").textContent =
      mode === "light" ? "浅色主题" : "深色主题";
    const groups = [
      [
        "基础",
        [
          "--bg",
          "--surface",
          "--surface-2",
          "--surface-3",
          "--input",
          "--line",
          "--line-strong",
        ],
      ],
      ["文字", ["--text", "--muted", "--faint"]],
      [
        "操作与状态",
        [
          "--accent",
          "--accent-strong",
          "--accent-ink",
          "--danger",
          "--warning",
          "--success",
        ],
      ],
    ];
    const labelMap = Object.fromEntries(UI_THEME_TOKENS);
    host.innerHTML = groups
      .map(
        ([title, tokens]) =>
          `<section class="appearance-color-group"><h3>${esc(title)}</h3>${tokens
            .map((token) => {
              const v = themeValue(token, mode);
              return `<div class="appearance-color-row ${token === appearanceSelectedToken ? "selected" : ""}" data-theme-token="${esc(token)}"><button class="appearance-token-pick" type="button" data-pick-token="${esc(token)}"><span>${esc(labelMap[token] || token)}</span><small>${esc(token)}</small></button><input type="color" value="${esc(v)}" aria-label="${esc(labelMap[token] || token)}"><input type="text" value="${esc(v)}" spellcheck="false" aria-label="${esc(labelMap[token] || token)} HEX"></div>`;
            })
            .join("")}</section>`,
      )
      .join("");
    host.querySelectorAll("[data-theme-token]").forEach((row) => {
      const token = row.dataset.themeToken,
        color = row.querySelector("input[type=color]"),
        text = row.querySelector("input[type=text]");
      const select = () => {
        appearanceSelectedToken = token;
        host
          .querySelectorAll("[data-theme-token]")
          .forEach((x) => x.classList.toggle("selected", x === row));
        syncAppearanceLiveEditor();
      };
      row.querySelector("[data-pick-token]").onclick = select;
      row.addEventListener("pointerdown", (e) => {
        if (e.target.matches("input")) select();
      });
      const commit = (v) => {
        if (!validHex(v)) return;
        text.value = v.toUpperCase();
        color.value = v;
        appearanceSelectedToken = token;
        setThemeToken(token, v, mode, true);
        syncAppearanceLiveEditor();
      };
      color.oninput = () => commit(color.value);
      text.oninput = () => {
        if (validHex(text.value)) commit(text.value);
      };
      text.onblur = () => {
        if (!validHex(text.value)) text.value = themeValue(token, mode);
      };
    });
    syncAppearanceLiveEditor();
  }
  function bindAppearanceLiveChannels() {
    const ids = ["#appearanceR", "#appearanceG", "#appearanceB"];
    ids.forEach((sel, idx) => {
      const input = $(sel);
      if (!input || input.dataset.liveBound) return;
      input.dataset.liveBound = "1";
      input.oninput = () => {
        const rgb = ids.map((x) => Number($(x).value) || 0),
          hex = rgbHexUi(rgb[0], rgb[1], rgb[2]);
        setThemeToken(appearanceSelectedToken, hex, currentThemeMode(), true);
        syncAppearanceLiveEditor();
        const row = $(`[data-theme-token="${appearanceSelectedToken}"]`);
        if (row) {
          const c = row.querySelector("input[type=color]"),
            t = row.querySelector("input[type=text]");
          if (c) c.value = hex;
          if (t) t.value = hex;
        }
      };
    });
  }
  function setInspectorTab(id) {
    $$("[data-inspector-tab]").forEach((b) =>
      b.classList.toggle("active", b.dataset.inspectorTab === id),
    );
    $$("[data-inspector-view]").forEach((v) =>
      v.classList.toggle("active", v.dataset.inspectorView === id),
    );
    $(".inspector-body")?.scrollTo(0, 0);
  }
  function openAppearancePanel() {
    setInspectorTab("appearance");
    renderAppearancePanel();
  }
  function closeAppearancePanel() {
    setInspectorTab("help");
  }
  function exportUiSettings() {
    const pbrEngine =
      $("#painterFrame")?.contentWindow?.RenderDragonPbrLayoutEngine;
    const data = {
      format: "renderdragon-ui-settings",
      version: 6,
      layout_engine: "dock-v6",
      theme_mode: currentThemeMode(),
      themes: {
        dark: resolvedThemeMap("dark"),
        light: resolvedThemeMap("light"),
      },
      layout: {
        main:
          mainLayoutManager?.exportState() ||
          safeStorageJson(UI_LAYOUT_STORAGE, {
            version: 6,
            groups: {},
          }),
        pbr:
          pbrEngine?.exportState?.() ||
          safeStorageJson(PBR_LAYOUT_STORAGE, {
            version: 6,
            groups: {},
          }),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2) + "\n"], {
        type: "application/json",
      }),
      a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "RenderDragon_界面参数.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("界面参数已导出");
  }
  async function importUiSettingsFile(file) {
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch (e) {
      toast("界面参数 JSON 无法解析", true);
      return;
    }
    if (!data || data.format !== "renderdragon-ui-settings") {
      toast("不是 RenderDragon 界面参数文件", true);
      return;
    }
    if (data.themes && typeof data.themes === "object") {
      uiThemeState = {
        dark: data.themes.dark || {},
        light: data.themes.light || {},
      };
      saveThemeState();
    }
    if (data.theme_mode) setThemeMode(data.theme_mode);
    else applyThemeState();
    const layoutCompatible =
      Number(data.version) >= 6 && data.layout_engine === "dock-v6";
    if (layoutCompatible && data.layout?.main && mainLayoutManager)
      mainLayoutManager.importState(data.layout.main);
    if (layoutCompatible && data.layout?.pbr) {
      try {
        localStorage.setItem(
          PBR_LAYOUT_STORAGE,
          JSON.stringify(data.layout.pbr),
        );
      } catch (e) {}
      const pe = $("#painterFrame")?.contentWindow?.RenderDragonPbrLayoutEngine;
      pe?.importState?.(data.layout.pbr);
    }
    renderAppearancePanel();
    toast(
      layoutCompatible ? "界面参数已导入" : "已导入配色  旧版布局参数已忽略",
    );
  }
  function bindHorizontalWheel(el) {
    if (!el || el.dataset.wheelBound) return;
    el.dataset.wheelBound = "1";
    el.addEventListener(
      "wheel",
      (e) => {
        if (el.scrollWidth <= el.clientWidth + 1) return;
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        const max = Math.max(0, el.scrollWidth - el.clientWidth),
          d = e.deltaY;
        if (
          (d < 0 && el.scrollLeft <= 1) ||
          (d > 0 && el.scrollLeft >= max - 1)
        )
          return;
        e.preventDefault();
        el.scrollLeft = clamp(el.scrollLeft + d, 0, max);
      },
      {
        passive: false,
      },
    );
  }
  function setupWorkspaceLayout() {
    if (workspaceLayoutBound) return;
    workspaceLayoutBound = true;
    [
      "renderdragon_main_layout",
      "renderdragon_main_flow_layout_v3",
      "renderdragon_main_flow_layout_v4",
      "renderdragon_main_dock_layout_v5",
    ].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });
    mainLayoutManager = window.RenderDragonDockLayout.create({
      document,
      storageKey: UI_LAYOUT_STORAGE,
      rootClass: "layout-editing",
      editButton: "#layoutEditBtn",
      resetButton: "#layoutResetBtn",
      editText: "调整布局",
      doneText: "完成布局",
      groups: [
        {
          id: "main-panels",
          parent: ".workspace",
          selector:
            ":scope > .biome-rail,:scope > .editor-shell,:scope > .inspector",
          axis: "x",
          minWidth: 196,
          minHeight: 300,
          key: (el) => el.dataset.layoutKey || "main:" + el.className,
        },
        {
          id: "topbar-groups",
          parent: ".commandbar",
          selector:
            ":scope > .brand-lockup,:scope > .primary-actions,:scope > .utility-actions",
          axis: "x",
          minWidth: 120,
          minHeight: 40,
          key: (el) => el.dataset.layoutKey || "topbar:" + el.className,
        },
        {
          id: "topbar-primary-actions",
          parent: ".primary-actions",
          selector: ":scope > .cmd",
          axis: "x",
          minWidth: 88,
          minHeight: 32,
          key: (el, i) => "topbar-primary:" + (el.id || i),
        },
        {
          id: "topbar-utility-actions",
          parent: ".utility-actions",
          selector: ":scope > .cmd",
          axis: "x",
          minWidth: 76,
          minHeight: 32,
          key: (el, i) => "topbar-utility:" + (el.id || i),
        },
        {
          id: "biome-sections",
          parent: ".biome-rail",
          selector:
            ":scope > .rail-head,:scope > .rail-tools,:scope > .biome-list",
          axis: "y",
          minWidth: 170,
          minHeight: 44,
          key: (el) => el.dataset.layoutKey || "biome:" + el.className,
        },
        {
          id: "biome-filter-actions",
          parent: ".segmented",
          selector: ":scope > .seg",
          axis: "wrap",
          minWidth: 54,
          minHeight: 28,
          key: (el, i) => "biome-filter:" + (el.id || i),
        },
        {
          id: "editor-sections",
          parent: ".editor-shell",
          selector: ":scope > #tabs,:scope > .editor-toolbar,:scope > #editor",
          axis: "y",
          minWidth: 300,
          minHeight: 44,
          key: (el, i) => "editor:" + (el.id || el.className || i),
        },
        {
          id: "category-actions",
          parent: "#tabs",
          selector: ":scope > .category-tab",
          axis: "x",
          minWidth: 66,
          minHeight: 40,
          key: (el, i) => "category:" + (el.dataset.tab || i),
        },
        {
          id: "editor-toolbar-blocks",
          parent: ".editor-toolbar",
          selector:
            ":scope > .field-search-wrap,:scope > #fieldCount,:scope > #statusbar",
          axis: "wrap",
          minWidth: 76,
          minHeight: 28,
          key: (el, i) => "editor-toolbar:" + (el.id || el.className || i),
        },
        {
          id: "inspector-sections",
          parent: ".inspector",
          selector:
            ":scope > .inspector-heading,:scope > .inspector-tabs,:scope > .inspector-body",
          axis: "y",
          minWidth: 230,
          minHeight: 38,
          key: (el, i) => "inspector-section:" + (el.className || i),
        },
        {
          id: "inspector-tabs",
          parent: ".inspector-tabs",
          selector: ":scope > .inspector-tab",
          axis: "wrap",
          minWidth: 48,
          minHeight: 34,
          key: (el, i) => "inspector-tab:" + (el.dataset.inspectorTab || i),
        },
        {
          id: "inspector-view-blocks",
          parent: () => document.querySelector(".inspector-view.active"),
          selector: ":scope > *",
          axis: "y",
          minWidth: 210,
          minHeight: 28,
          key: (el, i) =>
            "inspector-block:" +
            (document.querySelector(".inspector-view.active")?.dataset
              .inspectorView || "view") +
            ":" +
            (el.id || el.className || el.tagName || i) +
            ":" +
            i,
        },
        {
          id: "field-cards",
          parent: () => document.querySelector("#editor .field-grid"),
          selector: ":scope > .field-card",
          axis: "wrap",
          minWidth: 280,
          minHeight: 70,
          key: (el) =>
            "field:" +
            activeTab +
            ":" +
            (el.querySelector(".field-path-mini")?.textContent ||
              el.querySelector(".field-title")?.textContent ||
              "item"),
        },
        {
          id: "editor-root-blocks",
          parent: "#editor",
          selector:
            ":scope > .field-card,:scope > .filter-mainbar,:scope > .pbr-open,:scope > .raw-box,:scope > .missing-card",
          axis: "y",
          minWidth: 280,
          minHeight: 56,
          key: (el, i) =>
            "editor-root:" + activeTab + ":" + (el.className || i),
        },
        {
          id: "filter-mainbar-blocks",
          parent: () => document.querySelector("#editor .filter-mainbar"),
          selector:
            ":scope > .filter-mainbar-copy,:scope > .filter-mainbar-actions",
          axis: "wrap",
          minWidth: 120,
          minHeight: 40,
          key: (el, i) =>
            "filter-mainbar:" + activeTab + ":" + (el.className || i),
        },
        {
          id: "pbr-open-blocks",
          parent: () => document.querySelector("#editor .pbr-open"),
          selector: ":scope > div",
          axis: "wrap",
          minWidth: 160,
          minHeight: 42,
          key: (el, i) => "pbr-open:" + i,
        },
      ],
    });
    bindHorizontalWheel($("#tabs"));
    $("#layoutEditBtn").addEventListener("click", () => {
      const on = document.documentElement.classList.contains("layout-editing");
      toast(
        on
          ? "布局模式已开启  拖动“拖”调整顺序  拖边缘改大小  所有块始终参与正常排版"
          : "布局已保存  退出布局不会重新计算位置",
      );
    });
  }
  function loadState(d) {
    if (!d?.ok) return;
    state = d;
    state.biomes = state.biomes || [];
    state.categories = state.categories || {};
    state.recipes = state.recipes || [];
    state.reference_presets = state.reference_presets || [];
    state.biome_meta = state.biome_meta || {};
    if (state.biome) biome = state.biome;
    loadedBaseline = clone(state);
    dirty = false;
    renderAll();
  }
  function renderAll() {
    renderMeta();
    renderBiomes();
    renderTabs();
    renderStatus();
    renderEditor();
    renderInspector();
    requestAnimationFrame(() => mainLayoutManager?.refresh());
  }
  function renderMeta() {
    const open = !!state.open,
      n = workspace.session
        ? Array.from(workspace.session.store.overlay.keys()).filter(
            (x) => !x.startsWith("renderdragon_"),
          ).length
        : 0;
    $("#packMetaTop").textContent = open
      ? `${state.meta?.name || ""}  ${state.meta?.root || ""}  已暂存 ${n} 个文件`
      : "正在准备内置资源";
    const pending = dirty || workspace.hasUnexported || painter()?.isDirty?.();
    $("#dirtyBadge").hidden = !pending;
    $("#dirtyBadge").textContent = dirty ? "参数待暂存" : "修改待下载";
    for (const id of [
      "writebackBtn",
      "restoreBtn",
      "copyBtn",
      "saveDraftBtn",
      "previewExportBtn",
    ]) {
      const el = $("#" + id);
      if (el) el.disabled = !open || busy;
    }
    for (const id of ["createBtn", "openBtn"])
      $("#" + id).disabled = busy || !open;
  }
  function renderTabs() {
    const tabs = schema?.tabs || [];
    $("#tabs").innerHTML = tabs
      .map(
        ([id, label]) =>
          `<button class="category-tab ${id === activeTab ? "active" : ""}" data-tab="${esc(id)}" type="button">${esc(professionalLabel(label))}</button>`,
      )
      .join("");
    $$("[data-tab]").forEach(
      (b) =>
        (b.onclick = async () => {
          if (activeTab === "binding" && dirty && !(await flushParameters()))
            return;
          activeTab = b.dataset.tab;
          renderTabs();
          renderEditor();
        }),
    );
  }
  function renderStatus() {
    const defs = [
      ["lighting", "光"],
      ["fog", "雾"],
      ["atmosphere", "气"],
      ["water", "水"],
      ["color_grading", "色"],
      ["shadows", "影"],
      ["local_lights", "灯"],
      ["pbr", "PBR"],
    ];
    $("#statusbar").innerHTML = defs
      .map(
        ([id, label]) =>
          `<span class="status-item" title="${label}"><i class="status-dot ${(id === "pbr" ? state.material_workflow === "pbr" : state.categories?.[id]?.exists) ? "ok" : ""}"></i>${label}</span>`,
      )
      .join("");
  }
  function renderBiomes() {
    const q = $("#biomeSearch").value.trim().toLowerCase();
    let list = (state.biomes || []).filter((id) => {
      const m = biomeMeta(id);
      return (
        !q ||
        id.toLowerCase().includes(q) ||
        String(m.name_cn || "")
          .toLowerCase()
          .includes(q) ||
        String(m.category || "")
          .toLowerCase()
          .includes(q)
      );
    });
    if (biomeMode === "current") list = list.filter((id) => id === biome);
    if (biomeMode === "selected")
      list = list.filter((id) => selectedBiomes.has(id));
    $("#biomeCounter").textContent = list.length;
    const grouped = new Map();
    for (const id of list) {
      const g = biomeMeta(id).category || "其他";
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g).push(id);
    }
    let html = "";
    for (const [g, rows] of grouped) {
      html += `<div class="biome-group">${esc(g)}</div>`;
      for (const id of rows) {
        const m = biomeMeta(id);
        html += `<button class="biome-item ${id === biome ? "active" : ""}" data-biome="${esc(id)}" type="button"><input type="checkbox" data-check="${esc(id)}" ${selectedBiomes.has(id) ? "checked" : ""} aria-label="勾选 ${esc(m.name_cn || id)}"><span><span class="biome-name">${esc(m.name_cn || id)}</span><span class="biome-id">minecraft:${esc(id)}</span></span></button>`;
      }
    }
    $("#biomeList").innerHTML =
      html || '<div class="empty-note">没有符合筛选条件的群系</div>';
    $$("[data-check]").forEach(
      (c) =>
        (c.onclick = (e) => {
          e.stopPropagation();
          if (c.checked) selectedBiomes.add(c.dataset.check);
          else selectedBiomes.delete(c.dataset.check);
          if (biomeMode === "selected") renderBiomes();
        }),
    );
    $$("[data-biome]").forEach(
      (b) =>
        (b.onclick = async (e) => {
          if (e.target.matches("input")) return;
          const next = b.dataset.biome;
          if (next === biome) return;
          if (!(await flushParameters())) return;
          biome = next;
          const d = await api("state", {
            biome,
          });
          if (d.ok) loadState(d);
        }),
    );
  }
  function renderInspector() {
    const c = currentChips();
    $("#chips").innerHTML = [
      ["太阳", c.sun],
      ["转向", c.orbit == null ? "" : `${c.orbit}°`],
      ["体积雾", c.fog_density],
      ["聚性", c.anisotropy],
    ]
      .map(
        ([k, v]) =>
          `<div class="metric"><span>${esc(k)}</span><b>${esc(v ?? "—")}</b></div>`,
      )
      .join("");
    renderRecipes();
  }
  function renderRecipes() {
    const refs = state.reference_presets || [],
      saved = state.recipes || [];
    let html = refs
      .map(
        (p, i) =>
          `<article class="recipe-item"><h3>${esc(p.name)}</h3><p>${esc(p.chips || "")}${p.description ? ` · ${esc(p.description)}` : ""}</p><div class="recipe-actions"><button class="tiny-btn accent" data-ref="${i}" type="button">应用</button></div></article>`,
      )
      .join("");
    html += saved
      .map(
        (r, i) =>
          `<article class="recipe-item"><h3>${esc(r.name)}</h3><p>${esc(r.description || "本机保存的参数配方")}</p><div class="recipe-actions"><button class="tiny-btn accent" data-load-recipe="${i}" type="button">载入</button><button class="tiny-btn danger" data-del-recipe="${i}" type="button">删除</button></div></article>`,
      )
      .join("");
    $("#recipes").innerHTML =
      html || '<div class="empty-note">没有参考参数</div>';
    $$("[data-ref]").forEach(
      (b) => (b.onclick = () => applyReference(refs[Number(b.dataset.ref)])),
    );
    $$("[data-load-recipe]").forEach(
      (b) =>
        (b.onclick = async () => {
          const r = saved[Number(b.dataset.loadRecipe)],
            d = await api("recipe_read", {
              id: r.id,
            });
          if (!d.ok) return;
          const p = d.payload || {};
          Object.entries(p.categories || {}).forEach(([cat, body]) => {
            if (state.categories?.[cat])
              state.categories[cat].data = clone(body);
          });
          if (p.binding?.components)
            state.binding.components = clone(p.binding.components);
          dirty = true;
          renderAll();
          toast("配方已载入  尚未暂存");
        }),
    );
    $$("[data-del-recipe]").forEach(
      (b) =>
        (b.onclick = async () => {
          const r = saved[Number(b.dataset.delRecipe)];
          if (
            !(await confirmDialog(
              "删除参数配方",
              `删除 ${r.name} 只影响浏览器本机保存的配方`,
            ))
          )
            return;
          const d = await api("recipe_delete", {
            id: r.id,
          });
          if (d.ok) {
            state.recipes = d.recipes || [];
            renderRecipes();
          }
        }),
    );
  }
  function applyReference(p) {
    let n = 0;
    for (const row of p?.patches || [])
      if (stageReferenceValue(row[0], row[1], row[2])) n++;
    if (!n) return toast("当前包没有这套参考参数对应的字段", true);
    dirty = true;
    renderAll();
    toast(`${p.name} 已应用  尚未暂存`);
  }
  function showFieldHelp(f) {
    if (!f) return;
    $("#fieldHelpTitle").textContent =
      professionalLabel(f.label) || f.path || "参数";
    const bits = [];
    if (f.desc) bits.push(f.desc);
    if (f.type === "number")
      bits.push(`范围 ${f.min} 到 ${f.max} · 步进 ${f.step}`);
    if (f.type === "vec3")
      bits.push(f.normalizedColor ? "RGB 三通道 0 到 1" : "RGB 三通道向量");
    if (f.type === "color") bits.push("颜色写入 #RRGGBB");
    if (f.keyframed) bits.push("按黄昏 正午 夜间 黎明分别保存");
    $("#fieldHelpText").textContent =
      bits.join("  ") ||
      "直接编辑当前资源包中的真实 JSON 值 先暂存到工作区  点击下载修改包后才会输出文件";
    $("#fieldHelpPath").textContent = f.path || "未选择";
  }
  function searchPass(f) {
    const q = $("#fieldSearch").value.trim().toLowerCase();
    return (
      !q ||
      `${f.label || ""} ${f.path || ""} ${f.desc || ""}`
        .toLowerCase()
        .includes(q)
    );
  }
  function fieldHtml(f, index) {
    const v = getPath(categoryData(), f.path);
    const inner = f.keyframed
      ? `<div class="slot-stack">${(f.slots || []).map((slot) => `<div class="slot-row"><div class="slot-label">${esc(schema.slotLabels?.[slot] || slot)} · ${slotKey(slot)}</div>${controlHtml(f, timed(v, slot), slot, index)}</div>`).join("")}</div>`
      : controlHtml(f, v, null, index);
    return `<article class="field-card" data-help-index="${index}" tabindex="-1"><div class="field-title"><span>${esc(professionalLabel(f.label))}</span><span class="field-path-mini">${esc(f.path)}</span></div>${inner}</article>`;
  }
  function controlHtml(f, v, slot, index) {
    const key = `f${index}_${slot || "base"}`.replace(/[^a-zA-Z0-9_]/g, "_"),
      data = `data-field-index="${index}" data-slot="${esc(slot || "")}"`;
    if (f.type === "number")
      return `<div class="control-row"><input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${num(v, f.min || 0)}" ${data} data-kind="range" id="${key}_r"><input class="num-input" type="number" min="${f.min}" max="${f.max}" step="${f.step}" value="${num(v, f.min || 0)}" ${data} data-kind="number" id="${key}_n"></div>`;
    if (f.type === "bool")
      return `<label class="bool-row"><input class="switch" type="checkbox" ${v ? "checked" : ""} ${data} data-kind="bool"><span>${v ? "启用" : "关闭"}</span></label>`;
    if (f.type === "select")
      return `<select class="select-input" ${data} data-kind="select">${(f.options || []).map((x) => `<option value="${esc(x)}" ${String(v) === String(x) ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>`;
    if (f.type === "color") {
      const hex = hexFromArray(v, false);
      return `<div class="color-control"><input class="color-swatch" type="color" data-contract="hex" value="${hex}" ${data} data-kind="color"><input class="text-input" type="text" value="${hex}" ${data} data-kind="color-text" maxlength="7"><button class="color-open" type="button" ${data} data-kind="color-open">调色板</button></div>`;
    }
    if (f.type === "vec3") {
      const a = Array.isArray(v) ? v.slice(0, 3) : [0, 0, 0];
      while (a.length < 3) a.push(0);
      const hex = hexFromArray(a, !!f.normalizedColor);
      return `<div class="vec-grid">${["R", "G", "B"].map((ch, i) => `<div class="vec-unit"><label>${ch}</label><input type="number" min="${f.min}" max="${f.max}" step="${f.step}" value="${num(a[i], 0)}" ${data} data-kind="vec" data-axis="${i}"></div>`).join("")}<button class="vec-picker" type="button" style="background:${hex}" title="打开调色板" ${data} data-kind="vec-open"></button></div>`;
    }
    if (f.type === "mers") {
      const a = Array.isArray(v) ? v.slice(0, 4) : [0, 0, 12, 0];
      while (a.length < 4) a.push(0);
      return `<div class="mers-grid">${[
        ["M", "金属"],
        ["E", "自发光"],
        ["R", "粗糙"],
        ["S", "次表面"],
      ]
        .map(
          ([ch, label], i) =>
            `<div class="mers-unit"><label>${label} ${ch}</label><input type="number" min="0" max="255" step="1" value="${num(a[i], 0)}" ${data} data-kind="mers" data-axis="${i}"></div>`,
        )
        .join("")}</div>`;
    }
    return `<input class="text-input" type="text" value="${esc(v ?? "")}" ${data} data-kind="text">`;
  }
  function rawHtml() {
    return `<details class="raw-box"><summary>原始 JSON · 未显示字段保持原样</summary><div class="raw-inner"><textarea id="rawText">${esc(JSON.stringify(categoryData(), null, 2))}</textarea><div class="raw-actions"><button class="secondary-btn accent" id="rawSave" type="button">应用到当前内存</button></div></div></details>`;
  }
  function renderEditor() {
    if (!state.open) {
      $("#fieldCount").textContent = "0 条";
      $("#editor").innerHTML =
        '<div class="missing-card"><b>还没有打开资源包</b>使用顶部 打开资源包 打开现有光影  或 新建光影包 创建一个 RenderDragon Framework V1 资源包</div>';
      return;
    }
    if (activeTab === "binding") return renderBinding();
    if (activeTab === "local_lights") return renderLocalLights();
    const cat = state.categories?.[activeTab];
    if (!cat?.exists) return renderMissing(activeTab);
    const fields = (schema.fields?.[activeTab] || []).filter(searchPass);
    $("#fieldCount").textContent = `${fields.length} 条`;
    let html = "";
    if (activeTab === "color_grading")
      html += `<div class="filter-mainbar"><div class="filter-mainbar-copy"><b>色彩分级滤镜</b><span>直接编辑当前资源包中的色彩分级参数  暂存后按实际改动导出</span></div><div class="filter-mainbar-actions"><button class="secondary-btn accent" id="filterCoolBtn" type="button">冷青预设</button><button class="secondary-btn" id="filterNeutralBtn" type="button">中性预设</button></div></div>`;
    html += `<div class="field-grid">${fields.map((f, i) => fieldHtml(f, i)).join("")}</div>${rawHtml()}`;
    if (activeTab === "pbr")
      html += `<div class="pbr-open"><div><b>${state.material_workflow === "pbr" ? "PBR 工作流  按所选目标导出" : "普通纹理工作流"}</b><p>只编辑基色不启用 PBR  四合一按顶部目标导出  OP 为四分区  渲染龙为 MERS</p><button class="secondary-btn" id="enablePbrBtn" type="button">启用全局 PBR 默认</button></div><button class="secondary-btn accent" id="openPainterBtn" type="button">打开纹理与材质画板</button></div>`;
    $("#editor").innerHTML = html;
    bindFieldControls(fields);
    bindRaw();
    if (activeTab === "pbr") {
      $("#openPainterBtn").onclick = openPainter;
      $("#enablePbrBtn").onclick = async () => {
        if (!(await flushParameters())) return;
        const d = await api("enable_pbr");
        if (d.ok) loadState(d);
      };
    }
    if (activeTab === "color_grading") {
      const cool = $("#filterCoolBtn"),
        neutral = $("#filterNeutralBtn");
      if (cool) cool.onclick = cyanPreset;
      if (neutral) neutral.onclick = neutralFilterPreset;
    }
  }
  function renderMissing(cat) {
    const label = (schema.tabs.find((x) => x[0] === cat) || [])[1] || cat;
    $("#fieldCount").textContent = "0 条";
    $("#editor").innerHTML =
      `<div class="missing-card"><b>${esc(professionalLabel(label))} 当前资源包未包含此参数组</b><span>可以按当前 RenderDragon JSON 合同创建此参数组</span><div style="margin-top:12px"><button class="secondary-btn accent" id="ensureBtn" type="button">创建参数文件</button></div></div>`;
    $("#ensureBtn").onclick = async () => {
      const d = await api("ensure", {
        category: cat,
      });
      if (d.ok) loadState(d);
    };
  }
  function bindFieldControls(fields) {
    $$("[data-field-index]").forEach((el) => {
      const i = Number(el.dataset.fieldIndex),
        f = fields[i],
        slot = el.dataset.slot || null,
        kind = el.dataset.kind;
      if (!f) return;
      const card = el.closest(".field-card");
      const help = () => showFieldHelp(f);
      el.addEventListener("focus", help);
      el.addEventListener("pointerdown", help, {
        passive: true,
      });
      if (card)
        card.addEventListener("pointerdown", help, {
          passive: true,
        });
      if (kind === "range") {
        el.oninput = () => {
          const peer = card.querySelector(
            `[data-kind="number"][data-field-index="${i}"][data-slot="${CSS.escape(slot || "")}"]`,
          );
          if (peer) peer.value = el.value;
          stagePath(activeTab, f.path, Number(el.value), slot);
        };
      } else if (kind === "number") {
        el.onchange = () => {
          const v = clamp(Number(el.value), Number(f.min), Number(f.max));
          el.value = v;
          const peer = card.querySelector(
            `[data-kind="range"][data-field-index="${i}"][data-slot="${CSS.escape(slot || "")}"]`,
          );
          if (peer) peer.value = v;
          stagePath(activeTab, f.path, v, slot);
        };
      } else if (kind === "bool") {
        el.onchange = () => {
          stagePath(activeTab, f.path, !!el.checked, slot);
          const s = el.nextElementSibling;
          if (s) s.textContent = el.checked ? "启用" : "关闭";
        };
      } else if (kind === "select") {
        el.onchange = () => stagePath(activeTab, f.path, el.value, slot);
      } else if (kind === "text") {
        el.onchange = () => stagePath(activeTab, f.path, el.value, slot);
      } else if (
        kind === "color" ||
        kind === "color-text" ||
        kind === "color-open"
      ) {
        bindColorControl(el, card, f, slot, i);
      } else if (kind === "vec" || kind === "vec-open") {
        bindVecControl(el, card, f, slot, i);
      } else if (kind === "mers") {
        el.onchange = () => {
          const values = [0, 1, 2, 3].map((axis) =>
            clamp(
              Math.round(
                Number(
                  card.querySelector(`[data-kind="mers"][data-axis="${axis}"]`)
                    .value,
                ) || 0,
              ),
              0,
              255,
            ),
          );
          stagePath(activeTab, f.path, values, slot);
        };
      }
    });
    if (colorPicker?.scan) colorPicker.scan($("#editor"));
  }
  function bindColorControl(el, card, f, slot, i) {
    const sw = card.querySelector(
        `[data-kind="color"][data-field-index="${i}"][data-slot="${CSS.escape(slot || "")}"]`,
      ),
      txt = card.querySelector(
        `[data-kind="color-text"][data-field-index="${i}"][data-slot="${CSS.escape(slot || "")}"]`,
      ),
      op = card.querySelector(
        `[data-kind="color-open"][data-field-index="${i}"][data-slot="${CSS.escape(slot || "")}"]`,
      );
    const apply = (hex) => {
      if (!/^#[0-9A-F]{6}$/i.test(hex))
        return toast("颜色必须是 #RRGGBB", true);
      hex = hex.toUpperCase();
      sw.value = hex;
      txt.value = hex;
      const old = slot
        ? timed(getPath(categoryData(), f.path), slot)
        : getPath(categoryData(), f.path);
      stagePath(activeTab, f.path, preserveColorType(old, hex, false), slot);
    };
    if (sw && !sw._rd) {
      sw._rd = 1;
      sw.addEventListener("change", () => apply(sw.value));
    }
    if (txt && !txt._rd) {
      txt._rd = 1;
      txt.addEventListener("change", () => apply(txt.value));
    }
    if (op && !op._rd) {
      op._rd = 1;
      op.onclick = () =>
        colorPicker?.open(sw.value, apply, {
          contract: "hex",
          title: `${professionalLabel(f.label)} · 调色板`,
          tip: "选择后只修改当前内存参数",
        });
    }
  }
  function bindVecControl(el, card, f, slot, i) {
    const inputs = [0, 1, 2].map((axis) =>
        card.querySelector(
          `[data-kind="vec"][data-field-index="${i}"][data-slot="${CSS.escape(slot || "")}"][data-axis="${axis}"]`,
        ),
      ),
      pick = card.querySelector(
        `[data-kind="vec-open"][data-field-index="${i}"][data-slot="${CSS.escape(slot || "")}"]`,
      );
    const stage = () => {
      const a = inputs.map((x) =>
        clamp(Number(x.value) || 0, Number(f.min), Number(f.max)),
      );
      stagePath(activeTab, f.path, a, slot);
      if (pick) pick.style.background = hexFromArray(a, !!f.normalizedColor);
    };
    inputs.forEach((x) => {
      if (x && !x._rd) {
        x._rd = 1;
        x.onchange = stage;
      }
    });
    if (pick && !pick._rd) {
      pick._rd = 1;
      pick.onclick = () => {
        const a = inputs.map((x) => Number(x.value) || 0),
          hex = hexFromArray(a, !!f.normalizedColor);
        colorPicker?.open(
          hex,
          (chosen) => {
            const values = rgbFromHex(chosen, !!f.normalizedColor);
            values.forEach((v, axis) => (inputs[axis].value = v));
            stage();
          },
          {
            contract: "hex",
            title: `${professionalLabel(f.label)} · RGB 调色板`,
          },
        );
      };
    }
  }
  function bindRaw() {
    const b = $("#rawSave");
    if (!b) return;
    b.onclick = () => {
      let doc;
      try {
        doc = JSON.parse($("#rawText").value);
      } catch (e) {
        return toast(`JSON 格式错误 ${e.message}`, true);
      }
      if (!doc || typeof doc !== "object" || Array.isArray(doc))
        return toast("参数 JSON 必须是对象  不能是空值或数组", true);
      state.categories[activeTab].data = doc;
      markDirty();
      renderEditor();
      toast("原始 JSON 已应用到内存");
    };
  }
  function renderLocalLights() {
    if (!state.categories?.local_lights?.exists)
      return renderMissing("local_lights");
    const rows = Object.entries(categoryData()).map(([id, v]) => ({
      id,
      original: clone(v),
      color:
        typeof v?.light_color === "string"
          ? v.light_color
          : hexFromArray(v?.light_color || [255, 255, 255]),
      type: v?.light_type || "point_light",
    }));
    $("#fieldCount").textContent = `${rows.length} 条`;
    const draw = () => {
      const ids = rows.map((x) => x.id);
      if (ids.some((x) => !x.trim()) || new Set(ids).size !== ids.length) {
        toast("光源标识不能为空或重复", true);
        renderLocalLights();
        return;
      }
      state.categories.local_lights.data = Object.fromEntries(
        rows.map((x) => [
          x.id,
          Object.assign({}, x.original || {}, {
            light_color: preserveColorType(x.original?.light_color, x.color),
            light_type: x.type,
          }),
        ]),
      );
      markDirty();
      renderLocalLights();
    };
    $("#editor").innerHTML =
      `<div class="local-table">${rows.map((r, i) => `<div class="local-row"><input class="text-input" data-li-id="${i}" value="${esc(r.id)}"><input class="color-swatch" type="color" data-contract="hex" data-li-color="${i}" value="${esc(r.color)}"><select class="select-input" data-li-type="${i}"><option ${r.type === "point_light" ? "selected" : ""}>point_light</option><option ${r.type === "static_light" ? "selected" : ""}>static_light</option></select><button class="inline-action" data-li-del="${i}" type="button">删</button></div>`).join("")}</div><div style="margin-top:9px"><button class="secondary-btn" id="addLight" type="button">增加光源</button></div>${rawHtml()}`;
    $("#addLight").onclick = () => {
      let n = 1;
      while (rows.some((x) => x.id === "custom:light_" + n)) n++;
      rows.push({
        id: "custom:light_" + n,
        original: {},
        color: "#EFE39D",
        type: "point_light",
      });
      draw();
    };
    $$("[data-li-del]").forEach(
      (b) =>
        (b.onclick = () => {
          rows.splice(Number(b.dataset.liDel), 1);
          draw();
        }),
    );
    $$("[data-li-id],[data-li-color],[data-li-type]").forEach(
      (el) =>
        (el.onchange = () => {
          const i = Number(
            el.dataset.liId ?? el.dataset.liColor ?? el.dataset.liType,
          );
          rows[i] = {
            original: rows[i].original,
            id: $(`[data-li-id="${i}"]`).value,
            color: $(`[data-li-color="${i}"]`).value.toUpperCase(),
            type: $(`[data-li-type="${i}"]`).value,
          };
          draw();
        }),
    );
    if (colorPicker?.scan) colorPicker.scan($("#editor"));
    bindRaw();
  }
  function renderBinding() {
    const avail = state.binding?.available || {},
      comps = state.binding?.components || {};
    const defs = [
      [
        "lighting",
        "光照",
        "minecraft:lighting_identifier",
        "lighting_identifier",
      ],
      [
        "atmosphere",
        "大气",
        "minecraft:atmosphere_identifier",
        "atmosphere_identifier",
      ],
      [
        "color_grading",
        "调色",
        "minecraft:color_grading_identifier",
        "color_grading_identifier",
      ],
      ["water", "水", "minecraft:water_identifier", "water_identifier"],
      ["fog", "雾", "minecraft:fog_appearance", "fog_identifier"],
      [
        "cubemap",
        "天空盒",
        "minecraft:cubemap_identifier",
        "cubemap_identifier",
      ],
    ];
    $("#fieldCount").textContent = `${defs.length + 1} 条`;
    $("#editor").innerHTML =
      `<div class="field-card"><div class="binding-list">${defs
        .map(([cat, label, comp, key]) => {
          const x = comps[comp],
            cur = typeof x === "object" ? x?.[key] || "" : x || "";
          return `<div class="binding-row"><b>${label}</b><select class="select-input" data-bindcat="${cat}" data-comp="${comp}" data-key="${key}"><option value="">默认 / 不绑定</option>${(avail[cat] || []).map((r) => `<option value="${esc(r.identifier)}" ${cur === r.identifier ? "selected" : ""}>${esc(r.identifier)} · ${esc(r.file)}</option>`).join("")}</select></div>`;
        })
        .join(
          "",
        )}<div class="binding-row"><b>群系水色</b><div class="color-control"><input class="color-swatch" type="color" data-contract="hex" id="waterSurface" value="${esc(comps["minecraft:water_appearance"]?.surface_color || "#44AFF5")}"><input class="text-input" id="waterSurfaceText" value="${esc(comps["minecraft:water_appearance"]?.surface_color || "#44AFF5")}"><button class="color-open" id="waterSurfaceOpen" type="button">调色板</button></div></div></div></div>`;
    $$("[data-bindcat]").forEach(
      (s) =>
        (s.onchange = () => {
          const comp = s.dataset.comp,
            key = s.dataset.key;
          if (s.value)
            comps[comp] = {
              [key]: s.value,
            };
          else delete comps[comp];
          state.binding.components = comps;
          markDirty();
        }),
    );
    const applyWater = (hex) => {
      if (!/^#[0-9a-f]{6}$/i.test(hex))
        return toast("颜色必须是 #RRGGBB", true);
      hex = hex.toUpperCase();
      $("#waterSurface").value = hex;
      $("#waterSurfaceText").value = hex;
      if (!comps["minecraft:water_appearance"])
        comps["minecraft:water_appearance"] = {};
      comps["minecraft:water_appearance"].surface_color = hex;
      state.binding.components = comps;
      markDirty();
    };
    $("#waterSurface").onchange = () => applyWater($("#waterSurface").value);
    $("#waterSurfaceText").onchange = () =>
      applyWater($("#waterSurfaceText").value);
    $("#waterSurfaceOpen").onclick = () =>
      colorPicker?.open($("#waterSurface").value, applyWater, {
        contract: "hex",
        title: "群系水色 · 调色板",
      });
    if (colorPicker?.scan) colorPicker.scan($("#editor"));
  }
  async function openPainter() {
    if (!state.open) return toast("资源尚未准备好", true);
    if (!(await flushParameters())) return;
    $("#painterOverlay").hidden = false;
    await preparePainter();
    syncThemeToPainter();
  }
  async function closePainter() {
    const d = await flushPainter();
    if (d?.ok === false) {
      toast(d.reason, true);
      return;
    }
    $("#painterOverlay").hidden = true;
    const current = await api("state", {
      biome,
    });
    if (current.ok) loadState(current);
    else renderMeta();
  }
  function modalBase(title, text) {
    $("#modalTitle").textContent = title;
    $("#modalText").textContent = text || "";
    $("#modalField").hidden = true;
    $("#modalProgress").hidden = true;
    $("#modalCancel").hidden = false;
    $("#modalOk").hidden = false;
    $("#modalCancel").textContent = "取消";
    $("#modalOk").textContent = "确定";
    $("#modalInput").classList.remove("invalid");
    $("#modalInputError").hidden = true;
    $("#modalInputError").textContent = "";
    $("#modal").hidden = false;
  }
  function closeModal(value) {
    $("#modal").hidden = true;
    const r = modalResolver;
    modalResolver = null;
    if (r) r(value);
  }
  function askText(title, text, value, options = {}) {
    modalBase(title, text);
    const field = $("#modalField"),
      input = $("#modalInput"),
      label = $("#modalInputLabel"),
      help = $("#modalInputHelp"),
      error = $("#modalInputError");
    field.hidden = false;
    label.textContent = options.label || "名称";
    input.value = value || "";
    input.placeholder = options.placeholder || "";
    help.textContent = options.help || "";
    help.hidden = !help.textContent;
    $("#modalOk").textContent = options.okText || "确定";
    $("#modalCancel").textContent = options.cancelText || "取消";
    const validate = () => {
      const v = input.value.trim();
      if (v) {
        input.classList.remove("invalid");
        error.hidden = true;
        error.textContent = "";
        return v;
      }
      input.classList.add("invalid");
      error.textContent = options.emptyError || "请输入" + label.textContent;
      error.hidden = false;
      input.focus();
      return "";
    };
    input.oninput = () => {
      if (input.value.trim()) {
        input.classList.remove("invalid");
        error.hidden = true;
        error.textContent = "";
      }
    };
    setTimeout(() => {
      input.focus();
      input.select();
    }, 0);
    return new Promise((resolve) => {
      modalResolver = resolve;
      $("#modalOk").onclick = () => {
        const v = validate();
        if (!v) return;
        closeModal(v);
      };
      $("#modalCancel").onclick = () => closeModal(null);
      input.onkeydown = (e) => {
        if (e.key === "Enter") $("#modalOk").click();
        if (e.key === "Escape") $("#modalCancel").click();
      };
    });
  }
  function confirmDialog(title, text, options = {}) {
    modalBase(title, text);
    $("#modalOk").textContent = options.okText || "继续";
    $("#modalCancel").textContent = options.cancelText || "取消";
    return new Promise((resolve) => {
      modalResolver = resolve;
      $("#modalOk").onclick = () => closeModal(true);
      $("#modalCancel").onclick = () => closeModal(false);
    });
  }
  async function openPack() {
    if (
      hasPending() &&
      !(await confirmDialog(
        "导入其他资源包",
        "当前工作区还有未下载的修改  继续导入会替换本次工作区  不会删除原资源包",
        {
          okText: "放弃当前修改并导入",
        },
      ))
    )
      return;
    const d = await api("open");
    if (d.ok) {
      loadState(d);
      await preparePainter(true);
    }
  }
  async function createPack() {
    if (
      hasPending() &&
      !(await confirmDialog(
        "新建工作区",
        "当前工作区还有未下载的修改  继续新建会放弃这些修改",
        {
          okText: "放弃修改并新建",
        },
      ))
    )
      return;
    const name = await askText(
      "新建光影工作区",
      "内置参数和材质可直接使用  不会下载整包  只在点击下载时导出实际修改",
      "渲染龙光影",
      {
        label: "资源包名称",
        okText: "新建工作区",
      },
    );
    if (!name) return;
    await runBusy(async () => {
      const d = await api("create", {
        name,
      });
      if (d.ok) {
        loadState(d);
        await preparePainter(true);
        toast("新工作区已就绪  未下载任何文件");
      }
    });
  }
  async function writeback() {
    return runBusy(async () => {
      if (!(await flushParameters()))
        return {
          ok: false,
          reason: "参数暂存失败",
        };
      const p = await flushPainter();
      if (p?.ok === false) {
        toast(p.reason, true);
        return p;
      }
      const d = await api("download_changes");
      renderMeta();
      return d;
    });
  }
  async function restore() {
    if (!state.open) return;
    if (
      !(await confirmDialog(
        "恢复打开时状态",
        "将放弃本次打开资源包后对光影参数 JSON 的修改  纹理文件不会被改动",
        {
          okText: "恢复参数",
          cancelText: "取消",
        },
      ))
    )
      return;
    const d = await api("restore");
    if (d.ok) loadState(d);
  }
  async function copyJson() {
    if (!state.open) return;
    const text = JSON.stringify(
      {
        pack: state.meta,
        biome,
        pending: dirty,
        payload: stagedPayload(true),
      },
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(text);
      toast("当前 JSON 已复制");
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("当前 JSON 已复制");
    }
  }
  async function saveRecipe() {
    if (!state.open) return toast("先打开资源包", true);
    const name = await askText(
      "保存参数配方",
      "给当前参数状态取一个名称  配方只保存在当前浏览器本机  不会写入资源包",
      "RenderDragon 参数配方",
      {
        label: "配方名称",
        placeholder: "例如 夜景冷雾",
        help: "只保存在当前浏览器本机",
        okText: "保存配方",
        emptyError: "请输入配方名称",
      },
    );
    if (!name) return;
    const d = await api("recipe_save", {
      name,
      payload: stagedPayload(true),
    });
    if (d.ok) {
      state.recipes = d.recipes || [];
      renderRecipes();
    }
  }
  async function cyanPreset() {
    if (!state.open) return toast("先打开资源包", true);
    const d = await api("preview_builtin", {
      preset: "cool_cyan",
    });
    const body = d?.payload?.categories?.color_grading;
    if (d?.ok && body && state.categories?.color_grading) {
      state.categories.color_grading.data = clone(body);
      dirty = true;
      activeTab = "color_grading";
      renderAll();
      toast("冷青参数已应用  尚未暂存");
    }
  }
  function neutralFilterPreset() {
    if (!state.open) return toast("先打开资源包", true);
    const cat = state.categories?.color_grading;
    if (!cat?.exists || !cat.data)
      return toast("当前资源包没有 Color Grading 参数", true);
    const body = cat.data;
    const neutral = {
      contrast: [1, 1, 1],
      gain: [1, 1, 1],
      gamma: [2.2, 2.2, 2.2],
      offset: [0, 0, 0],
      saturation: [1, 1, 1],
    };
    setPath(body, "color_grading.midtones", neutral);
    setPath(
      body,
      "color_grading.highlights",
      Object.assign(
        {
          enabled: false,
          highlightsMin: 1.5,
        },
        clone(neutral),
      ),
    );
    setPath(
      body,
      "color_grading.shadows",
      Object.assign(
        {
          enabled: false,
          shadowsMax: 0.42,
        },
        clone(neutral),
      ),
    );
    setPath(body, "color_grading.temperature", {
      enabled: false,
      temperature: 6500,
      type: "white_balance",
    });
    setPath(body, "tone_mapping.operator", "hable");
    dirty = true;
    activeTab = "color_grading";
    renderAll();
    toast("中性滤镜参数已应用  尚未暂存");
  }
  function painter() {
    return $("#painterFrame")?.contentWindow?.RenderDragonPaint;
  }
  function hasPending() {
    return dirty || workspace.hasUnexported || !!painter()?.isDirty?.();
  }
  async function preparePainter(force = false) {
    const id = workspace.session?.id;
    if (!force && painterLoaded && painterProject === id)
      return preparedPainter;
    const frame = $("#painterFrame");
    painterLoaded = true;
    painterProject = id;
    preparedPainter = new Promise((resolve) => {
      frame.addEventListener(
        "load",
        () => {
          syncThemeToPainter();
          resolve(true);
        },
        {
          once: true,
        },
      );
    });
    frame.srcdoc =
      window.RenderDragonPainterDocument || "<p>材质编辑器文件缺失</p>";
    return preparedPainter;
  }
  async function flushPainter() {
    const p = painter();
    return p?.flushPending
      ? await p.flushPending()
      : {
          ok: true,
        };
  }
  async function flushParameters() {
    if (!state.open) return false;
    const payload = stagedPayload();
    if (!Object.keys(payload.categories).length && !payload.binding) {
      dirty = false;
      return true;
    }
    const d = await api("writeback", {
      payload,
    });
    if (!d.ok) return false;
    loadState(d);
    return true;
  }
  async function runBusy(task) {
    if (busy)
      return {
        ok: false,
        reason: "正在处理上一次操作",
      };
    busy = true;
    renderMeta();
    try {
      return await task();
    } catch (error) {
      console.error(error);
      toast(error.message || String(error), true);
      return {
        ok: false,
        reason: error.message || String(error),
      };
    } finally {
      busy = false;
      renderMeta();
    }
  }
  async function saveDraft() {
    return runBusy(async () => {
      if (!(await flushParameters())) return;
      const d = await flushPainter();
      if (!d.ok) toast(d.reason, true);
      else toast("修改已暂存  未下载文件  关闭网页前请下载修改包");
    });
  }
  function showFilePlan(d, title = "下载清单") {
    const rows = [...d.files].sort((a, b) => b.bytes - a.bytes);
    const total = d.bytes || rows.reduce((n, x) => n + x.bytes, 0);
    const text = rows
      .map((x) => `${(x.bytes / 1024).toFixed(2)} KiB  ${x.reason}  ${x.path}`)
      .join("\n");
    modalBase(
      title,
      `共 ${rows.length} 个文件  ${(total / 1024).toFixed(2)} KiB\n按大小排列  仅列出将下载的文件  内置素材库不计入\n` +
        text,
    );
    $("#modalText").style.whiteSpace = "pre-wrap";
    $("#modalText").style.maxHeight = "55vh";
    $("#modalText").style.overflow = "auto";
    $("#modalOk").textContent = "关闭";
    $("#modalOk").onclick = () => closeModal(true);
    $("#modalCancel").hidden = true;
  }
  async function previewExport() {
    return runBusy(async () => {
      if (!(await flushParameters())) return;
      const p = await flushPainter();
      if (p?.ok === false) return toast(p.reason, true);
      const d = await api("export_preview");
      if (!d.ok) return;
      showFilePlan(d, "本次全部修改清单");
      $("#modalText").style.whiteSpace = "pre-wrap";
      $("#modalText").style.maxHeight = "55vh";
      $("#modalText").style.overflow = "auto";
      $("#modalCancel").hidden = true;
      $("#modalOk").textContent = "关闭";
      $("#modalOk").onclick = () => closeModal(true);
    });
  }
  window.RenderDragonApp = {
    showFilePlan,
    downloadChanges: writeback,
    flushParameters,
    flushPainter,
    saveDraft,
    previewExport,
    async refreshProject() {
      const d = await api("state", {
        biome: window.RenderDragonCore.currentBiome,
      });
      if (d.ok) loadState(d);
    },
    get state() {
      return state;
    },
    get pending() {
      return hasPending();
    },
    stagePath,
    stagedPayload,
  };
  window.addEventListener("rd-workspace-change", () => renderMeta());
  window.addEventListener("rd-workspace-export", () => renderMeta());
  $$("[data-inspector-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        setInspectorTab(b.dataset.inspectorTab);
        if (b.dataset.inspectorTab === "appearance") renderAppearancePanel();
      }),
  );
  function syncTargetControls() {
    const value = workspace.target;
    document
      .querySelectorAll("[data-target-select]")
      .forEach((el) => (el.value = value));
    painter()?.syncPipeline?.(value, !!state.open);
  }
  $("#textureTarget").onchange = () => {
    workspace.setTarget($("#textureTarget").value);
    syncTargetControls();
  };
  window.addEventListener("rd-target-change", syncTargetControls);
  window.addEventListener("rd-project-change", syncTargetControls);
  syncTargetControls();
  $("#saveDraftBtn").onclick = saveDraft;
  $("#previewExportBtn").onclick = previewExport;
  $("#openBtn").onclick = openPack;
  $("#createBtn").onclick = createPack;
  $("#writebackBtn").onclick = writeback;
  $("#restoreBtn").onclick = restore;
  $("#copyBtn").onclick = copyJson;
  $("#saveRecipeBtn").onclick = saveRecipe;
  $("#closePainterBtn").onclick = closePainter;
  $("#painterOverlay").addEventListener("click", (e) => {
    if (e.target === $("#painterOverlay")) closePainter();
  });
  $("#appearanceBtn").onclick = openAppearancePanel;
  $("#appearanceCloseBtn").onclick = closeAppearancePanel;
  $("#appearanceToggleModeBtn").onclick = () =>
    setThemeMode(currentThemeMode() === "light" ? "dark" : "light");
  $("#appearanceExportBtn").onclick = exportUiSettings;
  $("#appearanceImportBtn").onclick = () => $("#appearanceImportFile").click();
  $("#appearanceImportFile").onchange = async (e) => {
    const f = e.target.files?.[0];
    if (f) await importUiSettingsFile(f);
    e.target.value = "";
  };
  $("#appearanceResetBtn").onclick = () => {
    uiThemeState[currentThemeMode()] = {};
    saveThemeState();
    applyThemeState();
    renderAppearancePanel();
    toast("当前主题配色已恢复默认");
  };
  $("#themeBtn").onclick = () =>
    setThemeMode(currentThemeMode() === "light" ? "dark" : "light");
  $("#biomeSearch").oninput = renderBiomes;
  $("#fieldSearch").oninput = renderEditor;
  function setBiomeMode(mode) {
    biomeMode = mode;
    [
      ["current", "#biomeCurrentBtn"],
      ["selected", "#biomeSelectedBtn"],
      ["all", "#biomeAllBtn"],
    ].forEach(([m, s]) => $(s).classList.toggle("active", m === mode));
    renderBiomes();
  }
  $("#biomeCurrentBtn").onclick = () => setBiomeMode("current");
  $("#biomeSelectedBtn").onclick = () => setBiomeMode("selected");
  $("#biomeAllBtn").onclick = () => setBiomeMode("all");
  $("#importFogBtn").onclick = async () => {
    if (!state.open) return toast("先打开资源包", true);
    if (!(await flushParameters())) return;
    $("#fogFile").click();
  };
  $("#fogFile").onchange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    let delta;
    try {
      delta = JSON.parse(await f.text());
    } catch (err) {
      toast("修改项 JSON 无法解析", true);
      e.target.value = "";
      return;
    }
    const d = await api("site_delta_import", {
      delta,
    });
    if (d.ok) loadState(d);
    e.target.value = "";
  };
  $("#exportFogBtn").onclick = async () => {
    if (!state.open) return toast("先打开资源包", true);
    if (!(await flushParameters())) return;
    const d = await api("site_delta_export", {});
    if (!d.ok) return;
    const a = document.createElement("a"),
      blob = new Blob([JSON.stringify(d.delta, null, 2) + "\n"], {
        type: "application/json",
      });
    a.href = URL.createObjectURL(blob);
    a.download = `${state.meta?.name || "RenderDragon"}_${biome}_光影修改项_v3.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("#painterOverlay").hidden) closePainter();
      else if (!$("#modal").hidden) $("#modalCancel").click();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (state.open) writeback();
    }
  });
  window.addEventListener("beforeunload", (e) => {
    if (hasPending()) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  async function init() {
    try {
      if (localStorage.getItem("renderdragon_theme") === "light")
        document.documentElement.classList.add("light");
    } catch (error) {}
    loadThemeState();
    applyThemeState();
    bindAppearanceLiveChannels();
    setupWorkspaceLayout();
    busy = true;
    renderMeta();
    const d = await api("bootstrap");
    busy = false;
    if (d.ok) {
      loadState(d);
      preparePainter().catch((error) =>
        toast("材质窗口初始化失败 " + error.message, true),
      );
    } else {
      $("#editor").innerHTML =
        '<div class="missing-card">内置资源准备失败  ' +
        esc(d.reason || "未知错误") +
        '<br>请确认完整解压后使用最新版 Chrome 或 Edge 打开 index.html<br><button class="secondary-btn" id="retryBoot">重新准备资源</button></div>';
      $("#retryBoot").onclick = init;
    }
    setTimeout(() => {
      mainLayoutManager?.refresh();
      bindHorizontalWheel($("#tabs"));
    }, 0);
  }
  init();
})();
