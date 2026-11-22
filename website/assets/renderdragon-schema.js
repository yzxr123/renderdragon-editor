(function (global) {
  "use strict";

  const numberField = (path, label, min, max, step, extra = {}) =>
    Object.assign(
      {
        path,
        label,
        type: "number",
        min,
        max,
        step,
      },
      extra,
    );
  const booleanField = (path, label, extra = {}) =>
    Object.assign(
      {
        path,
        label,
        type: "bool",
      },
      extra,
    );
  const selectField = (path, label, options, extra = {}) =>
    Object.assign(
      {
        path,
        label,
        type: "select",
        options,
      },
      extra,
    );
  const colorField = (path, label, extra = {}) =>
    Object.assign(
      {
        path,
        label,
        type: "color",
      },
      extra,
    );
  const vectorField = (path, label, min, max, step, extra = {}) =>
    Object.assign(
      {
        path,
        label,
        type: "vec3",
        min,
        max,
        step,
      },
      extra,
    );
  const mersField = (path, label, extra = {}) =>
    Object.assign(
      {
        path,
        label,
        type: "mers",
        min: 0,
        max: 255,
        step: 1,
      },
      extra,
    );
  const slots = ["dusk", "noon", "night", "dawn"];
  const keyframedField = (extra) =>
    Object.assign(
      {
        keyframed: true,
        slots,
      },
      extra || {},
    );
  const fog = [
    numberField(
      "distance.air.fog_start",
      "雾开始距离 · Air fog start",
      0,
      512,
      0.01,
      {
        desc: "空气雾从哪里开始出现",
      },
    ),
    numberField(
      "distance.air.fog_end",
      "雾结束距离 · Air fog end",
      0,
      512,
      0.01,
      {
        desc: "空气雾完全覆盖的距离",
      },
    ),
    colorField("distance.air.fog_color", "雾颜色 · Air fog color", {
      desc: "空气雾主颜色",
    }),
    selectField(
      "distance.air.render_distance_type",
      "距离类型 · Air distance type",
      ["render", "fixed"],
      {
        desc: "render 为按渲染距离比例  fixed 为固定距离",
      },
    ),
    numberField(
      "distance.weather.fog_start",
      "天气雾开始距离 · Weather fog start",
      0,
      512,
      0.01,
      {
        desc: "雨雪天气雾开始出现的位置",
      },
    ),
    numberField(
      "distance.weather.fog_end",
      "天气雾结束距离 · Weather fog end",
      0,
      512,
      0.01,
      {
        desc: "雨雪天气雾完全覆盖的位置",
      },
    ),
    colorField("distance.weather.fog_color", "天气雾颜色 · Weather fog color", {
      desc: "天气状态下的雾颜色",
    }),
    selectField(
      "distance.weather.render_distance_type",
      "天气距离类型 · Weather distance type",
      ["render", "fixed"],
      {
        desc: "render 为按渲染距离比例  fixed 为固定距离",
      },
    ),
    numberField(
      "distance.water.fog_start",
      "水下雾开始距离 · Water fog start",
      0,
      512,
      0.01,
      {
        desc: "进入水里后雾开始出现的位置",
      },
    ),
    numberField(
      "distance.water.fog_end",
      "水下雾结束距离 · Water fog end",
      0,
      512,
      0.01,
      {
        desc: "进入水里后雾完全覆盖的位置",
      },
    ),
    colorField("distance.water.fog_color", "水下雾颜色 · Water fog color", {
      desc: "水下主颜色",
    }),
    selectField(
      "distance.water.render_distance_type",
      "水下距离类型 · Water distance type",
      ["render", "fixed"],
      {
        desc: "一般为 fixed",
      },
    ),
    numberField(
      "distance.water.transition_fog.init_fog.fog_start",
      "初始过渡开始 · Water transition start",
      0,
      512,
      0.01,
      {
        desc: "刚入水时的过渡雾起点",
      },
    ),
    numberField(
      "distance.water.transition_fog.init_fog.fog_end",
      "初始过渡结束 · Water transition end",
      0,
      512,
      0.01,
      {
        desc: "刚入水时的过渡雾终点",
      },
    ),
    colorField(
      "distance.water.transition_fog.init_fog.fog_color",
      "初始过渡颜色 · Water transition color",
      {
        desc: "刚入水时的过渡颜色",
      },
    ),
    selectField(
      "distance.water.transition_fog.init_fog.render_distance_type",
      "初始过渡距离类型 · Water transition type",
      ["render", "fixed"],
      {
        desc: "一般为 fixed",
      },
    ),
    numberField(
      "distance.water.transition_fog.min_percent",
      "最小过渡比例 · Min percent",
      0,
      1,
      0.001,
      {
        desc: "入水早期最低过渡程度",
      },
    ),
    numberField(
      "distance.water.transition_fog.mid_seconds",
      "中段过渡时间 · Mid seconds",
      0,
      120,
      0.1,
      {
        desc: "到达中段过渡所需秒数",
      },
    ),
    numberField(
      "distance.water.transition_fog.mid_percent",
      "中段过渡比例 · Mid percent",
      0,
      1,
      0.001,
      {
        desc: "中段时的过渡程度",
      },
    ),
    numberField(
      "distance.water.transition_fog.max_seconds",
      "最大过渡时间 · Max seconds",
      0,
      300,
      0.1,
      {
        desc: "达到最终过渡的秒数",
      },
    ),
    numberField(
      "distance.lava.fog_start",
      "岩浆雾开始距离 · Lava fog start",
      0,
      512,
      0.01,
      {
        desc: "在岩浆里的雾起点",
      },
    ),
    numberField(
      "distance.lava.fog_end",
      "岩浆雾结束距离 · Lava fog end",
      0,
      512,
      0.01,
      {
        desc: "在岩浆里的雾终点",
      },
    ),
    colorField("distance.lava.fog_color", "岩浆雾颜色 · Lava fog color", {
      desc: "岩浆环境主颜色",
    }),
    selectField(
      "distance.lava.render_distance_type",
      "岩浆距离类型 · Lava distance type",
      ["render", "fixed"],
      {
        desc: "一般为 fixed",
      },
    ),
    numberField(
      "distance.lava_resistance.fog_start",
      "抗火岩浆雾开始 · Lava resistance start",
      0,
      512,
      0.01,
      {
        desc: "有抗火效果时的岩浆雾起点",
      },
    ),
    numberField(
      "distance.lava_resistance.fog_end",
      "抗火岩浆雾结束 · Lava resistance end",
      0,
      512,
      0.01,
      {
        desc: "有抗火效果时的岩浆雾终点",
      },
    ),
    colorField(
      "distance.lava_resistance.fog_color",
      "抗火岩浆雾颜色 · Lava resistance color",
      {
        desc: "有抗火效果时的岩浆颜色",
      },
    ),
    selectField(
      "distance.lava_resistance.render_distance_type",
      "抗火距离类型 · Lava resistance type",
      ["render", "fixed"],
      {
        desc: "一般为 fixed",
      },
    ),
    numberField(
      "distance.powder_snow.fog_start",
      "细雪雾开始距离 · Powder snow start",
      0,
      512,
      0.01,
      {
        desc: "在细雪里的雾起点",
      },
    ),
    numberField(
      "distance.powder_snow.fog_end",
      "细雪雾结束距离 · Powder snow end",
      0,
      512,
      0.01,
      {
        desc: "在细雪里的雾终点",
      },
    ),
    colorField(
      "distance.powder_snow.fog_color",
      "细雪雾颜色 · Powder snow color",
      {
        desc: "细雪环境主颜色",
      },
    ),
    selectField(
      "distance.powder_snow.render_distance_type",
      "细雪距离类型 · Powder snow type",
      ["render", "fixed"],
      {
        desc: "一般为 fixed",
      },
    ),
    numberField(
      "volumetric.density.air.max_density",
      "最大密度 · Air max density",
      0,
      1,
      0.0005,
      {
        desc: "体积雾最浓程度",
      },
    ),
    numberField(
      "volumetric.density.air.zero_density_height",
      "零密度高度 · Zero density height",
      -128,
      512,
      1,
      {
        desc: "到这个高度时体积雾趋近于零",
      },
    ),
    numberField(
      "volumetric.density.air.max_density_height",
      "最大密度高度 · Max density height",
      -128,
      512,
      1,
      {
        desc: "体积雾最浓所在高度",
      },
    ),
    vectorField(
      "volumetric.media_coefficients.air.scattering",
      "散射颜色 · Air scattering",
      0,
      1,
      0.0001,
      {
        normalizedColor: true,
        desc: "体积雾把光散开的颜色强度",
      },
    ),
    vectorField(
      "volumetric.media_coefficients.air.absorption",
      "吸收颜色 · Air absorption",
      0,
      1,
      0.0001,
      {
        normalizedColor: true,
        desc: "体积雾吸收光的颜色强度",
      },
    ),
    numberField(
      "volumetric.henyey_greenstein_g.air.henyey_greenstein_g",
      "前向散射系数 · Henyey Greenstein G",
      -1,
      1,
      0.001,
      {
        desc: "越大越偏向前向散射  画面会更朦",
      },
    ),
  ];
  const lighting = [
    numberField(
      "directional_lights.orbital.sun.illuminance",
      "太阳照度 · Sun illuminance",
      0,
      200000,
      1,
      keyframedField(),
    ),
    colorField(
      "directional_lights.orbital.sun.color",
      "太阳颜色 · Sun color",
      keyframedField(),
    ),
    numberField(
      "directional_lights.orbital.moon.illuminance",
      "月亮照度 · Moon illuminance",
      0,
      1000,
      0.01,
      keyframedField(),
    ),
    colorField(
      "directional_lights.orbital.moon.color",
      "月亮颜色 · Moon color",
      keyframedField(),
    ),
    numberField(
      "directional_lights.orbital.orbital_offset_degrees",
      "轨道转向 · Orbital offset",
      -180,
      180,
      0.1,
      keyframedField(),
    ),
    numberField(
      "directional_lights.flash.illuminance",
      "末地闪光照度 · End flash illuminance",
      0,
      10000,
      0.1,
    ),
    colorField(
      "directional_lights.flash.color",
      "末地闪光颜色 · End flash color",
    ),
    numberField(
      "emissive.desaturation",
      "自发光去饱和 · Emissive desaturation",
      0,
      1,
      0.001,
    ),
    numberField(
      "ambient.illuminance",
      "环境光照度 · Ambient illuminance",
      0,
      5,
      0.001,
      keyframedField(),
    ),
    colorField("ambient.color", "环境光颜色 · Ambient color", keyframedField()),
    numberField(
      "sky.intensity",
      "天空间接光 · Sky intensity",
      0.1,
      1,
      0.001,
      keyframedField(),
    ),
  ];
  const atmosphere = [
    numberField(
      "horizon_blend_stops.min",
      "地平线最小高度 · Horizon min",
      -2,
      2,
      0.001,
      keyframedField(),
    ),
    numberField(
      "horizon_blend_stops.start",
      "地平线起点 · Horizon start",
      -2,
      2,
      0.001,
      keyframedField(),
    ),
    numberField(
      "horizon_blend_stops.mie_start",
      "米氏散射起点 · Mie start",
      -2,
      2,
      0.001,
      keyframedField(),
    ),
    numberField(
      "horizon_blend_stops.max",
      "地平线最大高度 · Horizon max",
      -2,
      2,
      0.001,
      keyframedField(),
    ),
    numberField(
      "rayleigh_strength",
      "瑞利强度 · Rayleigh strength",
      0,
      8,
      0.001,
      keyframedField(),
    ),
    numberField(
      "sun_mie_strength",
      "太阳晕强度 · Sun Mie strength",
      0,
      8,
      0.001,
      keyframedField(),
    ),
    numberField(
      "moon_mie_strength",
      "月亮晕强度 · Moon Mie strength",
      0,
      8,
      0.001,
      keyframedField(),
    ),
    numberField(
      "sun_glare_shape",
      "太阳眩光形状 · Sun glare shape",
      0,
      32,
      0.01,
      keyframedField(),
    ),
    colorField(
      "sky_zenith_color",
      "天顶颜色 · Sky zenith color",
      keyframedField(),
    ),
    colorField(
      "sky_horizon_color",
      "地平线颜色 · Sky horizon color",
      keyframedField(),
    ),
  ];
  const water = [
    numberField(
      "particle_concentrations.cdom",
      "有色溶解有机物 · CDOM",
      0,
      15,
      0.01,
    ),
    numberField(
      "particle_concentrations.chlorophyll",
      "叶绿素 · Chlorophyll",
      0,
      10,
      0.01,
    ),
    numberField(
      "particle_concentrations.suspended_sediment",
      "悬浮沉积物 · Suspended sediment",
      0,
      300,
      0.1,
    ),
    booleanField("waves.enabled", "波浪启用 · Waves enabled"),
    numberField("waves.depth", "波浪深度 · Wave depth", 0, 3, 0.001),
    numberField(
      "waves.direction_increment",
      "波浪方向增量 · Direction increment",
      0,
      360,
      0.1,
    ),
    numberField("waves.frequency", "波浪频率 · Frequency", 0.01, 3, 0.001),
    numberField(
      "waves.frequency_scaling",
      "频率缩放 · Frequency scaling",
      0,
      2,
      0.001,
    ),
    numberField("waves.mix", "波浪混合 · Mix", 0, 1, 0.001),
    numberField("waves.octaves", "波浪层数 · Octaves", 1, 30, 1),
    numberField("waves.pull", "波浪拉拽 · Pull", -1, 1, 0.001),
    numberField("waves.sampleWidth", "采样宽度 · Sample width", 0.01, 1, 0.001),
    numberField("waves.shape", "波浪形状 · Shape", 1, 10, 0.01),
    numberField("waves.speed", "波浪速度 · Speed", 0.01, 10, 0.01),
    numberField("waves.speed_scaling", "速度缩放 · Speed scaling", 0, 2, 0.001),
    booleanField("caustics.enabled", "水下焦散 · Caustics enabled"),
    numberField(
      "caustics.frame_length",
      "焦散帧时长 · Caustics frame length",
      0.01,
      5,
      0.01,
    ),
    numberField("caustics.power", "焦散亮度 · Caustics power", 1, 6, 1),
    numberField("caustics.scale", "焦散尺度 · Caustics scale", 0.1, 5, 0.01),
    numberField(
      "biome_water_color_contribution",
      "群系水色贡献 · Biome water color contribution",
      0,
      1,
      0.001,
      {
        optional: true,
      },
    ),
  ];
  function gradeSection(prefix, zh, en, threshold) {
    const a = [];
    if (threshold) {
      a.push(
        booleanField(prefix + ".enabled", zh + "启用 · " + en + " enabled"),
      );
      a.push(
        numberField(
          prefix + "." + threshold.path,
          threshold.label + " · " + threshold.en,
          threshold.min,
          threshold.max,
          0.001,
        ),
      );
    }
    ["contrast", "gain", "gamma", "offset", "saturation"].forEach((key) => {
      const ranges = {
        contrast: [0, 4, 0.001],
        gain: [0, 10, 0.001],
        gamma: [0, 4, 0.001],
        offset: [-1, 1, 0.001],
        saturation: [0, 10, 0.001],
      };
      const zhMap = {
        contrast: "对比度",
        gain: "增益",
        gamma: "伽马",
        offset: "偏移",
        saturation: "饱和度",
      };
      const r = ranges[key];
      a.push(
        vectorField(
          prefix + "." + key,
          zh + " " + zhMap[key] + " · " + en + " " + key,
          r[0],
          r[1],
          r[2],
        ),
      );
    });
    return a;
  }
  const colorGrading = [
    ...gradeSection("color_grading.midtones", "中间调", "Midtones"),
    ...gradeSection("color_grading.highlights", "高光", "Highlights", {
      path: "highlightsMin",
      label: "高光阈值",
      en: "Highlights min",
      min: 1,
      max: 20,
    }),
    ...gradeSection("color_grading.shadows", "阴影", "Shadows", {
      path: "shadowsMax",
      label: "阴影阈值",
      en: "Shadows max",
      min: 0,
      max: 1,
    }),
    booleanField(
      "color_grading.temperature.enabled",
      "色温启用 · Temperature enabled",
    ),
    numberField(
      "color_grading.temperature.temperature",
      "色温 · Temperature",
      1000,
      15000,
      1,
    ),
    selectField(
      "color_grading.temperature.type",
      "色温类型 · Temperature type",
      ["white_balance", "color_temperature"],
    ),
    selectField("tone_mapping.operator", "色调映射 · Tone mapping", [
      "reinhard",
      "reinhard_luma",
      "reinhard_luminance",
      "hable",
      "aces",
      "generic",
    ]),
  ];
  const shadows = [
    selectField("shadow_style", "阴影样式 · Shadow style", [
      "soft_shadows",
      "blocky_shadows",
    ]),
    numberField("texel_size", "阴影纹素 · Shadow texel size", 1, 1024, 1),
  ];
  const pbr = [
    mersField(
      "blocks.global_metalness_emissive_roughness_subsurface",
      "方块兜底材质 · Block fallback MERS",
    ),
    mersField(
      "actors.global_metalness_emissive_roughness_subsurface",
      "生物兜底材质 · Actor fallback MERS",
    ),
    mersField(
      "particles.global_metalness_emissive_roughness_subsurface",
      "粒子兜底材质 · Particle fallback MERS",
    ),
    mersField(
      "items.global_metalness_emissive_roughness_subsurface",
      "物品兜底材质 · Item fallback MERS",
    ),
  ];
  global.RenderDragonSchema = {
    slots,
    slotLabels: {
      dusk: "黄昏",
      noon: "正午",
      night: "夜里",
      dawn: "黎明",
    },
    tabs: [
      ["lighting", "光照"],
      ["fog", "体积雾"],
      ["atmosphere", "大气"],
      ["water", "水体"],
      ["color_grading", "色彩分级"],
      ["shadows", "阴影"],
      ["local_lights", "局部光源"],
      ["pbr", "PBR 材质"],
      ["binding", "绑定关系"],
    ],
    fields: {
      lighting,
      fog,
      atmosphere,
      water,
      color_grading: colorGrading,
      shadows,
      pbr,
    },
  };
})(window);
