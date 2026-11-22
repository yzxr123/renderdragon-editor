(function (global) {
  "use strict";

  const DEFAULTS = Object.freeze({
    metal: 0,
    emissive: 0,
    roughness: 255,
    sub: 0,
  });
  const CHANNELS = Object.freeze(["metal", "emissive", "roughness", "sub"]);
  function pack(layers, width, height, defaults = DEFAULTS) {
    width = Number(width || layers.color?.width || layers.metal?.width);
    height = Number(height || layers.color?.height || layers.metal?.height);
    if (
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < 1 ||
      height < 1 ||
      width * height > 16777216
    )
      throw new Error("MERS 图像尺寸无效或超过 1600 万像素");
    const out = new Uint8ClampedArray(width * height * 4);
    CHANNELS.forEach((name, channel) => {
      const src = layers[name],
        value = defaults[name] ?? DEFAULTS[name];
      if (
        src &&
        (!Number.isInteger(src.width) ||
          !Number.isInteger(src.height) ||
          src.width < 1 ||
          src.height < 1 ||
          !src.data ||
          src.data.length !== src.width * src.height * 4)
      )
        throw new Error("MERS 单通道数据不完整 " + name);
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          // 单通道画板是灰度数据  A 不参与 RGB 预乘或基色透明度
          const v = src
            ? src.data[
                (Math.floor((y * src.height) / height) * src.width +
                  Math.floor((x * src.width) / width)) *
                  4
              ]
            : value;
          out[(y * width + x) * 4 + channel] = v;
        }
    });
    return new ImageData(out, width, height);
  }
  function opaquePreview(frame) {
    const data = new Uint8ClampedArray(frame.data);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    return new ImageData(data, frame.width, frame.height);
  }
  async function encode(layers, width, height, defaults) {
    return global.RenderDragonPNG.encode(pack(layers, width, height, defaults));
  }
  function normalizeMode(mode, bump = "none") {
    return mode === "mer" ||
      mode === "mers" ||
      bump === "normal" ||
      bump === "heightmap"
      ? "mers"
      : "none";
  }
  global.RenderDragonMERS = {
    DEFAULTS,
    CHANNELS,
    pack,
    encode,
    opaquePreview,
    normalizeMode,
  };
})(window);
