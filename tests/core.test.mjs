import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
globalThis.window = globalThis;
globalThis.ImageData = class ImageData {
  constructor(data, w, h) {
    if (typeof data === "number") {
      this.width = data;
      this.height = w;
      this.data = new Uint8ClampedArray(data * w * 4);
    } else {
      this.data = data;
      this.width = w;
      this.height = h;
    }
  }
};
for (const file of [
  "png-codec",
  "mers-codec",
  "texture-targets",
  "pbr-algorithm",
  "seed-data",
  "fs-core",
])
  vm.runInThisContext(
    readFileSync(new URL("../website/assets/" + file + ".js", import.meta.url), "utf8"),
    { filename: file },
  );
const gray = (value, w = 2, h = 2) =>
  new ImageData(
    new Uint8ClampedArray(
      Array(w * h)
        .fill([value, value, value, 255])
        .flat(),
    ),
    w,
    h,
  );
test("target rejects inherited property names", () => {
  for (const name of ["constructor", "toString", "__proto__"])
    assert.throws(() => RenderDragonTargets.normalize(name));
});
test("MERS rejects zero-size source layers", () =>
  assert.throws(() =>
    RenderDragonMERS.pack({ metal: { width: 0, height: 0, data: [] } }, 2, 2),
  ));
test("algorithm rejects non-finite parameters and malformed images", () => {
  assert.throws(() =>
    RenderDragonPBRAlgorithm.copyPreset({ normalStrength: Infinity }),
  );
  assert.throws(() =>
    RenderDragonPBRAlgorithm.generate({ width: 0, height: 1, data: [] }, {}),
  );
});
test("MERS keeps alpha as subsurface data", async () => {
  const image = RenderDragonMERS.pack(
    { metal: gray(71), emissive: gray(92), roughness: gray(153), sub: gray(0) },
    2,
    2,
  );
  const encoded = new Uint8Array(
    await (await RenderDragonPNG.encode(image)).arrayBuffer(),
  );
  const decoded = await RenderDragonPNG.decode(encoded);
  assert.deepEqual([...decoded.data], [...image.data]);
  assert.deepEqual([...decoded.data.slice(0, 4)], [71, 92, 153, 0]);
  const bad = encoded.slice();
  bad[29] ^= 1;
  await assert.rejects(RenderDragonPNG.decode(bad));
});
test("FIO roundtrip preserves channels and rejects arbitrary grids", () => {
  const layers = {
    color: gray(93),
    metal: gray(71),
    emissive: gray(92),
    roughness: gray(153),
    fioBlue: gray(37),
  };
  const packed = RenderDragonTargets.packFIO(layers);
  assert.equal(RenderDragonTargets.detectFIO(packed), true);
  const decoded = RenderDragonTargets.unpackFIO(packed);
  for (const key of Object.keys(layers))
    assert.deepEqual([...decoded[key].data], [...layers[key].data]);
  assert.equal(RenderDragonTargets.detectFIO(gray(128, 4, 4)), false);
});
test("JSON paths preserve decimal time keys and reject prototype traversal", () => {
  const value = { time: { 0.25: [1, 2, 3] } };
  assert.deepEqual(RenderDragonCore.getPath(value, "time.0.25"), [1, 2, 3]);
  RenderDragonCore.setPath(value, "time.0.25", [3, 2, 1]);
  assert.deepEqual(value.time["0.25"], [3, 2, 1]);
  assert.throws(() => RenderDragonCore.setPath({}, "__proto__.polluted", true));
  assert.equal({}.polluted, undefined);
});
test("PBR produces deterministic finite image channels", () => {
  const input = gray(128, 16, 16);
  const a = RenderDragonPBRAlgorithm.generate(input, { resolution: 16 });
  const b = RenderDragonPBRAlgorithm.generate(input, { resolution: 16 });
  for (const name of [
    "albedo",
    "normal",
    "height",
    "roughness",
    "metalness",
    "emissive",
    "mers",
    "preview",
  ]) {
    assert.equal(a[name].width, 16);
    assert.deepEqual(a[name].data, b[name].data);
  }
  assert.ok(Number.isFinite(a.metrics.mean_luminance));
});
