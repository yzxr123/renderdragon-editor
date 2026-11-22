(function (global) {
  "use strict";

  // 内置素材只读  工作区采用写时复制  下载时重新构建最小文件集
  const core = global.RenderDragonCore;
  const registry = global.RenderDragonPBRRegistry;
  const CATEGORY_INFO = core.CATEGORY_INFO;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8", {
    fatal: true,
  });
  const BINDING_KEYS = Object.values(CATEGORY_INFO)
    .map((x) => x.identifier_component)
    .filter(Boolean)
    .concat("minecraft:water_appearance");
  const INTERNAL =
    /^(?:renderdragon_framework\/|renderdragon_pbr_editor\.json$|textures\/_renderdragon_material_effects\.json$)/;
  const IMAGE_EXT = /\.(?:png|tga|jpg|jpeg)$/i;
  let catalogPromise = null;
  let current = null;
  let queue = Promise.resolve();
  let projectSerial = 0;
  const legacyCall = core.editorCall;
  function equal(a, b) {
    if (a === b) return true;
    if (
      a == null ||
      b == null ||
      typeof a !== "object" ||
      typeof b !== "object"
    )
      return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const ak = Object.keys(a).sort(),
      bk = Object.keys(b).sort();
    return (
      ak.length === bk.length &&
      ak.every((k, i) => k === bk[i] && equal(a[k], b[k]))
    );
  }
  function sameBytes(a, b) {
    return !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);
  }
  function pathName(path) {
    const value = String(path || "").replace(/\\/g, "/");
    if (
      !value ||
      value.startsWith("/") ||
      /[\x00-\x1f]/.test(value) ||
      value.split("/").some((x) => !x || x === "." || x === "..")
    )
      throw new Error("无效资源路径 " + value);
    return value;
  }
  function segment(name) {
    name = String(name);
    if (!name || /[\\/\x00-\x1f]/.test(name) || name === "." || name === "..")
      throw new Error("无效文件名 " + name);
    return name;
  }
  function join(dir, name) {
    return dir ? dir + "/" + segment(name) : segment(name);
  }
  function notFound() {
    return new DOMException("文件不存在", "NotFoundError");
  }
  function isObject(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }
  function notify(type, detail) {
    global.dispatchEvent(
      new CustomEvent(type, {
        detail,
      }),
    );
  }
  function serial(task) {
    const run = queue.then(task);
    queue = run.catch(() => {});
    return run;
  }
  async function guard(task) {
    try {
      return await task();
    } catch (error) {
      if (error.name === "AbortError")
        return {
          ok: false,
          cancelled: true,
          reason: "已取消",
        };
      console.error(error);
      return {
        ok: false,
        reason: error.message || String(error),
      };
    }
  }
  async function bytesOf(value) {
    if (value instanceof Blob) return new Uint8Array(await value.arrayBuffer());
    if (value instanceof Uint8Array) return new Uint8Array(value);
    if (value instanceof ArrayBuffer) return new Uint8Array(value.slice(0));
    if (ArrayBuffer.isView(value))
      return new Uint8Array(
        value.buffer.slice(
          value.byteOffset,
          value.byteOffset + value.byteLength,
        ),
      );
    return encoder.encode(String(value == null ? "" : value));
  }
  class WorkspaceFile {
    constructor(store, path) {
      this.kind = "file";
      this.name = path.split("/").pop();
      this.store = store;
      this.path = path;
      this.__rdMemory = true;
    }
    async getFile() {
      return new File([await this.store.read(this.path)], this.name);
    }
    async createWritable() {
      const store = this.store,
        path = this.path;
      let bytes = null,
        done = false;
      return {
        async write(value) {
          if (done) throw new Error("文件写入已经结束");
          bytes = await bytesOf(value);
        },
        async close() {
          if (done) return;
          done = true;
          if (bytes !== null) await store.write(path, bytes);
        },
        async abort() {
          done = true;
          bytes = null;
        },
      };
    }
    async queryPermission() {
      return "granted";
    }
    async requestPermission() {
      return "granted";
    }
  }
  class WorkspaceDirectory {
    constructor(store, path = "") {
      this.kind = "directory";
      this.name = path ? path.split("/").pop() : store.name;
      this.store = store;
      this.path = path;
      this.__rdMemory = true;
      this.__rdWorkspace = true;
    }
    async getFileHandle(name, options = {}) {
      const path = join(this.path, name);
      if (this.store.directories.has(path))
        throw new DOMException("路径是文件夹", "TypeMismatchError");
      if (!options.create && !this.store.has(path)) throw notFound();
      return new WorkspaceFile(this.store, path);
    }
    async getDirectoryHandle(name, options = {}) {
      const path = join(this.path, name);
      if (this.store.has(path))
        throw new DOMException("路径是文件", "TypeMismatchError");
      if (!this.store.directories.has(path)) {
        if (!options.create) throw notFound();
        this.store.indexDir(path);
      }
      return new WorkspaceDirectory(this.store, path);
    }
    async removeEntry(name, options = {}) {
      const path = join(this.path, name);
      if (this.store.has(path)) return this.store.remove(path);
      const children = this.store
        .paths()
        .filter((x) => x.startsWith(path + "/"));
      if (!children.length && !this.store.directories.has(path))
        throw notFound();
      if (children.length && !options.recursive)
        throw new DOMException("文件夹不是空的", "InvalidModificationError");
      for (const child of children) this.store.remove(child);
    }
    async *entries() {
      for (const [name, kind] of this.store.children.get(this.path) || []) {
        const path = join(this.path, name);
        if (kind === "directory")
          yield [name, new WorkspaceDirectory(this.store, path)];
        else if (this.store.has(path))
          yield [name, new WorkspaceFile(this.store, path)];
      }
    }
    async queryPermission() {
      return "granted";
    }
    async requestPermission() {
      return "granted";
    }
  }
  class WorkspaceStore {
    constructor(name, files, baselineOnly = false) {
      this.name = name;
      this.baseFiles = new Map(files);
      this.overlay = new Map();
      this.deleted = new Set();
      this.baseCache = new Map();
      this.directories = new Set([""]);
      this.children = new Map([["", new Map()]]);
      this.revision = 0;
      this.cacheGeneration = 0;
      this.generatedImages = new Set();
      this.materialOutputs = new Map();
      this.baselineOnly = baselineOnly;
      for (const path of this.baseFiles.keys()) this.indexFile(path);
      this.root = new WorkspaceDirectory(this);
    }
    indexDir(path) {
      if (this.directories.has(path)) return;
      const i = path.lastIndexOf("/"),
        parent = i < 0 ? "" : path.slice(0, i),
        name = path.slice(i + 1);
      this.indexDir(parent);
      this.directories.add(path);
      this.children.set(path, new Map());
      this.children.get(parent).set(name, "directory");
    }
    indexFile(path) {
      pathName(path);
      const i = path.lastIndexOf("/"),
        parent = i < 0 ? "" : path.slice(0, i);
      this.indexDir(parent);
      this.children.get(parent).set(path.slice(i + 1), "file");
    }
    has(path) {
      return (
        !this.deleted.has(path) &&
        (this.overlay.has(path) || this.baseFiles.has(path))
      );
    }
    paths() {
      return [
        ...new Set([...this.baseFiles.keys(), ...this.overlay.keys()]),
      ].filter((x) => !this.deleted.has(x));
    }
    async base(path) {
      if (this.baseCache.has(path)) return this.baseCache.get(path);
      const handle = this.baseFiles.get(path);
      if (!handle) return null;
      const file = await handle.getFile();
      const data = new Uint8Array(await file.arrayBuffer());
      this.baseCache.set(path, data);
      return data;
    }
    async read(path) {
      if (this.deleted.has(path)) throw notFound();
      const bytes = this.overlay.has(path)
        ? this.overlay.get(path)
        : await this.base(path);
      if (bytes === null) throw notFound();
      return bytes;
    }
    changed() {
      this.revision++;
      this.cacheGeneration++;
      if (!this.baselineOnly && current && current.store === this)
        notify("rd-workspace-change", {
          project: current.id,
          revision: this.revision,
          count: this.overlay.size + this.deleted.size,
        });
    }
    async write(path, bytes) {
      pathName(path);
      if (this.baselineOnly) throw new Error("素材基准不可修改");
      const base = await this.base(path);
      let identical = sameBytes(base, bytes);
      // JSON 按数据比较  不把缩进和字段顺序当成用户改动
      if (!identical && base && path.endsWith(".json"))
        identical = equal(
          core.parseJsonRelaxed(decoder.decode(base)),
          core.parseJsonRelaxed(decoder.decode(bytes)),
        );
      if (identical) {
        this.revert(path);
        return;
      }
      if (!this.deleted.has(path) && sameBytes(this.overlay.get(path), bytes))
        return;
      this.indexFile(path);
      this.overlay.set(path, new Uint8Array(bytes));
      this.deleted.delete(path);
      this.changed();
    }
    remove(path) {
      if (!this.has(path)) throw notFound();
      this.overlay.delete(path);
      if (this.baseFiles.has(path)) this.deleted.add(path);
      this.changed();
    }
    revert(path) {
      const a = this.overlay.delete(path),
        b = this.deleted.delete(path);
      if (a || b) this.changed();
    }
  }
  async function prepareCatalog() {
    if (catalogPromise) return catalogPromise;
    catalogPromise = (async () => {
      const root = new core.MemoryDirectoryHandle("RenderDragon_Catalog");
      const entries = core.tarEntries(await core.decompressTemplate());
      // 预置图像是可选素材  不能把预制 Texture Set 注册到用户的资源包
      for (const entry of entries) {
        if (entry.path.endsWith(".texture_set.json")) continue;
        await core.writeBytes(root, pathName(entry.path), entry.data);
      }
      const model = core.createFrameworkModel("renderdragon");
      for (const [cat, doc] of Object.entries(model.categories))
        await core.writeJson(
          root,
          CATEGORY_INFO[cat].folder + "/" + CATEGORY_INFO[cat].default_file,
          cat === "pbr" ? core.defaultDocument("renderdragon", "pbr") : doc,
        );
      for (const row of model.fogs)
        await core.writeJson(root, pathName(row.file), row.doc);
      for (const row of model.biomes) {
        const doc = core.clone(row.doc),
          comps = core.biomeComponents(doc, true);
        for (const cat of [
          "lighting",
          "atmosphere",
          "water",
          "color_grading",
        ]) {
          const info = CATEGORY_INFO[cat],
            id = core.identFromDoc(model.categories[cat], cat);
          comps[info.identifier_component] = {
            [info.identifier_key]: id,
          };
        }
        await core.writeJson(root, pathName(row.file), doc);
      }
      const files = new Map(
        (await core.walk(root)).map((x) => [x.rel, x.handle]),
      );
      return {
        files,
        textureFiles: entries.length,
      };
    })();
    return catalogPromise;
  }
  let preferredTarget = "renderdragon";
  try {
    const stored = localStorage.getItem("rd-texture-target");
    if (["opengl", "renderdragon"].includes(stored)) preferredTarget = stored;
  } catch (e) {}
  function setTarget(value) {
    const target = global.RenderDragonTargets.normalize(value);
    preferredTarget = target;
    if (current) current.target = target;
    try {
      localStorage.setItem("rd-texture-target", target);
    } catch (e) {}
    notify("rd-target-change", {
      target,
    });
    return target;
  }
  function manifest(name, source = null) {
    const doc = {
      format_version: 2,
      header: {
        name,
        description: source
          ? "RenderDragon 修改覆盖包  与原资源包配合使用"
          : "RenderDragon 按改动导出的光影资源包",
        uuid: core.uuid(),
        version: [1, 0, 0],
        min_engine_version: source?.header?.min_engine_version || [1, 21, 120],
      },
      modules: [
        {
          type: "resources",
          uuid: core.uuid(),
          version: [1, 0, 0],
        },
      ],
    };
    if (Array.isArray(source?.capabilities) && source.capabilities.length)
      doc.capabilities = [...new Set(source.capabilities)];
    return doc;
  }
  async function makeSession(name, sourceRoot = null) {
    const catalog = await prepareCatalog(),
      files = new Map(catalog.files),
      sourcePaths = new Set();
    let sourceManifest = null;
    if (sourceRoot) {
      if (!(await core.exists(sourceRoot, "manifest.json")))
        throw new Error("所选文件夹没有 manifest.json");
      sourceManifest = await core.readJson(sourceRoot, "manifest.json");
      if (
        !isObject(sourceManifest.header) ||
        !Array.isArray(sourceManifest.modules)
      )
        throw new Error("manifest.json 不是有效的资源包清单");
      name = String(sourceManifest.header.name || sourceRoot.name);
      const rows = await core.walk(sourceRoot);
      // 只建立句柄索引  不把原包的所有图片读入或复制到磁盘
      for (const row of rows) {
        files.set(pathName(row.rel), row.handle);
        sourcePaths.add(row.rel);
      }
      // 同一个资源名采用原包实际提供的扩展名 不让预置 PNG/TGA 抢占它
      for (const rel of sourcePaths) {
        if (!IMAGE_EXT.test(rel)) continue;
        for (const ext of [".tga", ".png", ".jpg", ".jpeg"]) {
          const sibling = registry.stem(rel) + ext;
          if (sibling !== rel && !sourcePaths.has(sibling))
            files.delete(sibling);
        }
      }
    }
    name = core.safeName(name || "渲染龙光影");
    const outputManifest = manifest(name, sourceManifest);
    if (!sourceRoot)
      files.set(
        "manifest.json",
        new core.MemoryFileHandle(
          "manifest.json",
          null,
          encoder.encode(core.prettyJson(outputManifest)),
        ),
      );
    const store = new WorkspaceStore(name, files),
      baseStore = new WorkspaceStore(name, files, true);
    const session = {
      id: ++projectSerial,
      target: preferredTarget,
      name,
      store,
      baseRoot: baseStore.root,
      sourceRoot,
      sourceManifest,
      sourcePaths,
      outputManifest,
      routes: new Map(),
      generatedParameters: new Set(),
      lastExportRevision: 0,
      lastExportTarget: null,
      textureFiles: catalog.textureFiles,
    };
    current = session;
    core.currentHandle = store.root;
    core.currentPackName = name;
    core.currentBiome = "cherry_grove";
    notify("rd-project-change", {
      project: session.id,
      name,
    });
    return session;
  }
  async function create(name) {
    await makeSession(name);
    return snapshot(core.currentBiome, "素材已准备好  新建不会下载任何文件");
  }
  async function open(handle, biome) {
    if (!handle) handle = await core.pickDirectory("read");
    if (!(await core.perm(handle, "read")))
      throw new Error("没有资源包读取权限");
    await makeSession(handle.name, handle);
    core.currentBiome = normalizeBiome(biome || "cherry_grove");
    return snapshot(
      core.currentBiome,
      "已读取资源包  原文件保持不变  下载时只包含修改和必要依赖",
    );
  }
  function normalizeBiome(biome) {
    biome = String(biome || "cherry_grove").replace(/^minecraft:/, "");
    if (!/^[a-z0-9_.:-]+$/i.test(biome) || biome.includes(".."))
      throw new Error("无效群系标识");
    return biome;
  }
  async function snapshot(biome = core.currentBiome, reason = "") {
    core.currentBiome = normalizeBiome(biome);
    const doc = await core.snapshot(
      current.store.root,
      core.currentBiome,
      reason,
    );
    doc.project_id = current.id;
    doc.pipeline = current.target;
    const graph = await registry.index(current.store.root);
    doc.material_workflow =
      (await registry.pbrActive(current.store.root)) ||
      [...graph.sets.values()].some(
        (x) =>
          x.body[registry.MER] != null ||
          x.body[registry.MERS] != null ||
          x.body.normal != null ||
          x.body.heightmap != null,
      )
        ? "pbr"
        : "plain";
    doc.workspace = {
      mode: current.sourceRoot ? "imported" : "new",
      revision: current.store.revision,
      changed_files: [...current.store.overlay.keys()].filter(
        (x) => !INTERNAL.test(x),
      ).length,
      deleted_files: current.store.deleted.size,
      exported: current.lastExportRevision === current.store.revision,
      texture_files: current.textureFiles,
    };
    doc.meta.root = current.sourceRoot
      ? "修改覆盖工作区  原包未写入"
      : "内置素材工作区";
    const custom = [];
    for (const row of await core.walk(current.store.root, "biomes", {
      filter: (x) => x.endsWith(".json"),
    })) {
      if (!current.sourcePaths.has(row.rel)) continue;
      const bdoc = await core.readJson(current.store.root, row.rel),
        id = bdoc?.["minecraft:client_biome"]?.description?.identifier;
      if (id) custom.push(String(id).replace(/^minecraft:/, ""));
    }
    doc.biomes = [...new Set([...doc.biomes, ...custom])];
    return doc;
  }
  function withoutIdentifier(body) {
    const copy = core.clone(body);
    if (isObject(copy?.description)) {
      delete copy.description.identifier;
      if (!Object.keys(copy.description).length) delete copy.description;
    }
    return copy;
  }
  async function editCategory(biome, cat, body) {
    if (!CATEGORY_INFO[cat] || !isObject(body))
      throw new Error("参数类别必须是 JSON 对象 " + cat);
    const info = CATEGORY_INFO[cat],
      key = (info.identifier_component ? biome : "*") + "|" + cat,
      root = current.store.root;
    let route = current.routes.get(key);
    const active = await core.resolveCategory(root, cat, biome, false);
    if (!route && equal(core.rootBody(active.doc, cat), body)) return;
    if (!route) {
      const original = info.identifier_component
        ? active
        : await core.resolveCategory(current.baseRoot, cat, biome, false);
      const baseBiome = await core.biomeDoc(
        info.identifier_component ? root : current.baseRoot,
        biome,
        false,
      );
      const bound = core.clone(
        core.biomeComponents(baseBiome.doc, false)[info.identifier_component],
      );
      let rel = original.rel;
      if (info.identifier_component) {
        const stem = "rd_" + core.safeNs(biome) + "_" + cat;
        rel = info.folder + "/" + stem + ".json";
        let i = 2;
        while (current.store.has(rel))
          rel = info.folder + "/" + stem + "_" + i++ + ".json";
      }
      route = {
        rel,
        original: core.clone(original.doc),
        originalRel: original.rel,
        bound,
        category: cat,
        biome,
      };
      current.routes.set(key, route);
      if (info.identifier_component) current.generatedParameters.add(rel);
    }
    const originalBody = core.rootBody(route.original, cat);
    const reverted = info.identifier_component
      ? equal(withoutIdentifier(body), withoutIdentifier(originalBody))
      : equal(body, originalBody);
    if (reverted) {
      current.store.revert(route.rel);
      if (info.identifier_component) {
        const b = await core.biomeDoc(root, biome, true),
          comps = core.biomeComponents(b.doc, true);
        if (route.bound === undefined) delete comps[info.identifier_component];
        else comps[info.identifier_component] = core.clone(route.bound);
        await core.writeJson(root, b.rel, b.doc);
      }
      current.routes.delete(key);
      return;
    }
    const doc = Object.keys(route.original || {}).length
      ? core.clone(route.original)
      : core.defaultDocument(current.name, cat);
    doc[info.root] = core.clone(body);
    if (info.identifier_component) {
      let id = route.identifier;
      if (!id) {
        const stem =
          core.safeNs(current.name) + ":" + cat + "_" + core.safeNs(biome);
        id = stem;
        const used = new Set(
          (await core.scanCategory(root, cat))
            .filter((x) => x.file !== route.rel)
            .map((x) => x.identifier),
        );
        let n = 2;
        while (used.has(id)) id = stem + "_" + n++;
        route.identifier = id;
      }
      doc[info.root].description = Object.assign(
        {},
        doc[info.root].description,
        {
          identifier: id,
        },
      );
      await core.writeJson(root, route.rel, doc);
      const b = await core.biomeDoc(root, biome, true),
        comps = core.biomeComponents(b.doc, true);
      comps[info.identifier_component] = {
        [info.identifier_key]: id,
      };
      await core.writeJson(root, b.rel, b.doc);
    } else await core.writeJson(root, route.rel, doc);
  }
  async function stage(payload = {}, biome = core.currentBiome) {
    biome = normalizeBiome(biome);
    if (
      !isObject(payload) ||
      (payload.categories && !isObject(payload.categories))
    )
      throw new Error("修改内容格式错误");
    const root = current.store.root;
    if (payload.binding?.components) {
      if (!isObject(payload.binding.components))
        throw new Error("群系绑定必须是 JSON 对象");
      const b = await core.biomeDoc(root, biome, true),
        comps = core.biomeComponents(b.doc, true);
      for (const key of BINDING_KEYS) {
        if (Object.hasOwn(payload.binding.components, key))
          comps[key] = core.clone(payload.binding.components[key]);
        else delete comps[key];
      }
      await core.writeJson(root, b.rel, b.doc);
    }
    for (const [cat, body] of Object.entries(payload.categories || {}))
      await editCategory(biome, cat, body);
    await collectDetachedParameters();
    return snapshot(biome, "修改已暂存  尚未下载  原文件未改动");
  }
  async function transaction(task) {
    if (!current) return task();
    const owner = current,
      store = owner.store,
      overlay = new Map(store.overlay),
      deleted = new Set(store.deleted),
      routes = new Map(owner.routes),
      generated = new Set(owner.generatedParameters),
      rev = store.revision,
      images = new Set(store.generatedImages),
      outputs = new Map(
        [...store.materialOutputs].map(([key, values]) => [
          key,
          new Set(values),
        ]),
      );
    const directories = new Set(store.directories),
      children = new Map(
        [...store.children].map(([key, value]) => [key, new Map(value)]),
      );
    try {
      const out = await task();
      if (out && out.ok === false && !out.empty && !out.cancelled)
        throw new Error(out.reason || "操作失败");
      return out;
    } catch (error) {
      if (current === owner) {
        store.overlay = overlay;
        store.deleted = deleted;
        store.directories = directories;
        store.children = children;
        owner.routes = routes;
        owner.generatedParameters = generated;
        store.revision = rev;
        store.cacheGeneration++;
        store.generatedImages = images;
        store.materialOutputs = outputs;
        notify("rd-workspace-change", {
          project: owner.id,
          revision: rev,
        });
      }
      throw error;
    }
  }
  async function collectDetachedParameters() {
    if (!current.generatedParameters.size) return;
    const ids = new Set();
    for (const row of await core.walk(current.store.root, "biomes", {
      filter: (x) => x.endsWith(".json"),
    })) {
      const comps = core.biomeComponents(
        await core.readJson(current.store.root, row.rel),
        false,
      );
      for (const info of Object.values(CATEGORY_INFO)) {
        if (!info.identifier_component) continue;
        const v = comps[info.identifier_component],
          id = typeof v === "string" ? v : v?.[info.identifier_key];
        if (id) ids.add(id);
      }
    }
    for (const path of current.generatedParameters) {
      if (!current.store.has(path)) continue;
      const cat = Object.keys(CATEGORY_INFO).find((x) =>
        path.startsWith(CATEGORY_INFO[x].folder + "/"),
      );
      if (!cat) continue;
      const id = core.identFromDoc(
        await core.readJson(current.store.root, path),
        cat,
      );
      if (ids.has(id)) continue;
      current.store.revert(path);
      for (const [key, route] of current.routes)
        if (route.rel === path) current.routes.delete(key);
    }
  }
  async function resetParameters(category = null, biome = core.currentBiome) {
    const dirs = new Set(
      Object.values(CATEGORY_INFO)
        .map((x) => x.folder)
        .concat("biomes"),
    );
    if (category) {
      if (category === "binding") {
        const b = await core.biomeDoc(current.store.root, biome, false);
        current.store.revert(b.rel);
      } else {
        const route = current.routes.get(
          (CATEGORY_INFO[category]?.identifier_component ? biome : "*") +
            "|" +
            category,
        );
        if (route)
          await editCategory(
            biome,
            category,
            core.rootBody(route.original, category),
          );
        else {
          const base = await core.resolveCategory(
            current.baseRoot,
            category,
            biome,
            false,
          );
          current.store.revert(base.rel);
        }
      }
    } else {
      for (const path of [
        ...current.store.overlay.keys(),
        ...current.store.deleted,
      ])
        if (dirs.has(path.split("/")[0])) current.store.revert(path);
      current.routes.clear();
    }
    await collectDetachedParameters();
    return snapshot(
      biome,
      category
        ? "当前参数已恢复  不再导出已撤销的文件"
        : "参数已恢复  纹理修改保持不变",
    );
  }
  async function resetTexture(rel) {
    rel = registry.path(rel);
    const root = current.store.root,
      owner = registry.setPath(rel);
    current.store.revert(rel);
    current.store.revert(owner);
    global.RenderDragonMaterial.clearOPOverride(root, owner);
    // 只清理由这个材质生成且已经失去引用的文件 不回退其他材质共享的数据
    await registry.cleanup(root, rel);
    return {
      ok: true,
      reason: "当前纹理已恢复到打开时状态",
      rel,
    };
  }
  async function imageRef(root, owner, ref) {
    return registry.resolve(root, owner, ref, true);
  }
  async function compile(options = {}, session = current) {
    const target = global.RenderDragonTargets.normalize(
      options.target || session.target,
    );
    const materialRel = options.materialRel
      ? registry.path(options.materialRel)
      : null;
    const scoped = !!materialRel;
    const conversionCache = new Map();
    const root = session.store.root,
      files = new Map(),
      reasons = new Map(),
      virtual = new Map();
    const changed = scoped
      ? []
      : [...session.store.overlay.keys()].filter((x) => !INTERNAL.test(x));
    const graph = await registry.index(root);
    const textureSets = new Map(
        [...graph.sets].map(([rel, set]) => [rel, set.doc]),
      ),
      reverse = graph.reverse,
      normalizedImages = new Set();
    async function add(path, reason = "修改") {
      if (files.has(path) || INTERNAL.test(path)) return;
      if (!virtual.has(path) && !(await core.exists(root, path)))
        throw new Error("导出依赖文件不存在 " + path);
      let bytes = virtual.get(path) || (await core.readBytes(root, path));
      if (path.endsWith(".texture_set.json") && target === "renderdragon") {
        const original =
          textureSets.get(path) || core.parseJsonRelaxed(decoder.decode(bytes));
        const out = await global.RenderDragonMaterial.exportMERS(
          root,
          path,
          original,
          virtual,
          conversionCache,
        );
        bytes = encoder.encode(core.prettyJson(out.doc));
        textureSets.set(path, out.doc);
        if (out.replaced) normalizedImages.add(out.replaced);
      }
      if (
        path.startsWith("biomes/") &&
        path.endsWith(".json") &&
        !session.sourcePaths.has(path)
      ) {
        const doc = core.parseJsonRelaxed(decoder.decode(bytes));
        const base = session.store.baseFiles.has(path)
          ? await core.readJson(session.baseRoot, path)
          : {};
        const comps = core.biomeComponents(doc, false),
          baseComps = core.biomeComponents(base, false),
          small = {};
        for (const [key, value] of Object.entries(comps))
          if (!equal(value, baseComps[key])) small[key] = value;
        if (!Object.keys(small).length && reason === "修改") return;
        const minimal = core.clone(doc);
        minimal["minecraft:client_biome"].components = small;
        bytes = encoder.encode(core.prettyJson(minimal));
      }
      files.set(path, bytes);
      reasons.set(path, reason);
      if (path.endsWith(".texture_set.json")) {
        const doc =
            textureSets.get(path) ||
            core.parseJsonRelaxed(decoder.decode(bytes)),
          body = doc["minecraft:texture_set"];
        registry.validate(doc, path);
        if (body.normal != null && body.heightmap != null)
          throw new Error("法线和高度层不能同时存在 " + path);
        if (
          body.metalness_emissive_roughness != null &&
          body.metalness_emissive_roughness_subsurface != null
        )
          throw new Error("MER 和 MERS 不能同时存在 " + path);
        for (const key of [
          "color",
          "metalness_emissive_roughness",
          "metalness_emissive_roughness_subsurface",
          "normal",
          "heightmap",
        ]) {
          const dep =
            registry.candidates(path, body[key]).find((x) => virtual.has(x)) ||
            (await imageRef(root, path, body[key]));
          if (dep) await add(dep, "贴图依赖");
        }
      }
      if (path.startsWith("water/") && path.endsWith(".json")) {
        const body = core.parseJsonRelaxed(decoder.decode(bytes))[
          "minecraft:water_settings"
        ];
        const ref = body?.caustics?.texture;
        if (typeof ref === "string" && ref.trim()) {
          const dep = await registry.resolve(
            root,
            "textures/caustics.json",
            ref,
            true,
          );
          if (dep) await add(dep, "自定义焦散依赖");
        }
      }
      if (path.startsWith("biomes/") && path.endsWith(".json")) {
        const body = core.biomeComponents(
          core.parseJsonRelaxed(decoder.decode(bytes)),
          false,
        );
        for (const [cat, info] of Object.entries(CATEGORY_INFO)) {
          if (!info.identifier_component) continue;
          const v = body[info.identifier_component],
            id = typeof v === "string" ? v : v?.[info.identifier_key];
          if (!id) continue;
          const row = (await core.scanCategory(root, cat)).find(
            (x) => x.identifier === id,
          );
          if (!row) {
            if (!id.startsWith("minecraft:"))
              throw new Error("群系绑定缺少参数文件 " + id);
            continue;
          }
          if (
            id.startsWith("minecraft:") &&
            !session.sourcePaths.has(row.file) &&
            !session.store.overlay.has(row.file)
          )
            continue;
          await add(row.file, "群系参数依赖");
        }
      }
    }
    // 当前材质另存与全部修改包共用引用解析  但入口根节点必须隔离
    if (scoped) {
      const owner = registry.setPath(materialRel);
      if (await core.exists(root, owner)) await add(owner, "当前材质定义");
      else if ((await registry.materialMode(root, materialRel)) === "mers") {
        const defaults = await registry.fallback(root, materialRel);
        const doc = {
          format_version: "1.21.30",
          "minecraft:texture_set": {
            color: registry.reference(owner, materialRel),
            [registry.MERS]: defaults.value,
          },
        };
        virtual.set(owner, encoder.encode(core.prettyJson(doc)));
        textureSets.set(owner, doc);
        await add(owner, "当前材质默认参数");
      } else await add(materialRel, "当前基色");
    }
    for (const path of changed.sort()) {
      if (
        path === "manifest.json" ||
        path === "textures/textures_list.json" ||
        path === "textures/flipbook_textures.json" ||
        path === "textures/terrain_texture.json" ||
        path === "textures/item_texture.json" ||
        session.generatedParameters.has(path)
      )
        continue;
      if (session.store.generatedImages.has(path) && !reverse.has(path))
        continue;
      await add(path);
      if (IMAGE_EXT.test(path))
        for (const owner of reverse.get(path) || [])
          await add(owner, "材质定义依赖");
    }
    if (target === "opengl")
      for (const owner of global.RenderDragonMaterial.opOverrides(
        root,
      ).keys()) {
        if (!(await core.exists(root, owner))) {
          const rel = owner.slice(0, -registry.SET_SUFFIX.length) + ".png";
          const doc = {
            format_version: "1.21.30",
            "minecraft:texture_set": {
              color: registry.reference(owner, rel),
            },
          };
          virtual.set(owner, encoder.encode(core.prettyJson(doc)));
          textureSets.set(owner, doc);
        }
        await add(owner, "OP 原色烘焙选项");
      }
    // 图集只导出本次涉及的条目  不把来源包的整张索引和无关图片拉进来
    for (const atlasPath of [
      "textures/terrain_texture.json",
      "textures/item_texture.json",
    ]) {
      if (!(await core.exists(root, atlasPath))) continue;
      const atlas = await core.readJson(root, atlasPath),
        baseAtlas = await core.readJson(session.baseRoot, atlasPath, {}),
        selected = {};
      const slots = new Set([
        ...(materialRel ? [registry.stem(materialRel)] : []),
        ...[...files.keys()]
          .map((p) =>
            p.endsWith(registry.SET_SUFFIX)
              ? p.slice(0, -registry.SET_SUFFIX.length)
              : IMAGE_EXT.test(p)
                ? registry.stem(p)
                : "",
          )
          .filter(Boolean),
      ]);
      function refs(value) {
        if (typeof value === "string") return [value];
        if (Array.isArray(value)) return value.flatMap(refs);
        if (value && typeof value === "object")
          return [...refs(value.path), ...refs(value.variations)];
        return [];
      }
      for (const [key, entry] of Object.entries(atlas.texture_data || {})) {
        const textureRefs = refs(entry.textures);
        const related = textureRefs.some((ref) =>
          registry
            .candidates(atlasPath, ref)
            .some((p) => slots.has(registry.stem(p))),
        );
        const edited =
          !scoped &&
          changed.includes(atlasPath) &&
          !equal(entry, baseAtlas.texture_data?.[key]);
        if (!related && !edited) continue;
        selected[key] = core.clone(entry);
        for (const ref of textureRefs) {
          const dep = await registry.resolve(root, atlasPath, ref, true);
          if (!dep) continue;
          const owner = registry.setPath(dep);
          if (textureSets.has(owner)) await add(owner, "图集材质依赖");
          else await add(dep, "图集图像依赖");
        }
      }
      if (Object.keys(selected).length) {
        files.set(
          atlasPath,
          encoder.encode(
            core.prettyJson({
              ...atlas,
              texture_data: selected,
            }),
          ),
        );
        reasons.set(atlasPath, "当前使用的图集条目");
      }
    }
    // 只带上本次图片使用的动画条目  保留原来的帧间隔和其他字段
    const animationChanged = changed.includes(
      "textures/flipbook_textures.json",
    );
    const baselineAnimations = animationChanged
      ? await core.readJson(
          session.baseRoot,
          "textures/flipbook_textures.json",
          [],
        )
      : [];
    const animationKey = (x) => x.atlas_tile || x.flipbook_texture,
      animations = [];
    for (const entry of graph.flipbook) {
      const options = registry.candidates(
        "textures/flipbook_textures.json",
        entry.flipbook_texture,
      );
      const direct =
        animationChanged &&
        !equal(
          entry,
          baselineAnimations.find(
            (x) => animationKey(x) === animationKey(entry),
          ),
        );
      if (!direct && !options.some((x) => files.has(x))) continue;
      animations.push(core.clone(entry));
      const dep = await registry.resolve(
        root,
        "textures/flipbook_textures.json",
        entry.flipbook_texture,
        true,
      );
      if (dep) {
        await add(dep, "动画图像依赖");
        for (const owner of reverse.get(dep) || [])
          await add(owner, "动画材质定义");
      }
    }
    if (animations.length) {
      files.set(
        "textures/flipbook_textures.json",
        encoder.encode(core.prettyJson(animations)),
      );
      reasons.set("textures/flipbook_textures.json", "动画注册依赖");
    }
    // MER 在输出侧规范化后  旧辅助图不能继续作为无用残留打进包
    const exportedImageRefs = new Set();
    for (const [owner, bytes] of files) {
      if (!owner.endsWith(".texture_set.json")) continue;
      const body = core.parseJsonRelaxed(decoder.decode(bytes))[
        "minecraft:texture_set"
      ];
      for (const key of registry.LAYERS)
        for (const candidate of registry.candidates(owner, body[key]))
          if (files.has(candidate)) exportedImageRefs.add(candidate);
    }
    for (const path of [...files.keys()])
      if (
        (session.store.generatedImages.has(path) ||
          normalizedImages.has(path)) &&
        !exportedImageRefs.has(path) &&
        !graph.roles.get(path)?.has("color") &&
        !graph.roles.get(path)?.has("caustics")
      ) {
        files.delete(path);
        reasons.delete(path);
      }
    const deleted = [...session.store.deleted].filter(
      (x) =>
        session.sourcePaths.has(x) &&
        !INTERNAL.test(x) &&
        (!scoped || x === materialRel || x === registry.setPath(materialRel)),
    );
    // ZIP 不能表达对原包的删除  不把删除默默伪装成成功
    if (deleted.length)
      throw new Error(
        "修改包无法删除原包文件  请先恢复这些删除项 " + deleted.join("  "),
      );
    if (
      changed.includes("manifest.json") &&
      (await registry.pbrActive(root)) &&
      !files.has("pbr/global.json")
    )
      await add("pbr/global.json", "PBR 默认参数");
    if (!files.size && !changed.includes("manifest.json"))
      return {
        ok: false,
        empty: true,
        reason: "没有需要导出的改动  不会下载空包",
        files,
        reasons,
      };
    // 只列出本次实际存在的图片  不携带原版全量 textures_list
    const images = [...files.keys()]
      .filter((x) => IMAGE_EXT.test(x))
      .map((x) => x.replace(/\.[^/.]+$/, ""))
      .sort();
    if (images.length) {
      files.set(
        "textures/textures_list.json",
        encoder.encode(core.prettyJson([...new Set(images)])),
      );
      reasons.set("textures/textures_list.json", "最小贴图索引");
    }
    const output = core.clone(session.outputManifest),
      inputManifest = await core.readJson(root, "manifest.json", {});
    const usesPBR =
      (!scoped && !!inputManifest.capabilities?.includes("pbr")) ||
      [...files].some(
        ([p, bytes]) =>
          p === "pbr/global.json" ||
          (p.endsWith(".texture_set.json") &&
            (() => {
              const b =
                core.parseJsonRelaxed(decoder.decode(bytes))[
                  "minecraft:texture_set"
                ] || {};
              return (
                b[registry.MERS] != null ||
                b.normal != null ||
                b.heightmap != null
              );
            })()),
      );
    const capabilities = (inputManifest.capabilities || []).filter(
      (x) => x !== "pbr",
    );
    if (usesPBR) capabilities.push("pbr");
    if (capabilities.length) output.capabilities = [...new Set(capabilities)];
    else delete output.capabilities;
    files.set("manifest.json", encoder.encode(core.prettyJson(output)));
    reasons.set("manifest.json", "资源包清单");
    let plan = {
      ok: true,
      files,
      reasons,
      count: files.size,
      bytes: [...files.values()].reduce((n, x) => n + x.length, 0),
      mode: session.sourceRoot ? "overlay" : "standalone",
      target,
    };
    if (target === "opengl")
      plan = await global.RenderDragonMaterial.compileOP(
        plan,
        session,
        root,
        graph,
      );
    return plan;
  }
  async function exportChanges(download = true) {
    const plan = await compile();
    if (!plan.ok) return plan;
    if (!download)
      return {
        ok: true,
        count: plan.count,
        bytes: plan.bytes,
        mode: plan.mode,
        target: plan.target,
        warnings: plan.warnings || [],
        files: [...plan.files].map(([path, data]) => ({
          path,
          bytes: data.length,
          reason: plan.reasons.get(path),
        })),
      };
    const out = new core.MemoryDirectoryHandle(current.name);
    for (const [path, bytes] of plan.files)
      await core.writeBytes(out, path, bytes);
    const filename = await core.downloadZipHandle(
      out,
      current.name +
        (plan.target === "opengl" ? "_OP四合一修改包" : "_渲染龙材质修改包"),
      true,
    );
    current.lastExportRevision = current.store.revision;
    current.lastExportTarget = plan.target;
    notify("rd-workspace-export", {
      project: current.id,
      revision: current.store.revision,
      count: plan.count,
    });
    return {
      ok: true,
      reason: "已下载 " + plan.count + " 个文件  只包含改动和必要依赖",
      filename,
      count: plan.count,
      bytes: plan.bytes,
      mode: plan.mode,
    };
  }
  async function compileMaterial(rel, payload = null) {
    const source = current,
      root = source.store.root;
    rel = registry.path(
      rel ||
        payload?.rel ||
        "textures/" +
          ({
            block: "blocks",
            item: "items",
            entity: "entity",
            particle: "particle",
            ui: "ui",
          }[payload?.kind] || "blocks") +
          "/" +
          core.safeName(payload?.stem || "material", "material") +
          ".png",
    );
    let unpackFIO = false;
    if (!payload) {
      const material = await global.RenderDragonMaterial.readAux(root, rel);
      unpackFIO = !!material.fio;
      if (unpackFIO)
        payload = await global.RenderDragonMaterial.textureDoc(root, {
          rel,
        });
    }
    // 参考图和材质库按画板快照另存  原始 FIO 在隔离目录解包
    // 不写回工作区  不因另存而覆盖同名原图或把所有修改标为已下载
    if (payload) {
      const scratch = new core.MemoryDirectoryHandle(
        "native_material_snapshot",
      );
      await global.RenderDragonMaterial.writePaint(scratch, {
        ...payload,
        rel,
        lock_color: false,
        op_baked_color: null,
        painted: {
          ...payload.painted,
          color: true,
        },
      });
      if (unpackFIO) {
        for (const atlasPath of [
          "textures/terrain_texture.json",
          "textures/item_texture.json",
        ]) {
          const atlas = await core.readJson(root, atlasPath, {}),
            entries = {};
          const refs = (v) =>
            typeof v === "string"
              ? [v]
              : Array.isArray(v)
                ? v.flatMap(refs)
                : v && typeof v === "object"
                  ? [...refs(v.path), ...refs(v.variations)]
                  : [];
          for (const [key, entry] of Object.entries(atlas.texture_data || {})) {
            const names = refs(entry.textures);
            if (
              !names.some((ref) =>
                registry.candidates(atlasPath, ref).includes(rel),
              )
            )
              continue;
            if (
              names.some(
                (ref) => !registry.candidates(atlasPath, ref).includes(rel),
              )
            )
              throw new Error(
                "此 OP 图集条目同时引用多张纹理  请分别整理后再转换渲染龙  " +
                  key,
              );
            entries[key] = core.clone(entry);
            delete entries[key].quad;
          }
          if (Object.keys(entries).length)
            await core.writeJson(scratch, atlasPath, {
              ...atlas,
              texture_data: entries,
            });
        }
      }
      const detached = {
        ...source,
        store: {
          root: scratch,
          baseFiles: new Map(),
          overlay: new Map(),
          generatedImages: new Set(),
          deleted: new Set(),
        },
        sourcePaths: new Set(),
        baseRoot: scratch,
        sourceRoot: null,
        generatedParameters: new Set(),
        target: "renderdragon",
      };
      return compile(
        {
          materialRel: rel,
          target: "renderdragon",
        },
        detached,
      );
    }
    // 显式另存当前材质允许导出未修改原材质  不等于把它记入修改清单
    return compile(
      {
        materialRel: rel,
        target: "renderdragon",
      },
      source,
    );
  }
  async function exportMaterial(rel, name, download = true, payload = null) {
    const plan = await compileMaterial(rel, payload);
    if (!plan.ok) return plan;
    const detail = {
      ok: true,
      count: plan.count,
      bytes: plan.bytes,
      scope: "material",
      target: "renderdragon",
      files: [...plan.files].map(([path, data]) => ({
        path,
        bytes: data.length,
        reason: plan.reasons.get(path),
      })),
    };
    if (!download) return detail;
    const title =
      core.safeName(name || registry.stem(rel).split("/").pop(), "material") +
      "_渲染龙材质文件组";
    const out = new core.MemoryDirectoryHandle(title);
    for (const [path, bytes] of plan.files)
      await core.writeBytes(out, path, bytes);
    detail.filename = await core.downloadZipHandle(out, title, true);
    detail.reason =
      "已导出当前材质文件组  " +
      plan.count +
      " 个文件  不包含无关材质或光影参数修改";
    // 单项另存不能把整个工作区误标成已下载
    return detail;
  }
  async function exportParameterChanges() {
    const plan = await compile();
    if (!plan.ok) return plan;
    const dirs = new Set(
      Object.values(CATEGORY_INFO)
        .map((x) => x.folder)
        .concat("biomes"),
    );
    const entries = [];
    for (const [path, bytes] of plan.files)
      if (dirs.has(path.split("/")[0]) && path.endsWith(".json")) {
        const entry = {
          path,
          document: core.parseJsonRelaxed(decoder.decode(bytes)),
        };
        if (path.startsWith("biomes/") && current.store.baseFiles.has(path)) {
          const original = core.biomeComponents(
              await core.readJson(current.baseRoot, path),
              false,
            ),
            active = core.biomeComponents(
              await core.readJson(current.store.root, path),
              false,
            );
          entry.removed_components = Object.keys(original).filter(
            (key) => !Object.hasOwn(active, key),
          );
        }
        entries.push(entry);
      }
    if (!entries.length)
      return {
        ok: false,
        empty: true,
        reason: "没有需要导出的光影参数  纹理请使用下载修改包",
      };
    return {
      ok: true,
      delta: {
        v: 3,
        format: "renderdragon-parameter-changes",
        name: current.name,
        entries,
      },
      reason: "已整理修改参数及群系引用",
    };
  }
  async function importParameterChanges(delta) {
    if (
      !isObject(delta) ||
      delta.v !== 3 ||
      delta.format !== "renderdragon-parameter-changes" ||
      !Array.isArray(delta.entries)
    )
      throw new Error("不是有效的 v3 参数修改项");
    if (delta.entries.length > 4096) throw new Error("参数修改项过大");
    const root = current.store.root,
      records = [],
      remap = new Map(),
      seen = new Set();
    for (const entry of delta.entries) {
      const path = pathName(entry.path),
        doc = core.clone(entry.document);
      if (seen.has(path)) throw new Error("修改项包含重复文件 " + path);
      seen.add(path);
      if (!isObject(doc) || !path.endsWith(".json"))
        throw new Error("修改项包含无效 JSON " + path);
      if (path.startsWith("biomes/")) {
        const b = doc["minecraft:client_biome"];
        if (
          !isObject(b) ||
          !isObject(b.components) ||
          !b.description?.identifier
        )
          throw new Error("群系修改项结构无效 " + path);
        records.push({
          kind: "biome",
          path,
          doc,
          removed: Array.isArray(entry.removed_components)
            ? entry.removed_components
            : [],
          biome: normalizeBiome(b.description.identifier),
        });
        continue;
      }
      const cat = Object.keys(CATEGORY_INFO).find((x) =>
        path.startsWith(CATEGORY_INFO[x].folder + "/"),
      );
      if (!cat || !isObject(doc[CATEGORY_INFO[cat].root]))
        throw new Error("修改项只允许光影参数 JSON " + path);
      const info = CATEGORY_INFO[cat];
      let dest = path;
      if (info.identifier_component) {
        const originalId = core.identFromDoc(doc, cat);
        if (!originalId) throw new Error("参数缺少标识 " + path);
        const rows = await core.scanCategory(root, cat),
          collision = rows.find((x) => x.identifier === originalId);
        if (collision && !equal(collision.doc, doc)) {
          const stem =
            core.safeNs(current.name) +
            ":import_" +
            cat +
            "_" +
            core.safeNs(
              path
                .split("/")
                .pop()
                .replace(/\.json$/, ""),
            );
          let id = stem,
            n = 2;
          while (
            rows.some((x) => x.identifier === id) ||
            [...remap.values()].includes(id)
          )
            id = stem + "_" + n++;
          doc[info.root].description = Object.assign(
            {},
            doc[info.root].description,
            {
              identifier: id,
            },
          );
          remap.set(originalId, id);
          dest =
            info.folder +
            "/rd_import_" +
            cat +
            "_" +
            core.safeNs(id.split(":").pop()) +
            ".json";
        }
        if (
          current.store.has(dest) &&
          !equal(await core.readJson(root, dest), doc)
        ) {
          const stem = dest.replace(/\.json$/, "");
          let n = 2;
          while (current.store.has(dest)) dest = stem + "_" + n++ + ".json";
        }
      }
      records.push({
        kind: "category",
        path: dest,
        doc,
        cat,
      });
    }
    for (const row of records.filter((x) => x.kind === "category")) {
      await core.writeJson(root, row.path, row.doc);
      if (
        CATEGORY_INFO[row.cat].identifier_component &&
        !current.store.baseFiles.has(row.path)
      )
        current.generatedParameters.add(row.path);
    }
    for (const row of records.filter((x) => x.kind === "biome")) {
      const target = await core.biomeDoc(root, row.biome, true),
        comps = core.biomeComponents(target.doc, true);
      for (const key of row.removed) {
        if (
          typeof key !== "string" ||
          ["__proto__", "constructor", "prototype"].includes(key)
        )
          throw new Error("不允许的群系字段");
        delete comps[key];
      }
      for (const [key, value] of Object.entries(
        core.biomeComponents(row.doc, false),
      )) {
        if (["__proto__", "constructor", "prototype"].includes(key))
          throw new Error("不允许的群系字段");
        const updated = core.clone(value),
          info = Object.values(CATEGORY_INFO).find(
            (x) => x.identifier_component === key,
          );
        if (info) {
          const id =
            typeof updated === "string"
              ? updated
              : updated?.[info.identifier_key];
          if (remap.has(id)) {
            if (typeof updated === "string") {
              comps[key] = remap.get(id);
              continue;
            }
            updated[info.identifier_key] = remap.get(id);
          }
        }
        comps[key] = updated;
      }
      await core.writeJson(root, target.rel, target.doc);
    }
    await collectDetachedParameters();
    return snapshot(core.currentBiome, "参数修改项已暂存  原资源包未写入");
  }
  async function editorCall(op, data = {}) {
    return guard(() =>
      serial(() =>
        transaction(async () => {
          if (op === "bootstrap") {
            if (!current) await makeSession(data.name || "渲染龙光影");
            return snapshot(data.biome);
          }
          if (op === "create") return create(data.name || "渲染龙光影");
          if (op === "open") return open(data.handle, data.biome);
          if (!current)
            return {
              ok: false,
              reason: "编辑素材尚未准备完成",
            };
          if (data.biome) core.currentBiome = normalizeBiome(data.biome);
          if (op === "state") return snapshot(core.currentBiome);
          if (op === "enable_pbr") {
            const root = current.store.root,
              doc = await core.readJson(root, "manifest.json", {});
            doc.capabilities = [
              ...new Set([...(doc.capabilities || []), "pbr"]),
            ];
            await core.writeJson(root, "manifest.json", doc);
            return snapshot(
              core.currentBiome,
              "已启用 PBR 默认参数  不会批量生成材质贴图",
            );
          }
          if (op === "writeback") return stage(data.payload, core.currentBiome);
          if (op === "download_changes") return exportChanges(true);
          if (op === "export_preview") return exportChanges(false);
          if (op === "restore") return resetParameters();
          if (op === "reset_category") return resetParameters(data.category);
          if (op === "ensure")
            return snapshot(
              core.currentBiome,
              "参数已在素材库准备好  实际修改后才进入导出包",
            );
          if (op === "reset_texture") return resetTexture(data.rel);
          if (op === "site_delta_export") return exportParameterChanges();
          if (op === "site_delta_import") {
            if (data.delta?.v === 3) return importParameterChanges(data.delta);
            const out = await core.siteDeltaImport(
              current.store.root,
              data.delta,
            );
            if (!out.ok) return out;
            return snapshot(core.currentBiome, out.reason);
          }
          return legacyCall(op, data);
        }),
      ),
    );
  }
  const workspace = {
    setTarget,
    get target() {
      return current?.target || preferredTarget;
    },
    prepareCatalog,
    create,
    open,
    snapshot,
    stage,
    compile,
    compileMaterial,
    exportMaterial,
    exportChanges,
    resetTexture,
    equal,
    serial,
    transaction,
    guard,
    get session() {
      return current;
    },
    get root() {
      return current?.store.root;
    },
    get revision() {
      return current?.store.revision || 0;
    },
    get hasUnexported() {
      return (
        !!current &&
        (current.lastExportRevision !== current.store.revision ||
          current.lastExportTarget !== current.target) &&
        ([...current.store.overlay.keys(), ...current.store.deleted].some(
          (path) => !INTERNAL.test(path),
        ) ||
          (current.target === "opengl" &&
            global.RenderDragonMaterial.opOverrides(current.store.root).size >
              0))
      );
    },
    async createWorkspace(name) {
      return editorCall("create", {
        name,
      });
    },
    async bootstrap() {
      return editorCall("bootstrap");
    },
    async stagePayload(payload, biome) {
      return editorCall("writeback", {
        payload,
        biome,
      });
    },
    async download() {
      return editorCall("download_changes");
    },
    async preview() {
      return editorCall("export_preview");
    },
    editorCall,
  };
  core.openPack = (handle, biome) =>
    editorCall("open", {
      handle,
      biome,
    });
  core.buildRenderDragonPack = (name) =>
    editorCall("create", {
      name,
    });
  core.editorCall = editorCall;
  // 暂存和恢复不隐式触发下载  所有出口统一交给显式下载按钮
  core.persistIfMemory = async () => null;
  global.RenderDragonWorkspace = workspace;
  global.RenderDragonBridge.editorCall = editorCall;
})(window);
