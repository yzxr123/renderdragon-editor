(function (global) {
  "use strict";

  const seed = global.RenderDragonSeed || {};
  const CATEGORY_INFO = {
    lighting: {
      label: "光照",
      folder: "lighting",
      default_file: "global.json",
      root: "minecraft:lighting_settings",
      identifier_component: "minecraft:lighting_identifier",
      identifier_key: "lighting_identifier",
    },
    fog: {
      label: "体积雾",
      folder: "fogs",
      default_file: "default.json",
      root: "minecraft:fog_settings",
      identifier_component: "minecraft:fog_appearance",
      identifier_key: "fog_identifier",
    },
    atmosphere: {
      label: "大气",
      folder: "atmospherics",
      default_file: "atmospherics.json",
      root: "minecraft:atmosphere_settings",
      identifier_component: "minecraft:atmosphere_identifier",
      identifier_key: "atmosphere_identifier",
    },
    water: {
      label: "水体",
      folder: "water",
      default_file: "water.json",
      root: "minecraft:water_settings",
      identifier_component: "minecraft:water_identifier",
      identifier_key: "water_identifier",
    },
    color_grading: {
      label: "色彩分级",
      folder: "color_grading",
      default_file: "color_grading.json",
      root: "minecraft:color_grading_settings",
      identifier_component: "minecraft:color_grading_identifier",
      identifier_key: "color_grading_identifier",
    },
    shadows: {
      label: "阴影",
      folder: "shadows",
      default_file: "global.json",
      root: "minecraft:shadow_settings",
    },
    local_lights: {
      label: "局部光源",
      folder: "local_lighting",
      default_file: "local_lighting.json",
      root: "minecraft:local_light_settings",
    },
    pbr: {
      label: "PBR 材质",
      folder: "pbr",
      default_file: "global.json",
      root: "minecraft:pbr_fallback_settings",
    },
    cubemap: {
      label: "天空盒",
      folder: "cubemaps",
      default_file: "cubemap.json",
      root: "minecraft:cubemap_settings",
      identifier_component: "minecraft:cubemap_identifier",
      identifier_key: "cubemap_identifier",
    },
  };
  const TIME_SLOTS = {
    noon: "0.0",
    dusk: "0.25",
    night: "0.5",
    dawn: "0.75",
  };
  const FRAMEWORK_VERSION = 1;
  const SETTINGS_DIRS = new Set([
    "lighting",
    "fogs",
    "atmospherics",
    "water",
    "color_grading",
    "shadows",
    "local_lighting",
    "pbr",
    "cubemaps",
    "biomes",
  ]);
  const te = new TextEncoder(),
    td = new TextDecoder("utf-8");
  let currentHandle = null;
  let currentPackName = "";
  let currentBiome = "cherry_grove";
  let originalSettings = null;
  let sourceHandles = new Map();
  function clone(v) {
    return v == null ? v : JSON.parse(JSON.stringify(v));
  }
  function safeName(s, fallback = "渲染龙光影") {
    s = String(s || "")
      .trim()
      .replace(/[\\/:*?"<>|\x00-\x1f]/g, "_")
      .replace(/[. ]+$/g, "");
    return s || fallback;
  }
  function safeNs(s) {
    let x = safeName(s, "renderdragon")
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (!x) x = "renderdragon";
    if (/^\d/.test(x)) x = "rd_" + x;
    return x.slice(0, 48);
  }
  function uuid() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
          (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
          ).toString(16),
        );
  }
  function stripJsonComments(text) {
    let out = "",
      i = 0,
      inStr = false,
      q = "",
      esc = false;
    while (i < text.length) {
      const c = text[i];
      if (inStr) {
        out += c;
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === q) inStr = false;
        i++;
        continue;
      }
      if (c === '"' || c === "'") {
        inStr = true;
        q = c;
        out += c;
        i++;
        continue;
      }
      if (c === "/" && text[i + 1] === "/") {
        i += 2;
        while (i < text.length && !/[\r\n]/.test(text[i])) i++;
        continue;
      }
      if (c === "/" && text[i + 1] === "*") {
        i += 2;
        while (i + 1 < text.length && !(text[i] === "*" && text[i + 1] === "/"))
          i++;
        i += 2;
        continue;
      }
      out += c;
      i++;
    }
    return out;
  }
  function parseJsonRelaxed(text, def = {}) {
    // 删除字符串外的尾随逗号  不修改字符串中的逗号或花括号
    const source = stripJsonComments(String(text || ""));
    let out = "",
      inside = false,
      escape = false;
    for (let i = 0; i < source.length; i++) {
      const c = source[i];
      if (inside) {
        out += c;
        if (escape) escape = false;
        else if (c === "\\") escape = true;
        else if (c === '"') inside = false;
        continue;
      }
      if (c === '"') {
        inside = true;
        out += c;
        continue;
      }
      if (c === ",") {
        let j = i + 1;
        while (/\s/.test(source[j] || "") && j < source.length) j++;
        if (source[j] === "}" || source[j] === "]") continue;
      }
      out += c;
    }
    return JSON.parse(out);
  }
  function prettyJson(v) {
    return JSON.stringify(v, null, 2) + "\n";
  }
  function pathKeys(obj, path) {
    if (Array.isArray(path)) {
      const keys = path.map(String);
      if (
        keys.some((x) => ["__proto__", "prototype", "constructor"].includes(x))
      )
        throw new Error("不允许的字段路径");
      return keys;
    }
    const raw = String(path || "")
      .split(".")
      .filter(Boolean);
    const out = [];
    let cur = obj;
    for (let i = 0; i < raw.length;) {
      let key = raw[i],
        count = 1;
      if (cur && typeof cur === "object") {
        for (let j = raw.length; j > i + 1; j--) {
          const joined = raw.slice(i, j).join(".");
          if (Object.prototype.hasOwnProperty.call(cur, joined)) {
            key = joined;
            count = j - i;
            break;
          }
        }
      }
      if (
        count === 1 &&
        i + 1 < raw.length &&
        /^(0|1)$/.test(key) &&
        /^\d+$/.test(raw[i + 1])
      ) {
        key += "." + raw[i + 1];
        count = 2;
      }
      if (
        ["__proto__", "prototype", "constructor"].includes(key) ||
        raw
          .slice(i, i + count)
          .some((x) => ["__proto__", "prototype", "constructor"].includes(x))
      )
        throw new Error("不允许的字段路径");
      out.push(key);
      cur = cur && typeof cur === "object" ? cur[key] : undefined;
      i += count;
    }
    return out;
  }
  function getPath(obj, path, def) {
    let cur = obj;
    for (const key of pathKeys(obj, path)) {
      if (
        !cur ||
        typeof cur !== "object" ||
        !Object.prototype.hasOwnProperty.call(cur, key)
      )
        return def;
      cur = cur[key];
    }
    return cur;
  }
  function setPath(obj, path, val) {
    const ps = pathKeys(obj, path);
    if (!ps.length) return;
    let cur = obj;
    for (const p of ps.slice(0, -1)) {
      if (!cur[p] || typeof cur[p] !== "object" || Array.isArray(cur[p]))
        cur[p] = {};
      cur = cur[p];
    }
    cur[ps[ps.length - 1]] = clone(val);
  }
  function deletePath(obj, path) {
    const ps = pathKeys(obj, path);
    let cur = obj;
    for (const p of ps.slice(0, -1)) {
      if (!cur || typeof cur !== "object") return;
      cur = cur[p];
    }
    if (cur && typeof cur === "object") delete cur[ps[ps.length - 1]];
  }
  async function toBytes(value) {
    if (value instanceof Uint8Array) return new Uint8Array(value);
    if (value instanceof Blob) return new Uint8Array(await value.arrayBuffer());
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value))
      return new Uint8Array(
        value.buffer.slice(
          value.byteOffset,
          value.byteOffset + value.byteLength,
        ),
      );
    return te.encode(String(value == null ? "" : value));
  }
  class MemoryFileHandle {
    constructor(name, parent, bytes) {
      this.kind = "file";
      this.name = name;
      this.parent = parent;
      this.__rdMemory = true;
      this._bytes = bytes ? new Uint8Array(bytes) : new Uint8Array();
    }
    async getFile() {
      return typeof File === "function"
        ? new File([this._bytes], this.name)
        : new Blob([this._bytes]);
    }
    async createWritable() {
      const self = this;
      return {
        async write(value) {
          self._bytes = await toBytes(value);
          if (self.parent) self.parent.__dirty = true;
        },
        async close() {},
      };
    }
    async queryPermission() {
      return "granted";
    }
    async requestPermission() {
      return "granted";
    }
  }
  class MemoryDirectoryHandle {
    constructor(name, parent = null) {
      this.kind = "directory";
      this.name = name || "资源包";
      this.parent = parent;
      this.__rdMemory = true;
      this.__dirty = false;
      this._children = new Map();
    }
    async getDirectoryHandle(name, opt = {}) {
      name = String(name);
      const old = this._children.get(name);
      if (old) {
        if (old.kind !== "directory")
          throw new DOMException("Not a directory", "TypeMismatchError");
        return old;
      }
      if (!opt.create)
        throw new DOMException("Directory not found", "NotFoundError");
      const d = new MemoryDirectoryHandle(name, this);
      this._children.set(name, d);
      this.__dirty = true;
      return d;
    }
    async getFileHandle(name, opt = {}) {
      name = String(name);
      const old = this._children.get(name);
      if (old) {
        if (old.kind !== "file")
          throw new DOMException("Not a file", "TypeMismatchError");
        return old;
      }
      if (!opt.create)
        throw new DOMException("File not found", "NotFoundError");
      const f = new MemoryFileHandle(name, this);
      this._children.set(name, f);
      this.__dirty = true;
      return f;
    }
    async removeEntry(name, opt = {}) {
      name = String(name);
      const old = this._children.get(name);
      if (!old) throw new DOMException("Entry not found", "NotFoundError");
      if (old.kind === "directory" && !opt.recursive && old._children.size)
        throw new DOMException(
          "Directory not empty",
          "InvalidModificationError",
        );
      this._children.delete(name);
      this.__dirty = true;
    }
    async *entries() {
      for (const row of this._children) yield row;
    }
    async queryPermission() {
      return "granted";
    }
    async requestPermission() {
      return "granted";
    }
  }
  function isMemoryHandle(handle) {
    return !!(handle && handle.__rdMemory);
  }
  function abortError() {
    try {
      return new DOMException("用户取消", "AbortError");
    } catch (e) {
      const x = new Error("用户取消");
      x.name = "AbortError";
      return x;
    }
  }
  async function folderInputHandle() {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.setAttribute("webkitdirectory", "");
      input.style.display = "none";
      document.body.appendChild(input);
      let settled = false;
      const cleanup = () => {
        settled = true;
        input.remove();
      };
      input.addEventListener("change", async () => {
        try {
          const files = Array.from(input.files || []);
          if (!files.length) {
            cleanup();
            reject(abortError());
            return;
          }
          const paths = files.map((f) =>
            (f.webkitRelativePath || f.name)
              .replace(/\\/g, "/")
              .replace(/^\/+/, ""),
          );
          const first = paths[0].split("/")[0] || "资源包";
          const common = paths.every(
            (x) => x.includes("/") && x.split("/")[0] === first,
          )
            ? first
            : "";
          const root = new MemoryDirectoryHandle(common || "资源包");
          for (let i = 0; i < files.length; i++) {
            const rel = common ? paths[i].slice(common.length + 1) : paths[i];
            if (rel)
              await writeBytes(
                root,
                rel,
                new Uint8Array(await files[i].arrayBuffer()),
              );
          }
          root.__dirty = false;
          cleanup();
          resolve(root);
        } catch (e) {
          cleanup();
          reject(e);
        }
      });
      const onFocus = () =>
        setTimeout(() => {
          if (!settled && !(input.files && input.files.length)) {
            cleanup();
            reject(abortError());
          }
        }, 350);
      window.addEventListener("focus", onFocus, {
        once: true,
      });
      input.click();
    });
  }
  async function pickDirectory(mode = "readwrite") {
    if (typeof global.showDirectoryPicker === "function")
      return global.showDirectoryPicker({
        mode,
      });
    return folderInputHandle();
  }
  async function pickFile(accept = "") {
    if (typeof global.showOpenFilePicker === "function") {
      const opts = accept
        ? {
            types: [
              {
                description: "文件",
                accept: {
                  "application/octet-stream": accept
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                },
              },
            ],
          }
        : undefined;
      try {
        const [h] = await global.showOpenFilePicker(opts);
        return h ? await h.getFile() : null;
      } catch (e) {
        if (e && e.name === "TypeError") {
          const [h] = await global.showOpenFilePicker();
          return h ? await h.getFile() : null;
        }
        throw e;
      }
    }
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      if (accept) input.accept = accept;
      input.style.display = "none";
      document.body.appendChild(input);
      let settled = false;
      const cleanup = () => {
        settled = true;
        input.remove();
      };
      input.onchange = () => {
        const f = input.files && input.files[0];
        cleanup();
        f ? resolve(f) : reject(abortError());
      };
      const onFocus = () =>
        setTimeout(() => {
          if (!settled && !(input.files && input.files.length)) {
            cleanup();
            reject(abortError());
          }
        }, 350);
      window.addEventListener("focus", onFocus, {
        once: true,
      });
      input.click();
    });
  }
  let crcTable = null;
  function getCrcTable() {
    if (crcTable) return crcTable;
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
    return crcTable;
  }
  function crc32(bytes) {
    const t = getCrcTable();
    let c = 0xffffffff;
    for (const b of bytes) c = t[(c ^ b) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function pushU16(a, v) {
    a.push(v & 255, (v >>> 8) & 255);
  }
  function pushU32(a, v) {
    a.push(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255);
  }
  function zipStamp(d = new Date()) {
    let year = Math.max(1980, d.getFullYear());
    return {
      time:
        ((d.getHours() & 31) << 11) |
        ((d.getMinutes() & 63) << 5) |
        ((d.getSeconds() / 2) | 0),
      date:
        (((year - 1980) & 127) << 9) |
        (((d.getMonth() + 1) & 15) << 5) |
        (d.getDate() & 31),
    };
  }
  async function buildZipBlobFromHandle(root, folderName = "") {
    const rows = await walk(root, "", {
      filter: () => true,
    });
    if (rows.length > 65535)
      throw new Error("导出文件数量超过 ZIP32 上限  请分批导出");
    const chunks = [],
      central = [];
    let offset = 0;
    const stamp = zipStamp();
    for (const row of rows) {
      const file = await row.handle.getFile();
      const data = new Uint8Array(await file.arrayBuffer());
      const rel = String(row.rel || file.name)
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");
      const zipPath =
        (folderName
          ? String(folderName)
              .replace(/\\/g, "/")
              .replace(/^\/+|\/+$/g, "") + "/"
          : "") + rel;
      const nameBytes = te.encode(zipPath);
      if (
        nameBytes.length > 65535 ||
        data.length > 0xffffffff ||
        offset + data.length + nameBytes.length + 30 > 0xffffffff
      )
        throw new Error("资源包超过 ZIP32 格式上限  请分批导出");
      const crc = crc32(data);
      const local = [];
      pushU32(local, 0x04034b50);
      pushU16(local, 20);
      pushU16(local, 0x0800);
      pushU16(local, 0);
      pushU16(local, stamp.time);
      pushU16(local, stamp.date);
      pushU32(local, crc);
      pushU32(local, data.length);
      pushU32(local, data.length);
      pushU16(local, nameBytes.length);
      pushU16(local, 0);
      const lh = new Uint8Array(local);
      chunks.push(lh, nameBytes, data);
      const c = [];
      pushU32(c, 0x02014b50);
      pushU16(c, 20);
      pushU16(c, 20);
      pushU16(c, 0x0800);
      pushU16(c, 0);
      pushU16(c, stamp.time);
      pushU16(c, stamp.date);
      pushU32(c, crc);
      pushU32(c, data.length);
      pushU32(c, data.length);
      pushU16(c, nameBytes.length);
      pushU16(c, 0);
      pushU16(c, 0);
      pushU16(c, 0);
      pushU16(c, 0);
      pushU32(c, 0);
      pushU32(c, offset);
      central.push(new Uint8Array(c), nameBytes);
      offset += lh.length + nameBytes.length + data.length;
    }
    const centralSize = central.reduce((n, x) => n + x.length, 0);
    const end = [];
    pushU32(end, 0x06054b50);
    pushU16(end, 0);
    pushU16(end, 0);
    pushU16(end, rows.length);
    pushU16(end, rows.length);
    pushU32(end, centralSize);
    pushU32(end, offset);
    pushU16(end, 0);
    return new Blob([...chunks, ...central, new Uint8Array(end)], {
      type: "application/zip",
    });
  }
  async function downloadZipHandle(root, name, wrap = true) {
    const base = safeName(name || root.name || "RenderDragon", "RenderDragon");
    const zipName = base.toLowerCase().endsWith(".zip") ? base : base + ".zip";
    const folder = wrap ? zipName.replace(/\.zip$/i, "") : "";
    const blob = await buildZipBlobFromHandle(root, folder);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
    root.__dirty = false;
    return zipName;
  }
  async function makeOutputDir(name) {
    if (typeof global.showDirectoryPicker === "function") {
      const parent = await global.showDirectoryPicker({
        mode: "readwrite",
      });
      if (!(await perm(parent, "readwrite")))
        throw new Error("没有目标文件夹写入权限");
      return {
        dir: await createSubdir(parent, name),
        fallback: false,
      };
    }
    return {
      dir: new MemoryDirectoryHandle(safeName(name, "RenderDragon")),
      fallback: true,
    };
  }
  async function persistIfMemory(root, name) {
    if (isMemoryHandle(root))
      return downloadZipHandle(root, name || root.name, true);
    return null;
  }
  async function perm(handle, mode = "readwrite") {
    if (!handle) return false;
    const opt = {
      mode,
    };
    try {
      if ((await handle.queryPermission(opt)) === "granted") return true;
    } catch (e) {}
    try {
      return (await handle.requestPermission(opt)) === "granted";
    } catch (e) {
      return false;
    }
  }
  async function getDir(root, path, create = false) {
    let d = root;
    for (const p of String(path || "")
      .split("/")
      .filter(Boolean))
      d = await d.getDirectoryHandle(p, {
        create,
      });
    return d;
  }
  async function getFileHandle(root, path, create = false) {
    const ps = String(path).replace(/\\/g, "/").split("/").filter(Boolean);
    const name = ps.pop();
    const d = await getDir(root, ps.join("/"), create);
    return d.getFileHandle(name, {
      create,
    });
  }
  async function exists(root, path, kind = "file") {
    try {
      if (kind === "dir") await getDir(root, path, false);
      else await getFileHandle(root, path, false);
      return true;
    } catch (e) {
      return false;
    }
  }
  async function readBytes(root, path) {
    const h = await getFileHandle(root, path, false);
    const f = await h.getFile();
    return new Uint8Array(await f.arrayBuffer());
  }
  async function readText(root, path) {
    const h = await getFileHandle(root, path, false);
    const f = await h.getFile();
    return f.text();
  }
  async function readJson(root, path, def = {}) {
    let text;
    try {
      text = await readText(root, path);
    } catch (e) {
      if (e.name === "NotFoundError") return clone(def);
      throw e;
    }
    try {
      return parseJsonRelaxed(text);
    } catch (e) {
      throw new Error("JSON 格式错误 " + path + "  " + e.message);
    }
  }
  async function writeBytes(root, path, bytes) {
    const h = await getFileHandle(root, path, true);
    const w = await h.createWritable();
    await w.write(bytes instanceof Blob ? bytes : new Blob([bytes]));
    await w.close();
  }
  async function writeText(root, path, text) {
    await writeBytes(root, path, te.encode(String(text)));
  }
  async function writeJson(root, path, obj) {
    await writeText(root, path, prettyJson(obj));
  }
  async function removePath(root, path) {
    const ps = String(path).replace(/\\/g, "/").split("/").filter(Boolean);
    const name = ps.pop();
    const d = await getDir(root, ps.join("/"), false);
    await d.removeEntry(name, {
      recursive: true,
    });
  }
  async function listDir(root, path = "") {
    const d = path ? await getDir(root, path, false) : root;
    const out = [];
    for await (const [name, h] of d.entries())
      out.push({
        name,
        kind: h.kind,
        handle: h,
      });
    return out;
  }
  async function walk(root, path = "", opts = {}) {
    const out = [];
    let d;
    try {
      d = path ? await getDir(root, path, false) : root;
    } catch (e) {
      return out;
    }
    for await (const [name, h] of d.entries()) {
      const rel = (path ? path + "/" : "") + name;
      if (h.kind === "directory") {
        if (opts.skipDirs && opts.skipDirs.has(name)) continue;
        if (opts.includeDirs)
          out.push({
            rel,
            kind: "directory",
            handle: h,
          });
        if (opts.recursive !== false)
          out.push(...(await walk(root, rel, opts)));
      } else {
        if (!opts.filter || opts.filter(rel, name))
          out.push({
            rel,
            kind: "file",
            handle: h,
          });
      }
    }
    return out;
  }
  function defaultDocument(packName, category) {
    const ns = safeNs(packName);
    const key = (v) => ({
      "0.0": clone(v),
      0.25: clone(v),
      0.5: clone(v),
      0.75: clone(v),
    });
    if (category === "lighting")
      return {
        format_version: "1.21.90",
        "minecraft:lighting_settings": {
          description: {
            identifier: ns + ":default_lighting",
          },
          directional_lights: {
            orbital: {
              sun: {
                illuminance: 120,
                color: "#FFFFFF",
              },
              moon: {
                illuminance: 0.27,
                color: "#FFFFFF",
              },
              orbital_offset_degrees: 3,
            },
            flash: {
              illuminance: 5,
              color: "#FFFFFF",
            },
          },
          emissive: {
            desaturation: 0.1,
          },
          ambient: {
            illuminance: 0.02,
            color: "#FFFFFF",
          },
          sky: {
            intensity: 1,
          },
        },
      };
    if (category === "fog")
      return {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: ns + ":fog_default",
          },
          distance: {
            air: {
              fog_start: 0.92,
              fog_end: 1,
              fog_color: "#CDDEEF",
              render_distance_type: "render",
            },
            weather: {
              fog_start: 0.23,
              fog_end: 0.7,
              fog_color: "#666667",
              render_distance_type: "render",
            },
            water: {
              fog_start: 0,
              fog_end: 32,
              fog_color: "#44AFF5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0,
                  fog_end: 0.01,
                  fog_color: "#44AFF5",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
            lava: {
              fog_start: 0,
              fog_end: 0.64,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
            lava_resistance: {
              fog_start: 2,
              fog_end: 4,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
            powder_snow: {
              fog_start: 0,
              fog_end: 2,
              fog_color: "#9AA7B8",
              render_distance_type: "fixed",
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.04,
                uniform: false,
                zero_density_height: 165,
                max_density_height: 72,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.02, 0.02, 0.02],
                absorption: [0, 0, 0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.55,
              },
            },
          },
        },
      };
    if (category === "atmosphere")
      return {
        format_version: "1.21.40",
        "minecraft:atmosphere_settings": {
          description: {
            identifier: ns + ":default_atmosphere",
          },
          horizon_blend_stops: {
            min: key(0),
            start: key(0.25),
            mie_start: key(0.5),
            max: key(0.25),
          },
          rayleigh_strength: key(0),
          sun_mie_strength: key(0),
          moon_mie_strength: key(0),
          sun_glare_shape: key(4),
          sky_zenith_color: {
            "0.0": [80, 150, 230],
            0.25: [80, 120, 180],
            0.5: [7, 10, 36],
            0.75: [80, 120, 180],
          },
          sky_horizon_color: {
            "0.0": [180, 220, 255],
            0.25: [255, 140, 100],
            0.5: [35, 40, 75],
            0.75: [255, 170, 130],
          },
        },
      };
    if (category === "water")
      return {
        format_version: "1.21.90",
        "minecraft:water_settings": {
          description: {
            identifier: ns + ":default_water",
          },
          particle_concentrations: {
            cdom: 1,
            chlorophyll: 0.5,
            suspended_sediment: 0.5,
          },
          waves: {
            enabled: true,
            depth: 1,
            direction_increment: 80,
            frequency: 1,
            frequency_scaling: 1.2,
            mix: 0.2,
            octaves: 28,
            pull: 0.38,
            sampleWidth: 0.01,
            shape: 1.5,
            speed: 2,
            speed_scaling: 1.03,
          },
          caustics: {
            enabled: true,
            frame_length: 0.05,
            power: 2,
            scale: 0.5,
          },
        },
      };
    if (category === "color_grading")
      return {
        format_version: "1.21.90",
        "minecraft:color_grading_settings": {
          description: {
            identifier: ns + ":grade",
          },
          color_grading: clone(seed.COOL_CYAN_GRADE || {}),
          tone_mapping: {
            operator: seed.COOL_CYAN_TONE || "hable",
          },
        },
      };
    if (category === "shadows")
      return {
        format_version: "1.21.80",
        "minecraft:shadow_settings": {
          shadow_style: "soft_shadows",
          texel_size: 16,
        },
      };
    if (category === "local_lights")
      return {
        format_version: "1.21.120",
        "minecraft:local_light_settings": {
          "minecraft:torch": {
            light_color: "#EFE39D",
            light_type: "point_light",
          },
          "minecraft:redstone_torch": {
            light_color: "#FF0000",
            light_type: "point_light",
          },
          "minecraft:end_rod": {
            light_color: "#FFFFFF",
            light_type: "point_light",
          },
          "minecraft:lantern": {
            light_color: "#CE8133",
            light_type: "point_light",
          },
          "minecraft:soul_lantern": {
            light_color: "#00FFFF",
            light_type: "point_light",
          },
          "minecraft:soul_torch": {
            light_color: "#00FFFF",
            light_type: "point_light",
          },
        },
      };
    if (category === "pbr")
      return {
        format_version: "1.21.40",
        "minecraft:pbr_fallback_settings": {
          blocks: {
            global_metalness_emissive_roughness_subsurface: [0, 0, 255, 0],
          },
          actors: {
            global_metalness_emissive_roughness_subsurface: [0, 0, 255, 0],
          },
          particles: {
            global_metalness_emissive_roughness_subsurface: [0, 0, 255, 0],
          },
          items: {
            global_metalness_emissive_roughness_subsurface: [0, 0, 255, 0],
          },
        },
      };
    if (category === "cubemap")
      return {
        format_version: "1.21.90",
        "minecraft:cubemap_settings": {
          description: {
            identifier: ns + ":default_cubemap",
          },
        },
      };
    return {};
  }
  function rootBody(doc, cat) {
    const info = CATEGORY_INFO[cat];
    return info &&
      doc &&
      typeof doc === "object" &&
      doc[info.root] &&
      typeof doc[info.root] === "object"
      ? doc[info.root]
      : {};
  }
  function identFromDoc(doc, cat) {
    const b = rootBody(doc, cat);
    return (b && b.description && String(b.description.identifier || "")) || "";
  }
  async function biomeDoc(root, biome, create = false) {
    const rel =
      "biomes/" +
      String(biome || "cherry_grove").replace("minecraft:", "") +
      ".client_biome.json";
    if (await exists(root, rel)) {
      const preferred = await readJson(root, rel, {});
      if (
        !root.__rdWorkspace ||
        !root.store ||
        root.store.overlay.has(rel) ||
        global.RenderDragonWorkspace?.session?.sourcePaths.has(rel)
      )
        return {
          rel,
          doc: preferred,
        };
    }
    for (const row of await walk(root, "biomes", {
      filter: (x) => x.endsWith(".json"),
    })) {
      if (row.rel === rel) continue;
      if (
        root.__rdWorkspace &&
        !global.RenderDragonWorkspace?.session?.sourcePaths.has(row.rel)
      )
        continue;
      const doc = await readJson(root, row.rel, {}),
        id = doc?.["minecraft:client_biome"]?.description?.identifier;
      if (
        String(id || "").replace(/^minecraft:/, "") ===
        String(biome || "").replace(/^minecraft:/, "")
      )
        return {
          rel: row.rel,
          doc,
        };
    }
    if (await exists(root, rel))
      return {
        rel,
        doc: await readJson(root, rel, {}),
      };
    if (!create)
      return {
        rel,
        doc: {},
      };
    const doc = {
      format_version: "1.21.120",
      "minecraft:client_biome": {
        description: {
          identifier: "minecraft:" + biome,
        },
        components: {},
      },
    };
    await writeJson(root, rel, doc);
    return {
      rel,
      doc,
    };
  }
  function biomeComponents(doc, create = false) {
    if (!doc || typeof doc !== "object") return {};
    let b = doc["minecraft:client_biome"];
    if (!b || typeof b !== "object") {
      if (!create) return {};
      b = {};
      doc["minecraft:client_biome"] = b;
    }
    let c = b.components;
    if (!c || typeof c !== "object") {
      if (!create) return {};
      c = {};
      b.components = c;
    }
    return c;
  }
  async function scanCategory(root, cat) {
    const info = CATEGORY_INFO[cat];
    if (!info) return [];
    const rows = [];
    for (const r of await walk(root, info.folder, {
      filter: (rel) => rel.toLowerCase().endsWith(".json"),
    })) {
      const doc = await readJson(root, r.rel);
      if (!doc || !doc[info.root]) continue;
      rows.push({
        file: r.rel,
        identifier: identFromDoc(doc, cat),
        doc,
      });
    }
    rows.sort((a, b) => a.file.localeCompare(b.file));
    return rows;
  }
  async function boundIdentifier(root, biome, cat) {
    const info = CATEGORY_INFO[cat];
    if (!info || !info.identifier_component || !info.identifier_key) return "";
    const { doc } = await biomeDoc(root, biome, false);
    const comps = biomeComponents(doc, false);
    const v = comps[info.identifier_component];
    if (v && typeof v === "object") return String(v[info.identifier_key] || "");
    if (typeof v === "string") return v;
    return "";
  }
  async function resolveCategory(root, cat, biome, create = false) {
    const info = CATEGORY_INFO[cat];
    if (!info)
      return {
        rel: "",
        doc: {},
        identifier: "",
      };
    const rows = await scanCategory(root, cat);
    if (info.identifier_component && biome) {
      const bound = await boundIdentifier(root, biome, cat);
      if (bound) {
        const row = rows.find((r) => r.identifier === bound);
        if (row)
          return {
            rel: row.file,
            doc: row.doc,
            identifier: row.identifier,
          };
      }
    }
    const def = info.folder + "/" + info.default_file;
    if (await exists(root, def)) {
      const doc = await readJson(root, def, {});
      return {
        rel: def,
        doc,
        identifier: identFromDoc(doc, cat),
      };
    }
    if (!create)
      return {
        rel: def,
        doc: {},
        identifier: "",
      };
    const doc = defaultDocument(currentPackName || root.name, cat);
    await writeJson(root, def, doc);
    return {
      rel: def,
      doc,
      identifier: identFromDoc(doc, cat),
    };
  }
  async function readPackName(root) {
    const m = await readJson(root, "manifest.json", {});
    return String(m?.header?.name || root.name || "渲染龙光影");
  }
  async function inferPipeline(root) {
    const m = await readJson(root, "manifest.json", {});
    return Array.isArray(m.capabilities) && m.capabilities.includes("pbr")
      ? "renderdragon"
      : "resource";
  }
  async function captureSettings(root) {
    const map = new Map();
    for (const dir of SETTINGS_DIRS) {
      let rows = [];
      try {
        rows = await walk(root, dir, {
          filter: (rel) => rel.toLowerCase().endsWith(".json"),
        });
      } catch (e) {}
      for (const r of rows) {
        try {
          map.set(r.rel, await readText(root, r.rel));
        } catch (e) {}
      }
    }
    return map;
  }
  async function restoreSettings(root) {
    if (!originalSettings)
      return {
        ok: false,
        reason: "本次会话没有可恢复的原始状态",
      };
    for (const [rel, text] of originalSettings)
      await writeText(root, rel, text);
    for (const dir of SETTINGS_DIRS) {
      let rows = [];
      try {
        rows = await walk(root, dir, {
          filter: (rel) => rel.toLowerCase().endsWith(".json"),
        });
      } catch (e) {}
      for (const r of rows)
        if (!originalSettings.has(r.rel))
          try {
            await removePath(root, r.rel);
          } catch (e) {}
    }
    return {
      ok: true,
      reason: "已恢复本次打开时的参数文件",
    };
  }
  async function snapshot(root, biome = currentBiome, reason = "") {
    const meta = {
      name: await readPackName(root),
      root: root.name,
      pipeline: await inferPipeline(root),
    };
    const categories = {};
    const available = {};
    for (const cat of Object.keys(CATEGORY_INFO)) {
      if (cat === "cubemap") continue;
      const r = await resolveCategory(root, cat, biome, false);
      const info = CATEGORY_INFO[cat];
      categories[cat] = {
        exists: !!(r.doc && Object.keys(r.doc).length),
        file: r.rel,
        identifier: r.identifier,
        data: r.doc && r.doc[info.root] ? clone(r.doc[info.root]) : {},
      };
      available[cat] = (await scanCategory(root, cat)).map((x) => ({
        identifier: x.identifier,
        file: x.file,
      }));
    }
    available.cubemap = (await scanCategory(root, "cubemap")).map((x) => ({
      identifier: x.identifier,
      file: x.file,
    }));
    const { doc: bdoc } = await biomeDoc(root, biome, false);
    const comps = biomeComponents(bdoc, false);
    return {
      ok: true,
      open: true,
      reason,
      meta,
      biome,
      biomes: clone(seed.BIOMES || []),
      categories,
      binding: {
        components: clone(comps),
        available,
      },
      time_slots: clone(TIME_SLOTS),
      reference_presets: clone(seed.REFERENCE_PRESETS || []),
      biome_meta: clone(seed.BIOME_META || {}),
      recipes: recipeList(),
    };
  }
  async function openPack(handle, biome = "cherry_grove") {
    if (!handle) handle = await pickDirectory("readwrite");
    if (!(await perm(handle, "readwrite")))
      return {
        ok: false,
        reason: "没有资源包读写权限",
      };
    if (!(await exists(handle, "manifest.json")))
      return {
        ok: false,
        reason: "所选文件夹没有 manifest.json",
      };
    currentHandle = handle;
    currentPackName = await readPackName(handle);
    currentBiome = String(biome || "cherry_grove").replace("minecraft:", "");
    originalSettings = await captureSettings(handle);
    return snapshot(handle, currentBiome, "已打开渲染龙资源包");
  }
  async function bindCategory(root, biome, cat, identifier) {
    const info = CATEGORY_INFO[cat];
    if (!info || !info.identifier_component || !info.identifier_key) return;
    const b = await biomeDoc(root, biome, true),
      comps = biomeComponents(b.doc, true);
    if (identifier)
      comps[info.identifier_component] = {
        [info.identifier_key]: identifier,
      };
    else delete comps[info.identifier_component];
    await writeJson(root, b.rel, b.doc);
  }
  async function ensureCategory(root, cat, biome) {
    const r = await resolveCategory(root, cat, biome, true);
    if (CATEGORY_INFO[cat]?.identifier_component && r.identifier)
      await bindCategory(root, biome, cat, r.identifier);
    return snapshot(
      root,
      biome,
      "已建立 " + (CATEGORY_INFO[cat]?.label || cat),
    );
  }
  async function writebackPayload(root, biome, payload) {
    payload = payload || {};
    for (const [cat, body] of Object.entries(payload.categories || {})) {
      if (!CATEGORY_INFO[cat] || !body || typeof body !== "object") continue;
      const r = await resolveCategory(root, cat, biome, true);
      const info = CATEGORY_INFO[cat];
      r.doc[info.root] = clone(body);
      await writeJson(root, r.rel, r.doc);
    }
    const comps = payload.binding && payload.binding.components;
    if (comps && typeof comps === "object") {
      const b = await biomeDoc(root, biome, true);
      const dst = biomeComponents(b.doc, true);
      for (const key of [
        "minecraft:lighting_identifier",
        "minecraft:atmosphere_identifier",
        "minecraft:color_grading_identifier",
        "minecraft:water_identifier",
        "minecraft:fog_appearance",
        "minecraft:cubemap_identifier",
        "minecraft:water_appearance",
      ]) {
        if (key in comps) dst[key] = clone(comps[key]);
        else delete dst[key];
      }
      await writeJson(root, b.rel, b.doc);
    }
    return snapshot(root, biome, "已保存到资源包");
  }
  function recipeList() {
    try {
      const rows = JSON.parse(
        localStorage.getItem("renderdragon_recipes") || "[]",
      );
      return Array.isArray(rows)
        ? rows.filter(
            (row) =>
              row && typeof row === "object" && typeof row.id === "string",
          )
        : [];
    } catch (e) {
      return [];
    }
  }
  function recipeSave(name, payload, description) {
    const rows = recipeList();
    const id = uuid();
    rows.unshift({
      id,
      name: safeName(name, "参数配方"),
      description: String(description || ""),
      payload: clone(payload),
      created: Date.now(),
    });
    localStorage.setItem(
      "renderdragon_recipes",
      JSON.stringify(rows.slice(0, 100)),
    );
    return rows.slice(0, 100);
  }
  function recipeDelete(id) {
    const rows = recipeList().filter((x) => x.id !== id);
    localStorage.setItem("renderdragon_recipes", JSON.stringify(rows));
    return rows;
  }
  function diffLeaves(base, cur, prefix = "", out = []) {
    if (base === cur) return out;
    if (Array.isArray(base) || base === null || typeof base !== "object") {
      if (JSON.stringify(base) !== JSON.stringify(cur))
        out.push([prefix, clone(cur)]);
      return out;
    }
    if (!cur || typeof cur !== "object" || Array.isArray(cur)) {
      out.push([prefix, clone(cur)]);
      return out;
    }
    for (const k of [
      ...new Set([...Object.keys(base), ...Object.keys(cur)]),
    ].sort()) {
      const p = prefix ? prefix + "." + k : k;
      if (!(k in cur)) out.push([p, null, "delete"]);
      else diffLeaves(base[k], cur[k], p, out);
    }
    return out;
  }
  function seedFogMap() {
    const m = new Map();
    for (const row of seed.SITE_FOG_SEED || []) {
      const doc = row.fileJson || {};
      const id = doc?.["minecraft:fog_settings"]?.description?.identifier;
      if (id) m.set(id, row);
    }
    return m;
  }
  function seedBiomeMap() {
    const m = new Map();
    for (const row of seed.SITE_BIOME_SEED || []) {
      const id =
        row?.fileJson?.["minecraft:client_biome"]?.description?.identifier ||
        "";
      m.set(String(id).replace("minecraft:", ""), row);
    }
    return m;
  }
  function encodeSitePath(type, path) {
    path = String(path || "");
    if (type === "biome") {
      const a = "minecraft:client_biome.components.",
        b = "minecraft:client_biome.";
      if (path.startsWith(a)) return path.slice(a.length);
      if (path.startsWith(b)) return "$" + path.slice(b.length);
    }
    if (type === "fog") {
      const a = "minecraft:fog_settings.";
      if (path.startsWith(a)) return path.slice(a.length);
    }
    return path;
  }
  function decodeSitePath(type, path) {
    path = String(path || "");
    if (type === "biome")
      return path.startsWith("$")
        ? "minecraft:client_biome." + path.slice(1)
        : "minecraft:client_biome.components." + path;
    if (type === "fog") return "minecraft:fog_settings." + path;
    return path;
  }
  async function siteDeltaExport(root, biome) {
    const bSeed = seedBiomeMap(),
      fSeed = seedFogMap();
    const outB = [],
      outF = [],
      fogIds = new Set();
    const targets = biome ? [biome] : Array.from(bSeed.keys());
    for (const b of targets) {
      const seed = bSeed.get(b);
      if (!seed) continue;
      const { doc: cur } = await biomeDoc(root, b, false);
      const changes = diffLeaves(seed.fileJson, cur, "");
      if (changes.length)
        outB.push([
          b,
          changes.map(([p, v, op]) =>
            op
              ? [encodeSitePath("biome", p), v, op]
              : [encodeSitePath("biome", p), v],
          ),
        ]);
      const comps = biomeComponents(cur, false);
      const fid = comps?.["minecraft:fog_appearance"]?.fog_identifier;
      if (fid) fogIds.add(fid);
    }
    if (!biome) for (const id of fSeed.keys()) fogIds.add(id);
    for (const fid of Array.from(fogIds).sort()) {
      const seed = fSeed.get(fid);
      if (!seed) continue;
      let cur = null;
      for (const row of await scanCategory(root, "fog"))
        if (row.identifier === fid) {
          cur = row.doc;
          break;
        }
      if (!cur) continue;
      const changes = diffLeaves(seed.fileJson, cur, "");
      if (changes.length)
        outF.push([
          String(seed.slug || fid.split(":").pop()),
          changes.map(([p, v, op]) =>
            op
              ? [encodeSitePath("fog", p), v, op]
              : [encodeSitePath("fog", p), v],
          ),
        ]);
    }
    return {
      v: 2,
      n: await readPackName(root),
      a: "RenderDragon 光影编辑器",
      t: Date.now(),
      m: "share",
      b: outB,
      f: outF,
    };
  }
  async function siteDeltaImport(root, delta) {
    if (!delta || typeof delta !== "object" || Number(delta.v || 0) !== 2)
      return {
        ok: false,
        reason: "不是受支持的雾参数修改项 v2 JSON",
      };
    let bc = 0,
      fc = 0;
    for (const row of delta.b || []) {
      const b = String(row?.[0] || "").replace("minecraft:", "");
      if (!b) continue;
      if (!/^[a-z0-9_:-]+$/i.test(b)) throw new Error("无效群系标识");
      const bd = await biomeDoc(root, b, true);
      for (const pair of row[1] || []) {
        if (!Array.isArray(pair) || pair.length < 2) continue;
        if (pair[2] === "delete")
          deletePath(bd.doc, decodeSitePath("biome", pair[0]));
        else setPath(bd.doc, decodeSitePath("biome", pair[0]), pair[1]);
      }
      await writeJson(root, bd.rel, bd.doc);
      bc++;
    }
    const bySlug = new Map();
    for (const x of seed.SITE_FOG_SEED || [])
      bySlug.set(String(x.slug || ""), x);
    for (const row of delta.f || []) {
      const slug = String(row?.[0] || "");
      if (!slug) continue;
      let seed = bySlug.get(slug);
      if (!seed && slug === "mega_spruse_taiga_mutated")
        seed = bySlug.get("mega_spruce_taiga_mutated");
      if (!seed) continue;
      const id =
        seed?.fileJson?.["minecraft:fog_settings"]?.description?.identifier;
      let rr = null;
      for (const x of await scanCategory(root, "fog"))
        if (x.identifier === id) {
          rr = x;
          break;
        }
      if (!rr)
        rr = {
          file: seed.fileName || "fogs/" + slug + ".json",
          doc: clone(seed.fileJson),
        };
      for (const pair of row[1] || []) {
        if (!Array.isArray(pair) || pair.length < 2) continue;
        if (pair[2] === "delete")
          deletePath(rr.doc, decodeSitePath("fog", pair[0]));
        else setPath(rr.doc, decodeSitePath("fog", pair[0]), pair[1]);
      }
      await writeJson(root, rr.file, rr.doc);
      fc++;
    }
    return snapshot(
      root,
      currentBiome,
      "已导入雾参数修改项  群系" + bc + "  雾" + fc,
    );
  }
  function createFrameworkModel(display) {
    const categories = {};
    for (const cat of [
      "lighting",
      "fog",
      "atmosphere",
      "water",
      "color_grading",
      "shadows",
      "local_lights",
      "pbr",
    ]) {
      categories[cat] = defaultDocument(display, cat);
    }
    const fogs = (seed.SITE_FOG_SEED || [])
      .filter((row) => row && row.fileName && row.fileJson)
      .map((row) => ({
        file: row.fileName,
        doc: clone(row.fileJson),
      }));
    const biomes = (seed.SITE_BIOME_SEED || [])
      .filter((row) => row && row.fileName && row.fileJson)
      .map((row) => ({
        file: row.fileName,
        doc: clone(row.fileJson),
      }));
    return {
      version: FRAMEWORK_VERSION,
      name: display,
      categories,
      fogs,
      biomes,
    };
  }
  function frameworkBindingView(comps) {
    const out = {};
    const keys = [
      "minecraft:lighting_identifier",
      "minecraft:atmosphere_identifier",
      "minecraft:color_grading_identifier",
      "minecraft:water_identifier",
      "minecraft:fog_appearance",
      "minecraft:cubemap_identifier",
      "minecraft:water_appearance",
    ];
    for (const key of keys)
      if (comps && key in comps) out[key] = clone(comps[key]);
    return out;
  }
  async function syncFrameworkV1(root, modelHint = null) {
    if (!root) return;
    const globalCategories = {};
    const identifiers = {};
    for (const cat of [
      "lighting",
      "fog",
      "atmosphere",
      "water",
      "color_grading",
      "shadows",
      "local_lights",
      "pbr",
    ]) {
      const r = await resolveCategory(root, cat, null, false);
      globalCategories[cat] = clone(r.doc || {});
      if (r.identifier) identifiers[cat] = r.identifier;
    }
    const biomeProfiles = {};
    for (const biome of seed.BIOMES || []) {
      const b = await biomeDoc(root, biome, false);
      const comps = biomeComponents(b.doc, false);
      biomeProfiles["minecraft:" + biome] = {
        bindings: frameworkBindingView(comps),
      };
    }
    const framework = {
      format: "renderdragon-framework",
      version: FRAMEWORK_VERSION,
      name: await readPackName(root),
      target: "netease-bedrock-renderdragon",
      precedence: ["global", "dimension", "biome"],
      modules: [
        "lighting",
        "fog",
        "atmosphere",
        "water",
        "color_grading",
        "shadows",
        "local_lights",
        "pbr",
        "materials",
        "bindings",
      ],
      paths: {
        global: "renderdragon_framework/environment/global.json",
        dimensions: "renderdragon_framework/environment/dimensions",
        biomes: "renderdragon_framework/environment/biomes/index.json",
        materials: "renderdragon_framework/materials/schema.json",
      },
      generated_files: {
        lighting: CATEGORY_INFO.lighting.folder,
        fog: CATEGORY_INFO.fog.folder,
        atmosphere: CATEGORY_INFO.atmosphere.folder,
        water: CATEGORY_INFO.water.folder,
        color_grading: CATEGORY_INFO.color_grading.folder,
        shadows: CATEGORY_INFO.shadows.folder,
        local_lights: CATEGORY_INFO.local_lights.folder,
        pbr: CATEGORY_INFO.pbr.folder,
        biomes: "biomes",
        textures: "textures",
      },
    };
    await writeJson(root, "renderdragon_framework/framework.json", framework);
    await writeJson(root, "renderdragon_framework/environment/global.json", {
      format: "renderdragon-environment-profile",
      version: FRAMEWORK_VERSION,
      id: "global",
      identifiers,
      categories: globalCategories,
    });
    for (const dimension of ["overworld", "nether", "end"]) {
      await writeJson(
        root,
        "renderdragon_framework/environment/dimensions/" + dimension + ".json",
        {
          format: "renderdragon-dimension-profile",
          version: FRAMEWORK_VERSION,
          id: dimension,
          extends: "global",
          overrides: {},
        },
      );
    }
    await writeJson(
      root,
      "renderdragon_framework/environment/biomes/index.json",
      {
        format: "renderdragon-biome-bindings",
        version: FRAMEWORK_VERSION,
        inheritance: ["global", "dimension", "biome"],
        biomes: biomeProfiles,
      },
    );
    await writeJson(root, "renderdragon_framework/materials/schema.json", {
      format: "renderdragon-material-schema",
      version: FRAMEWORK_VERSION,
      channels: {
        color: {
          label: "基础色",
          storage: "texture",
        },
        metalness: {
          label: "金属度",
          storage: "MER.R",
        },
        emissive: {
          label: "自发光强度",
          storage: "MER.G",
        },
        roughness: {
          label: "粗糙度",
          storage: "MER.B",
        },
        subsurface: {
          label: "次表面散射",
          storage: "MERS.A",
        },
        height: {
          label: "高度",
          storage: "heightmap",
        },
        normal: {
          label: "法线",
          storage: "normal",
        },
      },
      texture_set: "minecraft:texture_set",
      texture_roots: {
        ui: "textures/ui",
        entity: "textures/entity",
        item: "textures/items",
        block: "textures/blocks",
        other: "textures",
      },
    });
  }
  async function decompressTemplate() {
    const b64 = global.RenderDragonTemplateGzipBase64 || "";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (!global.DecompressionStream)
      throw new Error(
        "当前浏览器缺少 DecompressionStream  请使用新版 Edge 或 Chrome",
      );
    const ds = new DecompressionStream("gzip");
    return new Uint8Array(
      await new Response(
        new Blob([bytes]).stream().pipeThrough(ds),
      ).arrayBuffer(),
    );
  }
  function tarEntries(bytes) {
    const out = [];
    let off = 0;
    const str = (a, b) => td.decode(bytes.slice(a, b)).replace(/\0.*$/, "");
    while (off + 512 <= bytes.length) {
      const name = str(off, off + 100);
      if (!name) break;
      const prefix = str(off + 345, off + 500);
      const full = (prefix ? prefix + "/" : "") + name;
      const size = parseInt(str(off + 124, off + 136).trim() || "0", 8) || 0;
      const type = String.fromCharCode(bytes[off + 156] || 48);
      const start = off + 512;
      if (type === "0" || type === "\0")
        out.push({
          path: full,
          data: bytes.slice(start, start + size),
        });
      off = start + Math.ceil(size / 512) * 512;
    }
    return out;
  }
  async function createSubdir(parent, name) {
    const base = safeName(name, "渲染龙光影");
    let n = base,
      i = 2;
    while (true) {
      try {
        await parent.getDirectoryHandle(n, {
          create: false,
        });
        n = base + "_" + i++;
      } catch (e) {
        return parent.getDirectoryHandle(n, {
          create: true,
        });
      }
    }
  }
  async function buildRenderDragonPack(name, onProgress, opts = {}) {
    let pack,
      display,
      fallback = false;
    if (typeof global.showDirectoryPicker === "function") {
      const parent = await global.showDirectoryPicker({
        mode: "readwrite",
      });
      if (!(await perm(parent, "readwrite")))
        return {
          ok: false,
          reason: "没有目标文件夹写入权限",
        };
      pack = await createSubdir(parent, name);
      display = pack.name;
    } else {
      display = safeName(name, "渲染龙光影");
      pack = new MemoryDirectoryHandle(display);
      fallback = true;
    }
    const model = createFrameworkModel(display);
    onProgress &&
      onProgress(0, 1, "准备 RenderDragon Framework V1 与内置 PBR 材质基线");
    const entries = tarEntries(await decompressTemplate());
    let done = 0;
    const total = entries.length + 220;
    const concurrency = 8;
    let cursor = 0;
    async function worker() {
      while (true) {
        const i = cursor++;
        if (i >= entries.length) break;
        const e = entries[i];
        await writeBytes(pack, e.path, e.data);
        done++;
        if (done % 25 === 0)
          onProgress &&
            onProgress(
              done,
              total,
              "写入内置材质 " + done + " / " + entries.length,
            );
      }
    }
    await Promise.all(
      Array.from(
        {
          length: concurrency,
        },
        worker,
      ),
    );
    const manifest = {
      format_version: 2,
      header: {
        name: display,
        description: "RenderDragon Framework V1 PBR 光影资源包",
        uuid: uuid(),
        version: [1, 0, 0],
        min_engine_version: [1, 21, 120],
      },
      modules: [
        {
          type: "resources",
          uuid: uuid(),
          version: [1, 0, 0],
        },
      ],
      capabilities: ["pbr"],
    };
    await writeJson(pack, "manifest.json", manifest);
    await writeText(
      pack,
      "texts/languages.json",
      JSON.stringify(["zh_CN", "en_US"], null, 2) + "\n",
    );
    await writeText(
      pack,
      "texts/zh_CN.lang",
      "pack.name=" +
        display +
        "\npack.description=RenderDragon Framework V1 PBR 光影资源包\n",
    );
    await writeText(
      pack,
      "texts/en_US.lang",
      "pack.name=" +
        display +
        "\npack.description=RenderDragon Framework V1 PBR resource pack\n",
    );
    for (const [cat, doc] of Object.entries(model.categories)) {
      const info = CATEGORY_INFO[cat];
      await writeJson(pack, info.folder + "/" + info.default_file, clone(doc));
      done++;
    }
    for (const row of model.fogs) {
      await writeJson(pack, row.file, clone(row.doc));
      done++;
      if (done % 20 === 0)
        onProgress && onProgress(done, total, "写入雾参数基线");
    }
    for (const row of model.biomes) {
      await writeJson(pack, row.file, clone(row.doc));
      done++;
      if (done % 20 === 0)
        onProgress && onProgress(done, total, "写入群系绑定");
    }
    const ids = {};
    for (const cat of ["lighting", "atmosphere", "water", "color_grading"]) {
      const r = await resolveCategory(pack, cat, null, false);
      ids[cat] = r.identifier;
    }
    for (const b of seed.BIOMES || []) {
      for (const [cat, id] of Object.entries(ids))
        if (id) await bindCategory(pack, b, cat, id);
    }
    onProgress && onProgress(done, total, "生成 Framework V1 标准层");
    await syncFrameworkV1(pack, model);
    done += 8;
    currentHandle = pack;
    currentPackName = display;
    currentBiome = "cherry_grove";
    originalSettings = await captureSettings(pack);
    onProgress && onProgress(total, total, "完成");
    if (fallback && !opts.deferExport)
      await downloadZipHandle(pack, display, true);
    const reason = fallback
      ? "已创建 RenderDragon Framework V1 资源包并自动下载 ZIP"
      : "已创建 RenderDragon Framework V1 资源包";
    return snapshot(pack, currentBiome, reason);
  }
  async function copyTree(src, dst, onProgress) {
    const rows = await walk(src, "", {
      filter: () => true,
    });
    let i = 0;
    for (const r of rows) {
      const f = await r.handle.getFile();
      await writeBytes(dst, r.rel, new Uint8Array(await f.arrayBuffer()));
      i++;
      onProgress && onProgress(i, rows.length, r.rel);
    }
    return i;
  }
  async function editorCall(op, data = {}) {
    try {
      if (op === "state")
        return currentHandle
          ? snapshot(currentHandle, data.biome || currentBiome)
          : {
              ok: true,
              open: false,
              reason: "",
              biomes: clone(seed.BIOMES || []),
              recipes: recipeList(),
              reference_presets: clone(seed.REFERENCE_PRESETS || []),
              biome_meta: clone(seed.BIOME_META || {}),
            };
      if (op === "open") {
        const h = data.handle || (await pickDirectory("readwrite"));
        return openPack(h, data.biome || currentBiome);
      }
      if (op === "create")
        return buildRenderDragonPack(
          data.name || "渲染龙光影",
          data.onProgress,
        );
      if (!currentHandle)
        return {
          ok: false,
          reason: "先打开或创建资源包",
        };
      if (data.biome)
        currentBiome = String(data.biome).replace("minecraft:", "");
      if (op === "ensure") {
        const out = await ensureCategory(
          currentHandle,
          data.category,
          currentBiome,
        );
        if (out.ok) await syncFrameworkV1(currentHandle);
        return out;
      }
      if (op === "writeback") {
        const out = await writebackPayload(
          currentHandle,
          currentBiome,
          data.payload,
        );
        if (out.ok) {
          await syncFrameworkV1(currentHandle);
          await persistIfMemory(currentHandle, currentPackName);
        }
        return out;
      }
      if (op === "restore") {
        const r = await restoreSettings(currentHandle);
        if (!r.ok) return r;
        await syncFrameworkV1(currentHandle);
        await persistIfMemory(currentHandle, currentPackName);
        return snapshot(currentHandle, currentBiome, r.reason);
      }
      if (op === "preview_builtin" && data.preset === "cool_cyan") {
        const b = defaultDocument(currentPackName, "color_grading")[
          "minecraft:color_grading_settings"
        ];
        return {
          ok: true,
          reason: "冷青预设已载入当前参数，尚未保存到资源包",
          payload: {
            categories: {
              color_grading: b,
            },
          },
        };
      }
      if (op === "recipe_save") {
        const rows = recipeSave(data.name, data.payload, data.description);
        return {
          ok: true,
          reason: "已保存参数配方",
          recipes: rows,
        };
      }
      if (op === "recipe_read") {
        const r = recipeList().find(
          (x) => x.id === data.id || x.id === data.folder,
        );
        return r
          ? {
              ok: true,
              payload: clone(r.payload),
            }
          : {
              ok: false,
              reason: "配方不存在",
            };
      }
      if (op === "recipe_delete")
        return {
          ok: true,
          reason: "已删除",
          recipes: recipeDelete(data.id || data.folder),
        };
      if (op === "site_delta_export")
        return {
          ok: true,
          delta: await siteDeltaExport(
            currentHandle,
            data.all ? null : currentBiome,
          ),
        };
      if (op === "site_delta_import") {
        const out = await siteDeltaImport(currentHandle, data.delta);
        if (out.ok) {
          await syncFrameworkV1(currentHandle);
          await persistIfMemory(currentHandle, currentPackName);
        }
        return out;
      }
      return {
        ok: false,
        reason: "未知操作 " + op,
      };
    } catch (e) {
      console.error(e);
      return {
        ok: false,
        reason: e && e.message ? e.message : String(e),
      };
    }
  }
  const Core = {
    decompressTemplate,
    tarEntries,
    siteDeltaImport,
    siteDeltaExport,
    CATEGORY_INFO,
    TIME_SLOTS,
    FRAMEWORK_VERSION,
    clone,
    safeName,
    safeNs,
    uuid,
    parseJsonRelaxed,
    prettyJson,
    getPath,
    setPath,
    perm,
    getDir,
    getFileHandle,
    exists,
    readBytes,
    readText,
    readJson,
    writeBytes,
    writeText,
    writeJson,
    removePath,
    listDir,
    walk,
    defaultDocument,
    rootBody,
    identFromDoc,
    biomeDoc,
    biomeComponents,
    scanCategory,
    boundIdentifier,
    resolveCategory,
    readPackName,
    inferPipeline,
    snapshot,
    openPack,
    buildRenderDragonPack,
    createFrameworkModel,
    syncFrameworkV1,
    editorCall,
    copyTree,
    MemoryDirectoryHandle,
    MemoryFileHandle,
    isMemoryHandle,
    pickDirectory,
    pickFile,
    buildZipBlobFromHandle,
    downloadZipHandle,
    makeOutputDir,
    persistIfMemory,
    get currentHandle() {
      return currentHandle;
    },
    set currentHandle(v) {
      currentHandle = v;
    },
    get currentPackName() {
      return currentPackName;
    },
    set currentPackName(v) {
      currentPackName = v;
    },
    get currentBiome() {
      return currentBiome;
    },
    set currentBiome(v) {
      currentBiome = v;
    },
    sourceHandles,
  };
  global.RenderDragonCore = Core;
  global.RenderDragonBridge = global.RenderDragonBridge || {};
  global.RenderDragonBridge.editorCall = editorCall;
})(window);
