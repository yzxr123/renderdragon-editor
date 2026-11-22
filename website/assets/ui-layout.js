(function (global) {
  "use strict";

  function create(options) {
    options = options || {};
    var doc = options.document || global.document;
    var win = doc.defaultView || global;
    var root = doc.documentElement;
    var rootClass = options.rootClass || "layout-editing";
    var storageKey = options.storageKey || "renderdragon_dock_layout_v6";
    var groups = Array.isArray(options.groups) ? options.groups : [];
    var editButton =
      typeof options.editButton === "string"
        ? doc.querySelector(options.editButton)
        : options.editButton;
    var resetButton =
      typeof options.resetButton === "string"
        ? doc.querySelector(options.resetButton)
        : options.resetButton;
    var memory = {
      version: 6,
      groups: {},
    };
    var selected = null;
    var observer = null;
    var queued = false;
    var destroyed = false;
    function clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    }
    function read() {
      try {
        var x = JSON.parse(win.localStorage.getItem(storageKey) || "null");
        if (x && Number(x.version) === 6 && x.groups) memory = x;
      } catch (e) {}
    }
    function persist() {
      try {
        win.localStorage.setItem(storageKey, JSON.stringify(memory));
      } catch (e) {}
    }
    function parentOf(spec) {
      return typeof spec.parent === "function"
        ? spec.parent()
        : typeof spec.parent === "string"
          ? doc.querySelector(spec.parent)
          : spec.parent;
    }
    function itemsOf(spec) {
      var p = parentOf(spec);
      return p
        ? Array.prototype.slice
            .call(p.querySelectorAll(spec.selector || ":scope > *"))
            .filter(function (el) {
              return !el.hasAttribute("data-layout-ui");
            })
        : [];
    }
    function axis(spec) {
      return spec.axis || spec.flow || "wrap";
    }
    function groupState(spec) {
      var id = spec.id || "group";
      if (!memory.groups[id])
        memory.groups[id] = {
          order: [],
          items: {},
        };
      return memory.groups[id];
    }
    function itemState(spec, key) {
      var g = groupState(spec);
      if (!g.items[key]) g.items[key] = {};
      return g.items[key];
    }
    function keyFor(el, spec, index) {
      var key = el.getAttribute("data-layout-key");
      if (!key && typeof spec.key === "function") key = spec.key(el, index);
      if (!key)
        key =
          (spec.id || "group") +
          ":" +
          (el.id || el.className || "item") +
          ":" +
          index;
      key = String(key).replace(/\s+/g, " ").slice(0, 180);
      el.setAttribute("data-layout-key", key);
      return key;
    }
    function minW(spec) {
      return Number(spec.minWidth) || 96;
    }
    function minH(spec) {
      return Number(spec.minHeight) || 36;
    }
    function maxW(spec, el) {
      var p = el.parentElement;
      var pw = (p && p.clientWidth) || win.innerWidth || 1200;
      return Number(spec.maxWidth) || Math.max(minW(spec), pw - 16);
    }
    function maxH(spec, el) {
      var p = el.parentElement;
      var ph = (p && p.clientHeight) || win.innerHeight || 800;
      return (
        Number(spec.maxHeight) ||
        Math.max(minH(spec), Math.max(ph, win.innerHeight || ph) * 1.5)
      );
    }
    function removeUi(el) {
      el.querySelectorAll(":scope > [data-layout-ui]").forEach(function (n) {
        n.remove();
      });
      el.classList.remove("layout-selected");
    }
    function clearItem(el) {
      el.style.removeProperty("order");
      el.style.removeProperty("flex-basis");
      el.style.removeProperty("height");
      el.classList.remove("rd-layout-constrained");
      removeUi(el);
    }
    function applyOrder(spec, items) {
      var g = groupState(spec),
        rank = {};
      g.order.forEach(function (k, i) {
        rank[k] = i;
      });
      items.forEach(function (el, i) {
        var k = keyFor(el, spec, i);
        el.style.order = String(
          Object.prototype.hasOwnProperty.call(rank, k) ? rank[k] : i,
        );
      });
    }
    function applySize(spec, el, key) {
      var st = itemState(spec, key),
        a = axis(spec),
        sized = false;
      if (Number.isFinite(Number(st.basis))) {
        el.style.flexBasis =
          Math.round(clamp(Number(st.basis), minW(spec), maxW(spec, el))) +
          "px";
        sized = true;
      } else el.style.removeProperty("flex-basis");
      if (Number.isFinite(Number(st.height))) {
        var h = Math.round(
          clamp(Number(st.height), minH(spec), maxH(spec, el)),
        );
        el.style.height = h + "px";
        if (a === "y" || a === "column") el.style.flexBasis = h + "px";
        sized = true;
      } else el.style.removeProperty("height");
      el.classList.toggle("rd-layout-constrained", sized);
    }
    function orderedItems(spec) {
      return itemsOf(spec).sort(function (a, b) {
        return (Number(a.style.order) || 0) - (Number(b.style.order) || 0);
      });
    }
    function saveCurrentOrder(spec) {
      var g = groupState(spec);
      g.order = orderedItems(spec).map(function (el) {
        return el.getAttribute("data-layout-key");
      });
      persist();
    }
    function select(el) {
      if (selected && selected !== el) {
        selected.classList.remove("layout-selected");
        removeUi(selected);
      }
      selected = el;
      if (selected) selected.classList.add("layout-selected");
      if (root.classList.contains(rootClass)) syncUi();
    }
    function moveBy(el, spec, delta) {
      var items = orderedItems(spec),
        i = items.indexOf(el),
        j = clamp(i + delta, 0, items.length - 1);
      if (i < 0 || i === j) return;
      var keys = items.map(function (n) {
        return n.getAttribute("data-layout-key");
      });
      var key = keys.splice(i, 1)[0];
      keys.splice(j, 0, key);
      groupState(spec).order = keys;
      applyOrder(spec, items);
      persist();
      select(el);
    }
    function resetItem(el, spec) {
      var key = el.getAttribute("data-layout-key"),
        g = groupState(spec);
      delete g.items[key];
      g.order = g.order.filter(function (k) {
        return k !== key;
      });
      el.style.removeProperty("order");
      el.style.removeProperty("flex-basis");
      el.style.removeProperty("height");
      el.classList.remove("rd-layout-constrained");
      refresh();
      persist();
      select(el);
    }
    function button(label, title, fn) {
      var b = doc.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.title = title;
      b.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        fn();
      });
      return b;
    }
    function beginDrag(ev, el, spec) {
      if (!root.classList.contains(rootClass) || ev.button !== 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      select(el);
      var key = el.getAttribute("data-layout-key");
      function move(e) {
        var candidates = orderedItems(spec).filter(function (n) {
          return n !== el;
        });
        if (!candidates.length) return;
        var a = axis(spec),
          best = null,
          bestD = Infinity,
          before = false;
        candidates.forEach(function (n) {
          var r = n.getBoundingClientRect(),
            cx = r.left + r.width / 2,
            cy = r.top + r.height / 2;
          var d =
            a === "y" || a === "column"
              ? Math.abs(e.clientY - cy)
              : a === "x" || a === "row"
                ? Math.abs(e.clientX - cx)
                : Math.hypot(e.clientX - cx, e.clientY - cy);
          if (d < bestD) {
            bestD = d;
            best = n;
            before =
              a === "y" || a === "column"
                ? e.clientY < cy
                : a === "x" || a === "row"
                  ? e.clientX < cx
                  : e.clientY < cy - 8 ||
                    (Math.abs(e.clientY - cy) <= 8 && e.clientX < cx);
          }
        });
        if (!best) return;
        var arr = orderedItems(spec)
          .map(function (n) {
            return n.getAttribute("data-layout-key");
          })
          .filter(function (k) {
            return k !== key;
          });
        var bi = arr.indexOf(best.getAttribute("data-layout-key"));
        arr.splice(before ? bi : bi + 1, 0, key);
        groupState(spec).order = arr;
        applyOrder(spec, itemsOf(spec));
      }
      function up() {
        win.removeEventListener("pointermove", move);
        saveCurrentOrder(spec);
      }
      win.addEventListener("pointermove", move);
      win.addEventListener("pointerup", up, {
        once: true,
      });
    }
    function beginResize(ev, el, spec, edge) {
      if (!root.classList.contains(rootClass) || ev.button !== 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      select(el);
      var key = el.getAttribute("data-layout-key"),
        st = itemState(spec, key),
        r = el.getBoundingClientRect();
      var sx = ev.clientX,
        sy = ev.clientY,
        sw = Number(st.basis) || r.width,
        sh = Number(st.height) || r.height;
      function move(e) {
        var dx = e.clientX - sx,
          dy = e.clientY - sy;
        if (edge.indexOf("e") >= 0)
          st.basis = clamp(sw + dx, minW(spec), maxW(spec, el));
        if (edge.indexOf("w") >= 0)
          st.basis = clamp(sw - dx, minW(spec), maxW(spec, el));
        if (edge.indexOf("s") >= 0)
          st.height = clamp(sh + dy, minH(spec), maxH(spec, el));
        if (edge.indexOf("n") >= 0)
          st.height = clamp(sh - dy, minH(spec), maxH(spec, el));
        applySize(spec, el, key);
      }
      function up() {
        win.removeEventListener("pointermove", move);
        persist();
      }
      win.addEventListener("pointermove", move);
      win.addEventListener("pointerup", up, {
        once: true,
      });
    }
    function decorate(el, spec) {
      if (el.querySelector(':scope > [data-layout-ui="toolbar"]')) return;
      var bar = doc.createElement("div");
      bar.className = "rd-layout-ui rd-layout-toolbar";
      bar.setAttribute("data-layout-ui", "toolbar");
      var grip = button("移动", "拖动当前块调整顺序", function () {});
      grip.classList.add("rd-layout-grip");
      grip.addEventListener("pointerdown", function (e) {
        beginDrag(e, el, spec);
      });
      bar.appendChild(grip);
      bar.appendChild(
        button("前", "向前移动", function () {
          moveBy(el, spec, -1);
        }),
      );
      bar.appendChild(
        button("后", "向后移动", function () {
          moveBy(el, spec, 1);
        }),
      );
      bar.appendChild(
        button("复位", "恢复当前块大小与顺序", function () {
          resetItem(el, spec);
        }),
      );
      el.appendChild(bar);
      ["e", "w", "n", "s", "ne", "nw", "se", "sw"].forEach(function (edge) {
        var h = doc.createElement("div");
        h.className = "rd-layout-ui rd-layout-resize " + edge;
        h.setAttribute("data-layout-ui", "resize");
        h.addEventListener("pointerdown", function (e) {
          beginResize(e, el, spec, edge);
        });
        el.appendChild(h);
      });
    }
    function syncUi() {
      var editing = root.classList.contains(rootClass);
      groups.forEach(function (spec) {
        itemsOf(spec).forEach(function (el) {
          if (!editing || el !== selected) removeUi(el);
        });
      });
      if (editing && selected) {
        var spec = groups.find(function (g) {
          return (
            (g.id || "group") === selected.getAttribute("data-layout-group")
          );
        });
        if (spec) decorate(selected, spec);
      }
    }
    function pickForLayout(e) {
      if (!root.classList.contains(rootClass)) return;
      if (e.target.closest && e.target.closest("[data-layout-ui]")) return;
      var el = e.target.closest && e.target.closest("[data-layout-group]");
      if (!el || !doc.documentElement.contains(el)) return;
      e.preventDefault();
      e.stopPropagation();
      select(el);
    }
    function refresh() {
      if (destroyed) return;
      groups.forEach(function (spec) {
        var items = itemsOf(spec);
        items.forEach(function (el, i) {
          keyFor(el, spec, i);
          el.setAttribute("data-layout-group", spec.id || "group");
        });
        applyOrder(spec, items);
        items.forEach(function (el) {
          applySize(spec, el, el.getAttribute("data-layout-key"));
        });
      });
      syncUi();
    }
    function queueRefresh() {
      if (queued || destroyed) return;
      queued = true;
      win.requestAnimationFrame(function () {
        queued = false;
        refresh();
      });
    }
    function setEditing(on) {
      on = !!on;
      root.classList.toggle(rootClass, on);
      if (editButton) {
        editButton.classList.toggle("active", on);
        editButton.setAttribute("aria-pressed", on ? "true" : "false");
        editButton.textContent = on
          ? options.doneText || "完成布局"
          : options.editText || "调整布局";
      }
      if (!on) {
        if (selected) selected.classList.remove("layout-selected");
        selected = null;
        persist();
      }
      syncUi();
    }
    function resetAll() {
      memory = {
        version: 6,
        groups: {},
      };
      try {
        win.localStorage.removeItem(storageKey);
      } catch (e) {}
      groups.forEach(function (spec) {
        itemsOf(spec).forEach(clearItem);
      });
      setEditing(false);
      refresh();
      persist();
    }
    function exportState() {
      return JSON.parse(JSON.stringify(memory));
    }
    function importState(next) {
      if (next && Number(next.version) === 6 && next.groups)
        memory = JSON.parse(JSON.stringify(next));
      else
        memory = {
          version: 6,
          groups: {},
        };
      persist();
      refresh();
    }
    read();
    if (editButton)
      editButton.addEventListener("click", function () {
        setEditing(!root.classList.contains(rootClass));
      });
    if (resetButton) resetButton.addEventListener("click", resetAll);
    doc.addEventListener("pointerdown", pickForLayout, true);
    doc.addEventListener("keydown", function (e) {
      if (!root.classList.contains(rootClass) || !selected) return;
      var tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      var spec = groups.find(function (g) {
        return (g.id || "group") === selected.getAttribute("data-layout-group");
      });
      if (!spec) return;
      if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowUp")) {
        e.preventDefault();
        moveBy(selected, spec, -1);
      } else if (
        e.altKey &&
        (e.key === "ArrowRight" || e.key === "ArrowDown")
      ) {
        e.preventDefault();
        moveBy(selected, spec, 1);
      } else if (e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault();
        var st = itemState(spec, selected.getAttribute("data-layout-key")),
          r = selected.getBoundingClientRect();
        st.basis = clamp(
          (Number(st.basis) || r.width) - 8,
          minW(spec),
          maxW(spec, selected),
        );
        applySize(spec, selected, selected.getAttribute("data-layout-key"));
        persist();
      } else if (e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault();
        var st2 = itemState(spec, selected.getAttribute("data-layout-key")),
          r2 = selected.getBoundingClientRect();
        st2.basis = clamp(
          (Number(st2.basis) || r2.width) + 8,
          minW(spec),
          maxW(spec, selected),
        );
        applySize(spec, selected, selected.getAttribute("data-layout-key"));
        persist();
      } else if (e.shiftKey && e.key === "ArrowUp") {
        e.preventDefault();
        var st3 = itemState(spec, selected.getAttribute("data-layout-key")),
          r3 = selected.getBoundingClientRect();
        st3.height = clamp(
          (Number(st3.height) || r3.height) - 8,
          minH(spec),
          maxH(spec, selected),
        );
        applySize(spec, selected, selected.getAttribute("data-layout-key"));
        persist();
      } else if (e.shiftKey && e.key === "ArrowDown") {
        e.preventDefault();
        var st4 = itemState(spec, selected.getAttribute("data-layout-key")),
          r4 = selected.getBoundingClientRect();
        st4.height = clamp(
          (Number(st4.height) || r4.height) + 8,
          minH(spec),
          maxH(spec, selected),
        );
        applySize(spec, selected, selected.getAttribute("data-layout-key"));
        persist();
      }
    });
    observer = new win.MutationObserver(function (ms) {
      var meaningful = ms.some(function (m) {
        return Array.prototype.some.call(m.addedNodes || [], function (n) {
          return (
            n.nodeType === 1 &&
            !(n.hasAttribute && n.hasAttribute("data-layout-ui"))
          );
        });
      });
      if (meaningful) queueRefresh();
    });
    observer.observe(doc.body, {
      subtree: true,
      childList: true,
    });
    win.addEventListener("resize", queueRefresh);
    refresh();
    return {
      refresh: refresh,
      queueRefresh: queueRefresh,
      setEditing: setEditing,
      reset: resetAll,
      exportState: exportState,
      importState: importState,
      destroy: function () {
        destroyed = true;
        if (observer) observer.disconnect();
        win.removeEventListener("resize", queueRefresh);
        doc.removeEventListener("pointerdown", pickForLayout, true);
      },
    };
  }
  global.RenderDragonDockLayout = {
    create: create,
  };
  global.RenderDragonFlowLayout = {
    create: create,
  };
})(window);
