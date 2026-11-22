(function (global) {
  "use strict";

  const core = global.RenderDragonCore;
  const IMAGE = /\.(?:png|tga|jpg|jpeg)$/i;
  const SET_SUFFIX = ".texture_set.json";
  const MER = "metalness_emissive_roughness";
  const MERS = "metalness_emissive_roughness_subsurface";
  const LAYERS = ["color", MER, MERS, "normal", "heightmap"];
  const cache = new WeakMap();
  const imageCache = new WeakMap();
  function path(value) {
    const raw = String(value || "").replace(/\\/g, "/");
    if (!raw || raw.startsWith("/") || /[\x00-\x1f]/.test(raw))
      throw new Error("无效资源路径 " + raw);
    const parts = [];
    for (const item of raw.split("/")) {
      if (!item || item === ".") continue;
      if (item === "..") {
        if (parts.length <= 1) throw new Error("资源引用越过包目录 " + raw);
        parts.pop();
      } else parts.push(item);
    }
    if (parts[0] !== "textures" || parts.length < 2)
      throw new Error("贴图必须位于 textures 目录 " + raw);
    return parts.join("/");
  }
  function dir(value) {
    return value.slice(0, value.lastIndexOf("/") + 1);
  }
  function stem(value) {
    return value.replace(/\.[^/.]+$/, "");
  }
  function setPath(value) {
    return stem(path(value)) + SET_SUFFIX;
  }
  function candidates(owner, ref) {
    if (typeof ref !== "string" || !ref || ref.startsWith("#")) return [];
    const raw = ref.replace(/\\/g, "/");
    const base = path(raw.startsWith("textures/") ? raw : dir(owner) + raw);
    return IMAGE.test(base)
      ? [base]
      : [".tga", ".png", ".jpg", ".jpeg"].map((ext) => base + ext);
  }
  async function resolve(root, owner, ref, required = false) {
    const options = candidates(owner, ref);
    for (const rel of options) if (await core.exists(root, rel)) return rel;
    if (required && options.length)
      throw new Error("缺少贴图依赖 " + owner + " 引用了 " + ref);
    return null;
  }
  function reference(owner, target) {
    const base = stem(path(target));
    return dir(owner) === dir(target) ? base.slice(dir(owner).length) : base;
  }
  async function hasSiblingImage(root, owner, target, pending = null) {
    for (const candidate of candidates(owner, reference(owner, target))) {
      if (
        candidate !== target &&
        (pending?.has(candidate) || (await core.exists(root, candidate)))
      )
        return true;
    }
    return false;
  }
  function kind(rel) {
    rel = String(rel).toLowerCase().replace(/\\/g, "/");
    if (/^textures\/(?:ui|gui)\//.test(rel)) return "ui";
    if (/^textures\/(?:entity|models\/entity)\//.test(rel)) return "entity";
    if (/^textures\/items?\//.test(rel)) return "item";
    if (/^textures\/blocks?\//.test(rel)) return "block";
    if (/^textures\/particles?\//.test(rel)) return "particle";
    return "other";
  }
  function uniform(value, count, defaults = [0, 0, 255, 0]) {
    if (Array.isArray(value)) {
      if (
        value.length !== count ||
        value.some((n) => !Number.isFinite(n) || n < 0 || n > 255)
      )
        throw new Error("材质常量必须为 " + count + " 个 0 到 255 的数值");
      return value.map(Math.round);
    }
    if (typeof value === "number" && count === 1) {
      if (!Number.isFinite(value) || value < 0 || value > 255)
        throw new Error("高度常量必须为 0 到 255 的数值");
      return [Math.round(value)];
    }
    if (typeof value === "string" && value.startsWith("#")) {
      const raw = value.slice(1);
      if (
        !/^[0-9a-f]+$/i.test(raw) ||
        ![count * 2, ...(count === 4 ? [6] : [])].includes(raw.length)
      )
        throw new Error("材质十六进制常量格式错误 " + value);
      const parts = raw.match(/../g).map((x) => parseInt(x, 16));
      // Texture Set 的四通道十六进制是 ARGB  数组则是 RGBA
      if (count === 4 && parts.length === 4)
        return [parts[1], parts[2], parts[3], parts[0]];
      if (count === 4) return parts.concat(defaults[3]);
      return parts;
    }
    return null;
  }
  async function actualFile(root, rel) {
    if (!root?.__rdWorkspace) return core.exists(root, rel);
    const session = global.RenderDragonWorkspace?.session;
    return (
      root.store.has(rel) &&
      !!(session?.sourcePaths.has(rel) || root.store.overlay.has(rel))
    );
  }
  async function pbrActive(root) {
    const manifest = await core.readJson(root, "manifest.json", {});
    return (
      !!manifest.capabilities?.includes("pbr") ||
      (await actualFile(root, "pbr/global.json"))
    );
  }
  async function materialMode(root, rel, doc = {}) {
    const body = doc["minecraft:texture_set"];
    if (body)
      return body[MER] != null ||
        body[MERS] != null ||
        body.normal != null ||
        body.heightmap != null
        ? "mers"
        : "none";
    return ["block", "entity", "item", "particle"].includes(kind(rel)) &&
      (await pbrActive(root))
      ? "mers"
      : "none";
  }
  async function fallback(root, rel) {
    const category = {
      block: "blocks",
      entity: "actors",
      item: "items",
      particle: "particles",
    }[kind(rel)];
    const doc = (await actualFile(root, "pbr/global.json"))
      ? await core.readJson(root, "pbr/global.json", {})
      : {};
    const value =
      category &&
      doc["minecraft:pbr_fallback_settings"]?.[category]
        ?.global_metalness_emissive_roughness_subsurface;
    const resolved = value == null ? [0, 0, 255, 0] : uniform(value, 4);
    if (!resolved)
      throw new Error("pbr/global.json 的 " + category + " 默认材质值无效");
    return {
      category: category || null,
      value: resolved,
      source: value == null ? "neutral" : "pbr/global.json",
    };
  }
  function validate(doc, owner) {
    const body = doc?.["minecraft:texture_set"];
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      body.color == null
    )
      throw new Error("Texture Set 缺少有效颜色层 " + owner);
    if (body[MER] != null && body[MERS] != null)
      throw new Error("MER 和 MERS 不能同时注册 " + owner);
    if (body.normal != null && body.heightmap != null)
      throw new Error("法线和高度不能同时注册 " + owner);
    for (const key of LAYERS) {
      const value = body[key];
      if (value == null) continue;
      if (typeof value === "string" && !value.startsWith("#")) {
        candidates(owner, value);
        continue;
      }
      if (key === "normal") throw new Error("法线层必须引用法线图片 " + owner);
      const count =
        key === MER ? 3 : key === "heightmap" ? 1 : key === "normal" ? 3 : 4;
      if (
        !uniform(
          value,
          count,
          key === "color" ? [0, 0, 0, 255] : [0, 0, 255, 0],
        )
      )
        throw new Error("材质通道值无效 " + owner + " " + key);
    }
    return body;
  }
  function inspectImageBytes(bytes, rel) {
    if (
      bytes[0] === 137 &&
      bytes[1] === 80 &&
      bytes[2] === 78 &&
      bytes[3] === 71
    )
      return global.RenderDragonPNG.inspect(bytes);
    if (/\.tga$/i.test(rel)) {
      if (bytes.length < 18) throw new Error("TGA 文件头被截断 " + rel);
      const type = bytes[2],
        bits = bytes[16],
        width = bytes[12] | (bytes[13] << 8),
        height = bytes[14] | (bytes[15] << 8);
      const gray = type === 3 || type === 11;
      if (
        bytes[1] ||
        ![2, 3, 10, 11].includes(type) ||
        !width ||
        !height ||
        (gray ? bits !== 8 : ![24, 32].includes(bits))
      )
        throw new Error("TGA 编码或通道数无效 " + rel);
      if (bytes.length < 18 + bytes[0] + bits / 8)
        throw new Error("TGA 像素数据被截断 " + rel);
      return {
        format: "tga",
        width,
        height,
        bitDepth: 8,
        channels: bits / 8,
        hasAlpha: bits === 32,
        indexed: false,
      };
    }
    if (bytes[0] === 255 && bytes[1] === 216) {
      for (let p = 2; p + 3 < bytes.length;) {
        if (bytes[p++] !== 255) throw new Error("JPEG 标记损坏 " + rel);
        while (bytes[p] === 255) p++;
        const marker = bytes[p++];
        if (marker === 217 || marker === 218) break;
        if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
        const length = bytes[p] * 256 + bytes[p + 1];
        if (length < 2 || p + length > bytes.length)
          throw new Error("JPEG 数据被截断 " + rel);
        if (
          [
            192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
          ].includes(marker)
        ) {
          if (length < 8) throw new Error("JPEG 帧头损坏 " + rel);
          return {
            format: "jpeg",
            width: bytes[p + 5] * 256 + bytes[p + 6],
            height: bytes[p + 3] * 256 + bytes[p + 4],
            bitDepth: bytes[p + 2],
            channels: bytes[p + 7],
            hasAlpha: false,
            indexed: false,
          };
        }
        p += length;
      }
    }
    throw new Error("无法读取图像原始通道 " + rel);
  }
  async function imageInfo(root, rel) {
    const revision = root.store
      ? (root.store.cacheGeneration ?? root.store.revision)
      : null;
    let entry = revision == null ? null : imageCache.get(root);
    if (revision != null && entry?.revision !== revision) {
      entry = {
        revision,
        files: new Map(),
      };
      imageCache.set(root, entry);
    }
    if (entry?.files.has(rel)) return entry.files.get(rel);
    const info = inspectImageBytes(await core.readBytes(root, rel), rel);
    entry?.files.set(rel, info);
    return info;
  }
  async function imageContracts(root, owner, doc) {
    const body = validate(doc, owner),
      images = {},
      warnings = [];
    for (const key of LAYERS) {
      const ref = body[key];
      if (typeof ref !== "string" || ref.startsWith("#")) continue;
      const rel = await resolve(root, owner, ref, true),
        info = await imageInfo(root, rel);
      const expected =
        key === MERS ? [3, 4] : key === "heightmap" ? [1] : [3, 4];
      if (!expected.includes(info.channels))
        throw new Error(
          owner +
            " 的 " +
            key +
            " 原图通道数无效 " +
            rel +
            " 实际 " +
            info.channels +
            " 通道",
        );
      if (key === "heightmap" && kind(owner) === "item")
        throw new Error("物品材质不能使用高度图 " + owner);
      const missingAlpha = key === MERS && !info.hasAlpha;
      if (missingAlpha)
        warnings.push(
          owner +
            " 引用的 " +
            rel +
            " 缺少真实 A 通道  编辑时按次表面 0 读取  本材质实际导出时补成 RGBA",
        );
      images[key] = {
        ...info,
        rel,
        missingAlpha,
      };
    }
    return {
      images,
      warnings,
    };
  }
  function mark(map, name, value) {
    if (!map.has(name)) map.set(name, new Set());
    map.get(name).add(value);
  }
  async function buildIndex(root) {
    const sets = new Map(),
      reverse = new Map(),
      roles = new Map(),
      errors = [],
      animations = new Map();
    const rows = await core.walk(root, "textures", {
      filter: (rel) => rel.endsWith(SET_SUFFIX),
    });
    for (const row of rows) {
      let doc, body;
      try {
        doc = await core.readJson(root, row.rel);
        body = validate(doc, row.rel);
      } catch (error) {
        errors.push({
          file: row.rel,
          message: error.message,
        });
        continue;
      }
      sets.set(row.rel, {
        doc,
        body,
      });
      for (const key of LAYERS) {
        for (const rel of candidates(row.rel, body[key])) {
          mark(reverse, rel, row.rel);
          mark(roles, rel, key);
        }
      }
    }
    for (const file of [
      "textures/terrain_texture.json",
      "textures/item_texture.json",
    ]) {
      const doc = await core.readJson(root, file, {});
      function collect(value, variation = false) {
        if (typeof value === "string")
          for (const rel of candidates(file, value)) {
            mark(roles, rel, "color");
            mark(roles, rel, "atlas");
            if (variation) mark(roles, rel, "variation");
          }
        else if (Array.isArray(value))
          value.forEach((x) => collect(x, variation || value.length > 1));
        else if (value && typeof value === "object") {
          if (Object.hasOwn(value, "path")) collect(value.path, variation);
          if (Object.hasOwn(value, "variations"))
            collect(value.variations, true);
        }
      }
      for (const value of Object.values(doc.texture_data || {}))
        collect(value.textures);
    }
    const flipbook = await core.readJson(
      root,
      "textures/flipbook_textures.json",
      [],
    );
    if (!Array.isArray(flipbook))
      throw new Error("flipbook_textures.json 必须为数组");
    for (const entry of flipbook) {
      for (const rel of candidates(
        "textures/flipbook_textures.json",
        entry.flipbook_texture,
      )) {
        mark(roles, rel, "color");
        if (!animations.has(rel)) animations.set(rel, []);
        animations.get(rel).push(entry);
      }
    }
    for (const row of await core.walk(root, "water", {
      filter: (rel) => rel.endsWith(".json"),
    })) {
      const doc = await core.readJson(root, row.rel);
      const ref = doc["minecraft:water_settings"]?.caustics?.texture;
      // 焦散是资源依赖  不交给普通材质画板去解码整条大图
      if (ref)
        for (const rel of candidates("textures/caustics.json", ref))
          mark(roles, rel, "caustics");
    }
    return {
      sets,
      reverse,
      roles,
      animations,
      flipbook,
      errors,
    };
  }
  async function index(root) {
    const revision = root.store
      ? (root.store.cacheGeneration ?? root.store.revision)
      : null;
    if (revision != null && cache.get(root)?.revision === revision)
      return cache.get(root).promise;
    const promise = buildIndex(root);
    if (revision != null)
      cache.set(root, {
        revision,
        promise,
      });
    try {
      return await promise;
    } catch (error) {
      cache.delete(root);
      throw error;
    }
  }
  function auxiliary(graph, rel) {
    const roles = graph.roles.get(rel);
    return (
      !!roles && !roles.has("color") && [...roles].some((x) => x !== "color")
    );
  }
  function track(root, owner, rel) {
    if (!root.store || root.store.baselineOnly) return;
    if (!root.store.generatedImages) root.store.generatedImages = new Set();
    if (!root.store.materialOutputs) root.store.materialOutputs = new Map();
    root.store.generatedImages.add(rel);
    mark(root.store.materialOutputs, setPath(owner), rel);
  }
  async function outputPath(root, owner, suffix, currentRef = null) {
    const graph = await index(root),
      set = setPath(owner),
      owned = root.store?.materialOutputs?.get(set);
    const currentPath = currentRef
      ? await resolve(root, set, currentRef)
      : null;
    if (
      currentPath &&
      owned?.has(currentPath) &&
      [...(graph.reverse.get(currentPath) || [])].every((x) => x === set)
    )
      return currentPath;
    const base = stem(path(owner)) + suffix,
      ext = base.match(/\.[^/.]+$/)?.[0] || ".png";
    let result = base,
      counter = 2;
    for (;;) {
      const owners = graph.reverse.get(result) || new Set();
      const occupied = await core.exists(root, result);
      if (
        ![...owners].some((x) => x !== set) &&
        (!occupied || owners.has(set) || owned?.has(result)) &&
        !(await hasSiblingImage(root, set, result))
      )
        break;
      result = stem(base) + "_rd" + counter++ + ext;
    }
    track(root, owner, result);
    return result;
  }
  async function cleanup(root, owner) {
    if (!root.store) return;
    const graph = await index(root);
    for (const rel of root.store.materialOutputs?.get(setPath(owner)) || []) {
      if (!graph.reverse.has(rel) && root.store.overlay.has(rel))
        root.store.revert(rel);
    }
  }
  async function copyMaterials(target, source, selected) {
    const rels = [...new Set((selected || []).map(path))];
    if (!rels.length) throw new Error("请选择需要导入的材质");
    const sourceGraph = await index(source),
      targetGraph = await index(target);
    const selectedSets = new Set(rels.map(setPath)),
      pending = new Map(),
      relocated = new Map(),
      copiedAux = [],
      animationRows = [];
    async function copy(owner, sourceRel, key) {
      const bytes = await core.readBytes(source, sourceRel);
      let dest = relocated.get(sourceRel) || sourceRel;
      const exists = await core.exists(target, dest),
        old = exists ? await core.readBytes(target, dest) : null;
      const identical =
        old &&
        old.length === bytes.length &&
        old.every((n, i) => n === bytes[i]);
      const outsiders = [...(targetGraph.reverse.get(dest) || [])].filter(
        (x) => !selectedSets.has(x),
      );
      const unownedAux =
        key !== "color" && exists && !targetGraph.reverse.get(dest)?.size;
      if (
        !relocated.has(sourceRel) &&
        ((!identical && (outsiders.length || unownedAux)) ||
          (await hasSiblingImage(target, owner, dest, pending)))
      ) {
        const ext = sourceRel.match(/\.[^/.]+$/)[0],
          base =
            stem(owner) +
            "_rd_import_" +
            ({
              [MER]: "mer",
              [MERS]: "mers",
              heightmap: "height",
            }[key] || key);
        dest = base + ext;
        let n = 2;
        while (
          (await core.exists(target, dest)) ||
          pending.has(dest) ||
          (await hasSiblingImage(target, owner, dest, pending))
        )
          dest = base + "_" + n++ + ext;
        relocated.set(sourceRel, dest);
      }
      if (
        pending.has(dest) &&
        (pending.get(dest).length !== bytes.length ||
          !pending.get(dest).every((n, i) => n === bytes[i]))
      )
        throw new Error("导入资源路径冲突 " + dest);
      pending.set(dest, bytes);
      if (key !== "color") copiedAux.push([owner, dest]);
      return dest;
    }
    for (const rel of rels) {
      const owner = setPath(rel),
        existing = sourceGraph.sets.get(owner);
      if (!(await core.exists(source, rel)) && !existing)
        throw new Error("来源贴图不存在 " + rel);
      if (sourceGraph.errors.some((x) => x.file === owner))
        throw new Error(
          sourceGraph.errors.find((x) => x.file === owner).message,
        );
      let doc;
      if (existing) doc = core.clone(existing.doc);
      else {
        const defaults = await fallback(source, rel),
          enabled = (await materialMode(source, rel)) === "mers";
        doc = {
          format_version: "1.21.30",
          "minecraft:texture_set": {
            color: reference(owner, rel),
          },
        };
        if (enabled) doc["minecraft:texture_set"][MERS] = defaults.value;
      }
      const body = validate(doc, owner);
      await imageContracts(source, owner, doc);
      for (const key of LAYERS) {
        const sourceRel = await resolve(source, owner, body[key], true);
        if (!sourceRel) continue;
        const dest = await copy(rel, sourceRel, key);
        if (dest !== sourceRel) body[key] = reference(owner, dest);
      }
      // 动画配置中的帧间隔 帧序列 replicate 等字段原样保留
      for (const entry of sourceGraph.animations.get(rel) || []) {
        const row = core.clone(entry),
          sourceRel = await resolve(
            source,
            "textures/flipbook_textures.json",
            row.flipbook_texture,
            true,
          );
        const dest = await copy(rel, sourceRel, "color");
        row.flipbook_texture = stem(dest);
        animationRows.push(row);
      }
      if (
        existing ||
        targetGraph.sets.has(owner) ||
        doc["minecraft:texture_set"][MERS] != null
      )
        pending.set(
          owner,
          existing && JSON.stringify(doc) === JSON.stringify(existing.doc)
            ? await core.readBytes(source, owner)
            : new TextEncoder().encode(core.prettyJson(doc)),
        );
    }
    // 所有引用校验通过后才写入  缺少其中一张图不会留下半个材质
    for (const [rel, bytes] of pending)
      await core.writeBytes(target, rel, bytes);
    for (const [owner, rel] of copiedAux) track(target, owner, rel);
    if (animationRows.length) {
      const merged = core.clone(targetGraph.flipbook),
        key = (x) => x.atlas_tile || x.flipbook_texture;
      for (const row of animationRows) {
        const at = merged.findIndex((x) => key(x) === key(row));
        if (at < 0) merged.push(row);
        else merged[at] = row;
      }
      await core.writeJson(target, "textures/flipbook_textures.json", merged);
    }
    return {
      ok: true,
      reason: "已按真实引用导入 " + rels.length + " 个材质",
      count: rels.length,
      files: pending.size,
    };
  }
  global.RenderDragonPBRRegistry = {
    IMAGE,
    SET_SUFFIX,
    MER,
    MERS,
    LAYERS,
    path,
    dir,
    stem,
    setPath,
    candidates,
    resolve,
    reference,
    hasSiblingImage,
    kind,
    uniform,
    fallback,
    actualFile,
    pbrActive,
    materialMode,
    validate,
    inspectImageBytes,
    imageInfo,
    imageContracts,
    index,
    auxiliary,
    track,
    outputPath,
    cleanup,
    copyMaterials,
  };
})(window);
