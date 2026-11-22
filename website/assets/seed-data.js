window.RenderDragonSeed = {
  SITE_FOG_SEED: [
    {
      id: "minecraft:fog_bamboo_jungle",
      slug: "bamboo_jungle",
      nameCn: "竹林",
      category: "丛林沼泽",
      fileName: "fogs/bamboo_jungle_fog_setting.json",
      primaryColor: "#14A2C5",
      colorSet: ["#14A2C5", "#0F0F0F", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_bamboo_jungle",
          },
          distance: {
            water: {
              fog_start: 0,
              fog_end: 60.0,
              fog_color: "#14A2C5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#14A2C5",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.06, 0.06, 0.06],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.4,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_bamboo_jungle_hills",
      slug: "bamboo_jungle_hills",
      nameCn: "竹林丘陵",
      category: "丛林沼泽",
      fileName: "fogs/bamboo_jungle_hills_fog_setting.json",
      primaryColor: "#1B9ED8",
      colorSet: ["#1B9ED8", "#0F0F0F", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_bamboo_jungle_hills",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1B9ED8",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1B9ED8",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.06, 0.06, 0.06],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.4,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_basalt_deltas",
      slug: "basalt_deltas",
      nameCn: "玄武岩三角洲",
      category: "下界",
      fileName: "fogs/basalt_deltas_fog_setting.json",
      primaryColor: "#423E42",
      colorSet: ["#685F70", "#423E42"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_basalt_deltas",
          },
          distance: {
            air: {
              fog_start: 10.0,
              fog_end: 96.0,
              fog_color: "#685f70",
              render_distance_type: "fixed",
            },
            water: {
              fog_start: 0.0,
              fog_end: 15.0,
              fog_color: "#423e42",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#423e42",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
            weather: {
              fog_start: 10.0,
              fog_end: 96.0,
              fog_color: "#685f70",
              render_distance_type: "fixed",
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_beach",
      slug: "beach",
      nameCn: "沙滩",
      category: "水域",
      fileName: "fogs/beach_fog_setting.json",
      primaryColor: "#157CAB",
      colorSet: ["#157CAB", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_beach",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#157cab",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#157cab",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_birch_forest",
      slug: "birch_forest",
      nameCn: "桦木森林",
      category: "森林原野",
      fileName: "fogs/birch_forest_fog_setting.json",
      primaryColor: "#0677CE",
      colorSet: ["#0677CE"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_birch_forest",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0677ce",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0677ce",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_birch_forest_hills",
      slug: "birch_forest_hills",
      nameCn: "桦木森林丘陵",
      category: "森林原野",
      fileName: "fogs/birch_forest_hills_fog_setting.json",
      primaryColor: "#0A74C4",
      colorSet: ["#0A74C4"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_birch_forest_hills",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0a74c4",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0a74c4",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_cherry_grove",
      slug: "cherry_grove",
      nameCn: "樱花树林",
      category: "森林原野",
      fileName: "fogs/cherry_grove_fog_setting.json",
      primaryColor: "#5DB7EF",
      colorSet: ["#5DB7EF"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_cherry_grove",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#5db7ef",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#5db7ef",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_cold_beach",
      slug: "cold_beach",
      nameCn: "积雪沙滩",
      category: "水域",
      fileName: "fogs/cold_beach_fog_setting.json",
      primaryColor: "#1463A5",
      colorSet: ["#1463A5"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_cold_beach",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1463a5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1463a5",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_cold_ocean",
      slug: "cold_ocean",
      nameCn: "冷水海洋",
      category: "水域",
      fileName: "fogs/cold_ocean_fog_setting.json",
      primaryColor: "#14559B",
      colorSet: ["#14559B"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_cold_ocean",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#14559b",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#14559b",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_cold_taiga",
      slug: "cold_taiga",
      nameCn: "积雪针叶林",
      category: "冰雪",
      fileName: "fogs/cold_taiga_fog_setting.json",
      primaryColor: "#205E83",
      colorSet: ["#205E83", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_cold_taiga",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#205e83",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#205e83",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_cold_taiga_hills",
      slug: "cold_taiga_hills",
      nameCn: "积雪的针叶林丘陵",
      category: "冰雪",
      fileName: "fogs/cold_taiga_hills_fog_setting.json",
      primaryColor: "#245B78",
      colorSet: ["#245B78", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_cold_taiga_hills",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#245b78",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#245b78",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_cold_taiga_mutated",
      slug: "cold_taiga_mutated",
      nameCn: "积雪的针叶林山地",
      category: "冰雪",
      fileName: "fogs/cold_taiga_mutated_fog_setting.json",
      primaryColor: "#205E83",
      colorSet: ["#205E83", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_cold_taiga_mutated",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#205e83",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#205e83",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_crimson_forest",
      slug: "crimson_forest",
      nameCn: "绯红森林",
      category: "下界",
      fileName: "fogs/crimson_forest_fog_setting.json",
      primaryColor: "#905957",
      colorSet: ["#330303", "#905957"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_crimson_forest",
          },
          distance: {
            air: {
              fog_start: 10.0,
              fog_end: 96.0,
              fog_color: "#330303",
              render_distance_type: "fixed",
            },
            water: {
              fog_start: 0.0,
              fog_end: 15.0,
              fog_color: "#905957",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#905957",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
            weather: {
              fog_start: 10.0,
              fog_end: 96.0,
              fog_color: "#330303",
              render_distance_type: "fixed",
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_deep_cold_ocean",
      slug: "deep_cold_ocean",
      nameCn: "冷水深海",
      category: "水域",
      fileName: "fogs/deep_cold_ocean_fog_setting.json",
      primaryColor: "#185390",
      colorSet: ["#185390"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_deep_cold_ocean",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#185390",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#185390",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_deep_frozen_ocean",
      slug: "deep_frozen_ocean",
      nameCn: "冰冻深海",
      category: "水域",
      fileName: "fogs/deep_frozen_ocean_fog_setting.json",
      primaryColor: "#1A4879",
      colorSet: ["#1A4879", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_deep_frozen_ocean",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1a4879",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1a4879",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_deep_lukewarm_ocean",
      slug: "deep_lukewarm_ocean",
      nameCn: "温水深海",
      category: "水域",
      fileName: "fogs/deep_lukewarm_ocean_fog_setting.json",
      primaryColor: "#0E72B9",
      colorSet: ["#0E72B9", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_deep_lukewarm_ocean",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0e72b9",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0e72b9",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_deep_ocean",
      slug: "deep_ocean",
      nameCn: "深海",
      category: "水域",
      fileName: "fogs/deep_ocean_fog_setting.json",
      primaryColor: "#1463A5",
      colorSet: ["#1463A5"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_deep_ocean",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1463a5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1463a5",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_deep_warm_ocean",
      slug: "deep_warm_ocean",
      nameCn: "暖水深海",
      category: "水域",
      fileName: "fogs/deep_warm_ocean_fog_setting.json",
      primaryColor: "#0686CA",
      colorSet: ["#0686CA", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_deep_warm_ocean",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0686ca",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0686ca",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_default",
      slug: "default",
      nameCn: "默认",
      category: "模板",
      fileName: "fogs/default_fog_setting.json",
      primaryColor: "#44AFF5",
      colorSet: ["#ABD2FF", "#666666", "#44AFF5", "#991A00"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_default",
          },
          distance: {
            air: {
              fog_start: 0.92,
              fog_end: 1.0,
              fog_color: "#ABD2FF",
              render_distance_type: "render",
            },
            water: {
              fog_start: 0,
              fog_end: 60.0,
              fog_color: "#44AFF5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
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
            weather: {
              fog_start: 0.23,
              fog_end: 0.7,
              fog_color: "#666666",
              render_distance_type: "render",
            },
            lava: {
              fog_start: 0.0,
              fog_end: 0.64,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
            lava_resistance: {
              fog_start: 2.0,
              fog_end: 4.0,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_desert",
      slug: "desert",
      nameCn: "沙漠",
      category: "山地干旱",
      fileName: "fogs/desert_fog_setting.json",
      primaryColor: "#32A598",
      colorSet: ["#32A598", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_desert",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#32A598",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#32A598",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_desert_hills",
      slug: "desert_hills",
      nameCn: "沙漠丘陵",
      category: "山地干旱",
      fileName: "fogs/desert_hills_fog_setting.json",
      primaryColor: "#1A7AA1",
      colorSet: ["#1A7AA1", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_desert_hills",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1a7aa1",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1a7aa1",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_dry",
      slug: "dry",
      nameCn: "干燥模板",
      category: "模板",
      fileName: "fogs/dry_fog_setting.json",
      primaryColor: "#44AFF5",
      colorSet: ["#ABD2FF", "#666666", "#44AFF5", "#991A00", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_dry",
          },
          distance: {
            air: {
              fog_start: 0.92,
              fog_end: 1.0,
              fog_color: "#ABD2FF",
              render_distance_type: "render",
            },
            water: {
              fog_start: 0,
              fog_end: 60.0,
              fog_color: "#44AFF5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
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
            weather: {
              fog_start: 0.23,
              fog_end: 0.7,
              fog_color: "#666666",
              render_distance_type: "render",
            },
            lava: {
              fog_start: 0.0,
              fog_end: 0.64,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
            lava_resistance: {
              fog_start: 2.0,
              fog_end: 4.0,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_extreme_hills_edge",
      slug: "extreme_hills_edge",
      nameCn: "山地边缘",
      category: "山地干旱",
      fileName: "fogs/extreme_hills_edge_fog_setting.json",
      primaryColor: "#045CD5",
      colorSet: ["#045CD5"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_extreme_hills_edge",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#045cd5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#045cd5",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_extreme_hills",
      slug: "extreme_hills",
      nameCn: "山地",
      category: "山地干旱",
      fileName: "fogs/extreme_hills_fog_setting.json",
      primaryColor: "#007BF7",
      colorSet: ["#007BF7"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_extreme_hills",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#007BF7",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#007BF7",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_extreme_hills_mutated",
      slug: "extreme_hills_mutated",
      nameCn: "沙砾山地",
      category: "山地干旱",
      fileName: "fogs/extreme_hills_mutated_fog_setting.json",
      primaryColor: "#0E63AB",
      colorSet: ["#0E63AB"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_extreme_hills_mutated",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0E63AB",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0E63AB",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_extreme_hills_plus_trees",
      slug: "extreme_hills_plus_trees",
      nameCn: "繁茂的山地",
      category: "山地干旱",
      fileName: "fogs/extreme_hills_plus_trees_fog_setting.json",
      primaryColor: "#0E63AB",
      colorSet: ["#0E63AB", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_extreme_hills_plus_trees",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0E63AB",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0E63AB",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_extreme_hills_plus_trees_mutated",
      slug: "extreme_hills_plus_trees_mutated",
      nameCn: "沙砾山地+",
      category: "山地干旱",
      fileName: "fogs/extreme_hills_plus_trees_mutated_fog_setting.json",
      primaryColor: "#0E63AB",
      colorSet: ["#0E63AB", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_extreme_hills_plus_trees_mutated",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0E63AB",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0E63AB",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_flower_forest",
      slug: "flower_forest",
      nameCn: "繁花森林",
      category: "森林原野",
      fileName: "fogs/flower_forest_fog_setting.json",
      primaryColor: "#20A3CC",
      colorSet: ["#20A3CC", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_flower_forest",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#20A3CC",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#20A3CC",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_forest",
      slug: "forest",
      nameCn: "森林",
      category: "森林原野",
      fileName: "fogs/forest_fog_setting.json",
      primaryColor: "#1E97F2",
      colorSet: ["#1E97F2"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_forest",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1E97F2",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1E97F2",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_forest_hills",
      slug: "forest_hills",
      nameCn: "繁茂的丘陵",
      category: "森林原野",
      fileName: "fogs/forest_hills_fog_setting.json",
      primaryColor: "#056BD1",
      colorSet: ["#056BD1"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_forest_hills",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#056bd1",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#056bd1",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_frozen_ocean",
      slug: "frozen_ocean",
      nameCn: "冻洋",
      category: "水域",
      fileName: "fogs/frozen_ocean_fog_setting.json",
      primaryColor: "#174985",
      colorSet: ["#174985", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_frozen_ocean",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#174985",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#174985",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_frozen_river",
      slug: "frozen_river",
      nameCn: "冻河",
      category: "水域",
      fileName: "fogs/frozen_river_fog_setting.json",
      primaryColor: "#185390",
      colorSet: ["#185390", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_frozen_river",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#185390",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#185390",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_hell",
      slug: "hell",
      nameCn: "下界荒地",
      category: "下界",
      fileName: "fogs/hell_fog_setting.json",
      primaryColor: "#905957",
      colorSet: ["#330808", "#905957"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_hell",
          },
          distance: {
            air: {
              fog_start: 10.0,
              fog_end: 96.0,
              fog_color: "#330808",
              render_distance_type: "fixed",
            },
            water: {
              fog_start: 0.0,
              fog_end: 15.0,
              fog_color: "#905957",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#905957",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
            weather: {
              fog_start: 10.0,
              fog_end: 96.0,
              fog_color: "#330808",
              render_distance_type: "fixed",
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_humid",
      slug: "humid",
      nameCn: "湿润模板",
      category: "模板",
      fileName: "fogs/humid_fog_setting.json",
      primaryColor: "#44AFF5",
      colorSet: [
        "#ABD2FF",
        "#666666",
        "#44AFF5",
        "#991A00",
        "#0F0F0F",
        "#000000",
      ],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_humid",
          },
          distance: {
            air: {
              fog_start: 0.92,
              fog_end: 1.0,
              fog_color: "#ABD2FF",
              render_distance_type: "render",
            },
            water: {
              fog_start: 0,
              fog_end: 60.0,
              fog_color: "#44AFF5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
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
            weather: {
              fog_start: 0.23,
              fog_end: 0.7,
              fog_color: "#666666",
              render_distance_type: "render",
            },
            lava: {
              fog_start: 0.0,
              fog_end: 0.64,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
            lava_resistance: {
              fog_start: 2.0,
              fog_end: 4.0,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.06, 0.06, 0.06],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.4,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_ice_mountains",
      slug: "ice_mountains",
      nameCn: "雪山",
      category: "冰雪",
      fileName: "fogs/ice_mountains_fog_setting.json",
      primaryColor: "#1156A7",
      colorSet: ["#1156A7", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_ice_mountains",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1156a7",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1156a7",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_ice_plains",
      slug: "ice_plains",
      nameCn: "积雪的冻原",
      category: "冰雪",
      fileName: "fogs/ice_plains_fog_setting.json",
      primaryColor: "#14559B",
      colorSet: ["#14559B", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_ice_plains",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#14559b",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#14559b",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_ice_plains_spikes",
      slug: "ice_plains_spikes",
      nameCn: "冰刺之地",
      category: "冰雪",
      fileName: "fogs/ice_plains_spikes_fog_setting.json",
      primaryColor: "#14559B",
      colorSet: ["#14559B", "#050505", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_ice_plains_spikes",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#14559b",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#14559b",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.02, 0.02, 0.02],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.3,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_jungle_edge",
      slug: "jungle_edge",
      nameCn: "丛林边缘",
      category: "丛林沼泽",
      fileName: "fogs/jungle_edge_fog_setting.json",
      primaryColor: "#0D8AE3",
      colorSet: ["#0D8AE3", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_jungle_edge",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0D8AE3",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0D8AE3",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_jungle",
      slug: "jungle",
      nameCn: "丛林",
      category: "丛林沼泽",
      fileName: "fogs/jungle_fog_setting.json",
      primaryColor: "#14A2C5",
      colorSet: ["#14A2C5", "#0F0F0F", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_jungle",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#14A2C5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#14A2C5",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.06, 0.06, 0.06],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.4,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_jungle_hills",
      slug: "jungle_hills",
      nameCn: "丛林丘陵",
      category: "丛林沼泽",
      fileName: "fogs/jungle_hills_fog_setting.json",
      primaryColor: "#1B9ED8",
      colorSet: ["#1B9ED8", "#0F0F0F", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_jungle_hills",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1B9ED8",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1B9ED8",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.06, 0.06, 0.06],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.4,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_jungle_mutated",
      slug: "jungle_mutated",
      nameCn: "丛林变种",
      category: "丛林沼泽",
      fileName: "fogs/jungle_mutated_fog_setting.json",
      primaryColor: "#1B9ED8",
      colorSet: ["#1B9ED8", "#0F0F0F", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_jungle_mutated",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1B9ED8",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1B9ED8",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.06, 0.06, 0.06],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.4,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_lukewarm_ocean",
      slug: "lukewarm_ocean",
      nameCn: "温水海洋",
      category: "水域",
      fileName: "fogs/lukewarm_ocean_fog_setting.json",
      primaryColor: "#0A74C4",
      colorSet: ["#0A74C4", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_lukewarm_ocean",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0a74c4",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0a74c4",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_lush_caves",
      slug: "lush_caves",
      nameCn: "繁茂洞穴",
      category: "特殊生态",
      fileName: "fogs/lush_caves_fog_setting.json",
      primaryColor: "#44AFF5",
      colorSet: [
        "#ABD2FF",
        "#666666",
        "#44AFF5",
        "#991A00",
        "#0F0F0F",
        "#000000",
      ],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_lush_caves",
          },
          distance: {
            air: {
              fog_start: 0.92,
              fog_end: 1.0,
              fog_color: "#ABD2FF",
              render_distance_type: "render",
            },
            water: {
              fog_start: 0,
              fog_end: 60.0,
              fog_color: "#44AFF5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
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
            weather: {
              fog_start: 0.23,
              fog_end: 0.7,
              fog_color: "#666666",
              render_distance_type: "render",
            },
            lava: {
              fog_start: 0.0,
              fog_end: 0.64,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
            lava_resistance: {
              fog_start: 2.0,
              fog_end: 4.0,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.06, 0.06, 0.06],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.4,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mangrove_swamp",
      slug: "mangrove_swamp",
      nameCn: "红树林沼泽",
      category: "丛林沼泽",
      fileName: "fogs/mangrove_swamp_fog_setting.json",
      primaryColor: "#4D7A60",
      colorSet: ["#4D7A60", "#0F0F0F", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mangrove_swamp",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 30,
              fog_color: "#4d7a60",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#4d7a60",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.06, 0.06, 0.06],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.4,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mega_spruce_taiga",
      slug: "mega_spruce_taiga",
      nameCn: "巨型云杉针叶林",
      category: "森林原野",
      fileName: "fogs/mega_spruce_taiga_fog_setting.json",
      primaryColor: "#2D6D77",
      colorSet: ["#2D6D77"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mega_spruce_taiga",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#2d6d77",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#2d6d77",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mega_spruce_taiga_mutated",
      slug: "mega_spruse_taiga_mutated",
      nameCn: "巨型云杉针叶林丘陵",
      category: "森林原野",
      fileName: "fogs/mega_spruse_taiga_mutated_fog_setting.json",
      primaryColor: "#2D6D77",
      colorSet: ["#2D6D77"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mega_spruce_taiga_mutated",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#2d6d77",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#2d6d77",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mega_taiga",
      slug: "mega_taiga",
      nameCn: "巨型针叶林",
      category: "森林原野",
      fileName: "fogs/mega_taiga_fog_setting.json",
      primaryColor: "#2D6D77",
      colorSet: ["#2D6D77", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mega_taiga",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#2d6d77",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#2d6d77",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mega_taiga_hills",
      slug: "mega_taiga_hills",
      nameCn: "巨型针叶林丘陵",
      category: "森林原野",
      fileName: "fogs/mega_taiga_hills_fog_setting.json",
      primaryColor: "#286378",
      colorSet: ["#286378", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mega_taiga_hills",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#286378",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#286378",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mega_taiga_mutated",
      slug: "mega_taiga_mutated",
      nameCn: "巨型针叶林山地",
      category: "森林原野",
      fileName: "fogs/mega_taiga_mutated_fog_setting.json",
      primaryColor: "#2D6D77",
      colorSet: ["#2D6D77"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mega_taiga_mutated",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#2d6d77",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#2d6d77",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mesa_bryce",
      slug: "mesa_bryce",
      nameCn: "风蚀恶地",
      category: "山地干旱",
      fileName: "fogs/mesa_bryce_fog_setting.json",
      primaryColor: "#497F99",
      colorSet: ["#497F99", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mesa_bryce",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#497F99",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#497F99",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mesa",
      slug: "mesa",
      nameCn: "恶地",
      category: "山地干旱",
      fileName: "fogs/mesa_fog_setting.json",
      primaryColor: "#4E7F81",
      colorSet: ["#4E7F81", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mesa",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#4E7F81",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#4E7F81",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mesa_mutated",
      slug: "mesa_mutated",
      nameCn: "恶地高原变种",
      category: "山地干旱",
      fileName: "fogs/mesa_mutated_fog_setting.json",
      primaryColor: "#497F99",
      colorSet: ["#497F99"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mesa_mutated",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#497F99",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#497F99",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mesa_plateau",
      slug: "mesa_plateau",
      nameCn: "恶地高原",
      category: "山地干旱",
      fileName: "fogs/mesa_plateau_fog_setting.json",
      primaryColor: "#55809E",
      colorSet: ["#55809E", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mesa_plateau",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#55809E",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#55809E",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mesa_plateau_stone",
      slug: "mesa_plateau_stone",
      nameCn: "繁茂的恶地高原",
      category: "山地干旱",
      fileName: "fogs/mesa_plateau_stone_fog_setting.json",
      primaryColor: "#55809E",
      colorSet: ["#55809E", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mesa_plateau_stone",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#55809E",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#55809E",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mushroom_island",
      slug: "mushroom_island",
      nameCn: "蘑菇岛",
      category: "特殊生态",
      fileName: "fogs/mushroom_island_fog_setting.json",
      primaryColor: "#8A8997",
      colorSet: ["#8A8997", "#030303", "#0B2303"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mushroom_island",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#8a8997",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#8a8997",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.01, 0.01, 0.01],
                absorption: [0.042, 0.137, 0.012],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.3,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_mushroom_island_shore",
      slug: "mushroom_island_shore",
      nameCn: "蘑菇岛岸",
      category: "特殊生态",
      fileName: "fogs/mushroom_island_shore_fog_setting.json",
      primaryColor: "#818193",
      colorSet: ["#818193", "#030303", "#0B2303"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_mushroom_island_shore",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#818193",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#818193",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.01, 0.01, 0.01],
                absorption: [0.042, 0.137, 0.012],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.3,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_ocean",
      slug: "ocean",
      nameCn: "海洋",
      category: "水域",
      fileName: "fogs/ocean_fog_setting.json",
      primaryColor: "#1165B0",
      colorSet: ["#1165B0"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_ocean",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1165b0",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1165b0",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_pale_garden",
      slug: "pale_garden",
      nameCn: "苍白花园",
      category: "特殊生态",
      fileName: "fogs/pale_garden_fog_setting.json",
      primaryColor: "#556980",
      colorSet: ["#817770", "#403C44", "#556980", "#808080", "#402020"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_pale_garden",
          },
          distance: {
            air: {
              fog_start: 0.92,
              fog_end: 1.0,
              fog_color: "#817770",
              render_distance_type: "render",
            },
            weather: {
              fog_start: 0.23,
              fog_end: 0.7,
              fog_color: "#403C44",
              render_distance_type: "render",
            },
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#556980",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#556980",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.07,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.5, 0.5, 0.5],
                absorption: [0.25, 0.125, 0.125],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.3,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_plains",
      slug: "plains",
      nameCn: "平原",
      category: "森林原野",
      fileName: "fogs/plains_fog_setting.json",
      primaryColor: "#44AFF5",
      colorSet: ["#44AFF5"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_plains",
          },
          distance: {
            water: {
              fog_start: 0,
              fog_end: 60.0,
              fog_color: "#44AFF5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
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
          },
        },
      },
    },
    {
      id: "minecraft:fog_powder_snow",
      slug: "powder_snow",
      nameCn: "细雪",
      category: "冰雪",
      fileName: "fogs/powder_snow_fog_setting.json",
      primaryColor: "#9FBBC8",
      colorSet: ["#9FBBC8"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_powder_snow",
          },
          distance: {
            powder_snow: {
              fog_start: 0.0,
              fog_end: 2.0,
              fog_color: "#9FBBC8",
              render_distance_type: "fixed",
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_river",
      slug: "river",
      nameCn: "河流",
      category: "水域",
      fileName: "fogs/river_fog_setting.json",
      primaryColor: "#0084FF",
      colorSet: ["#0084FF"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_river",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0084FF",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0084FF",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_roofed_forest",
      slug: "roofed_forest",
      nameCn: "黑森林",
      category: "森林原野",
      fileName: "fogs/roofed_forest_fog_setting.json",
      primaryColor: "#3B6CD1",
      colorSet: ["#3B6CD1", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_roofed_forest",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#3B6CD1",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#3B6CD1",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_roofed_forest_mutated",
      slug: "roofed_forest_mutated",
      nameCn: "黑森林变种",
      category: "森林原野",
      fileName: "fogs/roofed_forest_mutated_fog_setting.json",
      primaryColor: "#44AFF5",
      colorSet: [
        "#ABD2FF",
        "#666666",
        "#44AFF5",
        "#991A00",
        "#0A0A0A",
        "#000000",
      ],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_roofed_forest_mutated",
          },
          distance: {
            air: {
              fog_start: 0.92,
              fog_end: 1.0,
              fog_color: "#ABD2FF",
              render_distance_type: "render",
            },
            water: {
              fog_start: 0,
              fog_end: 60.0,
              fog_color: "#44AFF5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
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
            weather: {
              fog_start: 0.23,
              fog_end: 0.7,
              fog_color: "#666666",
              render_distance_type: "render",
            },
            lava: {
              fog_start: 0.0,
              fog_end: 0.64,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
            lava_resistance: {
              fog_start: 2.0,
              fog_end: 4.0,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_savanna",
      slug: "savanna",
      nameCn: "热带草原",
      category: "山地干旱",
      fileName: "fogs/savanna_fog_setting.json",
      primaryColor: "#2C8B9C",
      colorSet: ["#2C8B9C"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_savanna",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#2C8B9C",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#2C8B9C",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_savanna_mutated",
      slug: "savanna_mutated",
      nameCn: "破碎的热带草原",
      category: "山地干旱",
      fileName: "fogs/savanna_mutated_fog_setting.json",
      primaryColor: "#2590A8",
      colorSet: ["#2590A8"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_savanna_mutated",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#2590A8",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#2590A8",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_savanna_plateau",
      slug: "savanna_plateau",
      nameCn: "热带高原",
      category: "山地干旱",
      fileName: "fogs/savanna_plateau_fog_setting.json",
      primaryColor: "#2590A8",
      colorSet: ["#2590A8"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_savanna_plateau",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#2590A8",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#2590A8",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_semi_humid",
      slug: "semi_humid",
      nameCn: "半湿润模板",
      category: "模板",
      fileName: "fogs/semi_humid_fog_setting.json",
      primaryColor: "#44AFF5",
      colorSet: [
        "#ABD2FF",
        "#666666",
        "#44AFF5",
        "#991A00",
        "#0A0A0A",
        "#000000",
      ],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_semi_humid",
          },
          distance: {
            air: {
              fog_start: 0.92,
              fog_end: 1.0,
              fog_color: "#ABD2FF",
              render_distance_type: "render",
            },
            water: {
              fog_start: 0,
              fog_end: 60.0,
              fog_color: "#44AFF5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
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
            weather: {
              fog_start: 0.23,
              fog_end: 0.7,
              fog_color: "#666666",
              render_distance_type: "render",
            },
            lava: {
              fog_start: 0.0,
              fog_end: 0.64,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
            lava_resistance: {
              fog_start: 2.0,
              fog_end: 4.0,
              fog_color: "#991A00",
              render_distance_type: "fixed",
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_soulsand_valley",
      slug: "soulsand_valley",
      nameCn: "灵魂沙峡谷",
      category: "下界",
      fileName: "fogs/soulsand_valley_fog_setting.json",
      primaryColor: "#905957",
      colorSet: ["#1B4745", "#905957"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_soulsand_valley",
          },
          distance: {
            air: {
              fog_start: 10.0,
              fog_end: 96.0,
              fog_color: "#1B4745",
              render_distance_type: "fixed",
            },
            water: {
              fog_start: 0.0,
              fog_end: 15.0,
              fog_color: "#905957",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#905957",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
            weather: {
              fog_start: 10.0,
              fog_end: 96.0,
              fog_color: "#1B4745",
              render_distance_type: "fixed",
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_stone_beach",
      slug: "stone_beach",
      nameCn: "石岸",
      category: "水域",
      fileName: "fogs/stone_beach_fog_setting.json",
      primaryColor: "#0D67BB",
      colorSet: ["#0D67BB"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_stone_beach",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0d67bb",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0d67bb",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_sunflower_plains",
      slug: "sunflower_plains",
      nameCn: "向日葵平原",
      category: "森林原野",
      fileName: "fogs/sunflower_plains_fog_setting.json",
      primaryColor: "#44AFF5",
      colorSet: ["#44AFF5", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_sunflower_plains",
          },
          distance: {
            water: {
              fog_start: 0,
              fog_end: 60.0,
              fog_color: "#44AFF5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
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
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.0,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.0, 0.0, 0.0],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.75,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_swampland",
      slug: "swampland",
      nameCn: "沼泽",
      category: "丛林沼泽",
      fileName: "fogs/swampland_fog_setting.json",
      primaryColor: "#232317",
      colorSet: ["#232317", "#0F0F0F", "#412130"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_swampland",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 30,
              fog_color: "#232317",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#232317",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.06, 0.06, 0.06],
                absorption: [
                  0.2549019753932953, 0.12995001673698425, 0.18875093758106232,
                ],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.4,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_swampland_mutated",
      slug: "swampland_mutated",
      nameCn: "沼泽丘陵",
      category: "丛林沼泽",
      fileName: "fogs/swampland_mutated_fog_setting.json",
      primaryColor: "#232317",
      colorSet: ["#232317", "#0F0F0F", "#412130"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_swampland_mutated",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 30,
              fog_color: "#232317",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#232317",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.06, 0.06, 0.06],
                absorption: [
                  0.2549019753932953, 0.12995001673698425, 0.18875093758106232,
                ],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.4,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_taiga",
      slug: "taiga",
      nameCn: "针叶林",
      category: "森林原野",
      fileName: "fogs/taiga_fog_setting.json",
      primaryColor: "#287082",
      colorSet: ["#287082", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_taiga",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#287082",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#287082",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_taiga_hills",
      slug: "taiga_hills",
      nameCn: "针叶林丘陵",
      category: "森林原野",
      fileName: "fogs/taiga_hills_fog_setting.json",
      primaryColor: "#236583",
      colorSet: ["#236583", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_taiga_hills",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#236583",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#236583",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_taiga_mutated",
      slug: "taiga_mutated",
      nameCn: "针叶林山地",
      category: "森林原野",
      fileName: "fogs/taiga_mutated_fog_setting.json",
      primaryColor: "#1E6B82",
      colorSet: ["#1E6B82", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_taiga_mutated",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#1E6B82",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#1E6B82",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_the_end",
      slug: "the_end",
      nameCn: "末地",
      category: "末地",
      fileName: "fogs/the_end_fog_setting.json",
      primaryColor: "#62529E",
      colorSet: ["#0B080C", "#62529E", "#050505", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_the_end",
          },
          distance: {
            air: {
              fog_start: 0.92,
              fog_end: 1.0,
              fog_color: "#0B080C",
              render_distance_type: "render",
            },
            water: {
              fog_start: 0.0,
              fog_end: 15.0,
              fog_color: "#62529e",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#62529e",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.25,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.02, 0.02, 0.02],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.8,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_warm_ocean",
      slug: "warm_ocean",
      nameCn: "暖水海洋",
      category: "水域",
      fileName: "fogs/warm_ocean_fog_setting.json",
      primaryColor: "#0289D5",
      colorSet: ["#0289D5", "#0A0A0A", "#000000"],
      fileJson: {
        format_version: "1.21.90",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_warm_ocean",
          },
          distance: {
            water: {
              fog_start: 0.0,
              fog_end: 60.0,
              fog_color: "#0289d5",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#0289d5",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
          },
          volumetric: {
            density: {
              air: {
                max_density: 0.05,
                zero_density_height: 320.0,
                max_density_height: 320.0,
              },
            },
            media_coefficients: {
              air: {
                scattering: [0.04, 0.04, 0.04],
                absorption: [0.0, 0.0, 0.0],
              },
            },
            henyey_greenstein_g: {
              air: {
                henyey_greenstein_g: 0.6,
              },
            },
          },
        },
      },
    },
    {
      id: "minecraft:fog_warped_forest",
      slug: "warped_forest",
      nameCn: "诡异森林",
      category: "下界",
      fileName: "fogs/warped_forest_fog_setting.json",
      primaryColor: "#905957",
      colorSet: ["#1A051A", "#905957"],
      fileJson: {
        format_version: "1.16.100",
        "minecraft:fog_settings": {
          description: {
            identifier: "minecraft:fog_warped_forest",
          },
          distance: {
            air: {
              fog_start: 10.0,
              fog_end: 96.0,
              fog_color: "#1a051A",
              render_distance_type: "fixed",
            },
            water: {
              fog_start: 0.0,
              fog_end: 15.0,
              fog_color: "#905957",
              render_distance_type: "fixed",
              transition_fog: {
                init_fog: {
                  fog_start: 0.0,
                  fog_end: 0.01,
                  fog_color: "#905957",
                  render_distance_type: "fixed",
                },
                min_percent: 0.25,
                mid_seconds: 5,
                mid_percent: 0.6,
                max_seconds: 30,
              },
            },
            weather: {
              fog_start: 10.0,
              fog_end: 96.0,
              fog_color: "#1a051A",
              render_distance_type: "fixed",
            },
          },
        },
      },
    },
  ],
  SITE_BIOME_SEED: [
    {
      id: "bamboo_jungle",
      slug: "bamboo_jungle",
      nameCn: "竹林",
      category: "丛林沼泽",
      fileName: "biomes/bamboo_jungle.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "bamboo_jungle",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_bamboo_jungle",
            },
            "minecraft:water_appearance": {
              surface_color: "#14A2C5",
            },
          },
        },
      },
    },
    {
      id: "bamboo_jungle_hills",
      slug: "bamboo_jungle_hills",
      nameCn: "竹林丘陵",
      category: "丛林沼泽",
      fileName: "biomes/bamboo_jungle_hills.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "bamboo_jungle_hills",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_bamboo_jungle_hills",
            },
            "minecraft:water_appearance": {
              surface_color: "#1B9ED8",
            },
          },
        },
      },
    },
    {
      id: "basalt_deltas",
      slug: "basalt_deltas",
      nameCn: "玄武岩三角洲",
      category: "下界",
      fileName: "biomes/basalt_deltas.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "basalt_deltas",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_basalt_deltas",
            },
            "minecraft:water_appearance": {
              surface_color: "#3f76e4",
            },
          },
        },
      },
    },
    {
      id: "beach",
      slug: "beach",
      nameCn: "沙滩",
      category: "水域",
      fileName: "biomes/beach.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "beach",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_beach",
            },
            "minecraft:water_appearance": {
              surface_color: "#157cab",
            },
          },
        },
      },
    },
    {
      id: "birch_forest",
      slug: "birch_forest",
      nameCn: "桦木森林",
      category: "森林原野",
      fileName: "biomes/birch_forest.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "birch_forest",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_birch_forest",
            },
            "minecraft:water_appearance": {
              surface_color: "#0677ce",
            },
          },
        },
      },
    },
    {
      id: "birch_forest_hills",
      slug: "birch_forest_hills",
      nameCn: "桦木森林丘陵",
      category: "森林原野",
      fileName: "biomes/birch_forest_hills.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "birch_forest_hills",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_birch_forest_hills",
            },
            "minecraft:water_appearance": {
              surface_color: "#0a74c4",
            },
          },
        },
      },
    },
    {
      id: "birch_forest_hills_mutated",
      slug: "birch_forest_hills_mutated",
      nameCn: "变种桦木森林丘陵",
      category: "森林原野",
      fileName: "biomes/birch_forest_hills_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "birch_forest_hills_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "birch_forest_mutated",
      slug: "birch_forest_mutated",
      nameCn: "变种桦木森林",
      category: "森林原野",
      fileName: "biomes/birch_forest_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "birch_forest_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "cherry_grove",
      slug: "cherry_grove",
      nameCn: "樱花树林",
      category: "森林原野",
      fileName: "biomes/cherry_grove.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "cherry_grove",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_cherry_grove",
            },
            "minecraft:water_appearance": {
              surface_color: "#5db7ef",
            },
          },
        },
      },
    },
    {
      id: "cold_beach",
      slug: "cold_beach",
      nameCn: "积雪沙滩",
      category: "水域",
      fileName: "biomes/cold_beach.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "cold_beach",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_cold_beach",
            },
            "minecraft:water_appearance": {
              surface_color: "#1463a5",
            },
          },
        },
      },
    },
    {
      id: "cold_ocean",
      slug: "cold_ocean",
      nameCn: "冷水海洋",
      category: "水域",
      fileName: "biomes/cold_ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "cold_ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_cold_ocean",
            },
            "minecraft:water_appearance": {
              surface_color: "#2080C9",
            },
          },
        },
      },
    },
    {
      id: "cold_taiga",
      slug: "cold_taiga",
      nameCn: "积雪针叶林",
      category: "冰雪",
      fileName: "biomes/cold_taiga.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "cold_taiga",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_cold_taiga",
            },
            "minecraft:water_appearance": {
              surface_color: "#205e83",
            },
          },
        },
      },
    },
    {
      id: "cold_taiga_hills",
      slug: "cold_taiga_hills",
      nameCn: "积雪的针叶林丘陵",
      category: "冰雪",
      fileName: "biomes/cold_taiga_hills.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "cold_taiga_hills",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_cold_taiga_hills",
            },
            "minecraft:water_appearance": {
              surface_color: "#245b78",
            },
          },
        },
      },
    },
    {
      id: "cold_taiga_mutated",
      slug: "cold_taiga_mutated",
      nameCn: "积雪的针叶林山地",
      category: "冰雪",
      fileName: "biomes/cold_taiga_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "cold_taiga_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_cold_taiga_mutated",
            },
            "minecraft:water_appearance": {
              surface_color: "#205e83",
            },
          },
        },
      },
    },
    {
      id: "crimson_forest",
      slug: "crimson_forest",
      nameCn: "绯红森林",
      category: "下界",
      fileName: "biomes/crimson_forest.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "crimson_forest",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_crimson_forest",
            },
            "minecraft:water_appearance": {
              surface_color: "#905957",
            },
          },
        },
      },
    },
    {
      id: "deep_cold_ocean",
      slug: "deep_cold_ocean",
      nameCn: "冷水深海",
      category: "水域",
      fileName: "biomes/deep_cold_ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "deep_cold_ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_deep_cold_ocean",
            },
            "minecraft:water_appearance": {
              surface_color: "#2080C9",
            },
          },
        },
      },
    },
    {
      id: "deep_dark",
      slug: "deep_dark",
      nameCn: "深暗之域",
      category: "特殊生态",
      fileName: "biomes/deep_dark.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "deep_dark",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "deep_frozen_ocean",
      slug: "deep_frozen_ocean",
      nameCn: "冰冻深海",
      category: "水域",
      fileName: "biomes/deep_frozen_ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "deep_frozen_ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_deep_frozen_ocean",
            },
            "minecraft:water_appearance": {
              surface_color: "#2570B5",
            },
          },
        },
      },
    },
    {
      id: "deep_lukewarm_ocean",
      slug: "deep_lukewarm_ocean",
      nameCn: "温水深海",
      category: "水域",
      fileName: "biomes/deep_lukewarm_ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "deep_lukewarm_ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_deep_lukewarm_ocean",
            },
            "minecraft:water_appearance": {
              surface_color: "#0D96DB",
            },
          },
        },
      },
    },
    {
      id: "deep_ocean",
      slug: "deep_ocean",
      nameCn: "深海",
      category: "水域",
      fileName: "biomes/deep_ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "deep_ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_deep_ocean",
            },
            "minecraft:water_appearance": {
              surface_color: "#1787D4",
            },
          },
        },
      },
    },
    {
      id: "deep_warm_ocean",
      slug: "deep_warm_ocean",
      nameCn: "暖水深海",
      category: "水域",
      fileName: "biomes/deep_warm_ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "deep_warm_ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_deep_warm_ocean",
            },
            "minecraft:water_appearance": {
              surface_color: "#02B0E5",
            },
          },
        },
      },
    },
    {
      id: "desert",
      slug: "desert",
      nameCn: "沙漠",
      category: "山地干旱",
      fileName: "biomes/desert.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "desert",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_desert",
            },
            "minecraft:water_appearance": {
              surface_color: "#32A598",
            },
          },
        },
      },
    },
    {
      id: "desert_hills",
      slug: "desert_hills",
      nameCn: "沙漠丘陵",
      category: "山地干旱",
      fileName: "biomes/desert_hills.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "desert_hills",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_desert_hills",
            },
            "minecraft:water_appearance": {
              surface_color: "#1a7aa1",
            },
          },
        },
      },
    },
    {
      id: "desert_mutated",
      slug: "desert_mutated",
      nameCn: "变种沙漠",
      category: "山地干旱",
      fileName: "biomes/desert_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "desert_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "dripstone_caves",
      slug: "dripstone_caves",
      nameCn: "滴水石洞穴",
      category: "特殊生态",
      fileName: "biomes/dripstone_caves.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "dripstone_caves",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "extreme_hills",
      slug: "extreme_hills",
      nameCn: "山地",
      category: "山地干旱",
      fileName: "biomes/extreme_hills.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "extreme_hills",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_extreme_hills",
            },
            "minecraft:water_appearance": {
              surface_color: "#007BF7",
            },
          },
        },
      },
    },
    {
      id: "extreme_hills_edge",
      slug: "extreme_hills_edge",
      nameCn: "山地边缘",
      category: "山地干旱",
      fileName: "biomes/extreme_hills_edge.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "extreme_hills_edge",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_extreme_hills_edge",
            },
            "minecraft:water_appearance": {
              surface_color: "#045cd5",
            },
          },
        },
      },
    },
    {
      id: "extreme_hills_mutated",
      slug: "extreme_hills_mutated",
      nameCn: "沙砾山地",
      category: "山地干旱",
      fileName: "biomes/extreme_hills_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "extreme_hills_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_extreme_hills_mutated",
            },
            "minecraft:water_appearance": {
              surface_color: "#0E63AB",
            },
          },
        },
      },
    },
    {
      id: "extreme_hills_plus_trees",
      slug: "extreme_hills_plus_trees",
      nameCn: "繁茂的山地",
      category: "山地干旱",
      fileName: "biomes/extreme_hills_plus_trees.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "extreme_hills_plus_trees",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_extreme_hills_plus_trees",
            },
            "minecraft:water_appearance": {
              surface_color: "#0E63AB",
            },
          },
        },
      },
    },
    {
      id: "extreme_hills_plus_trees_mutated",
      slug: "extreme_hills_plus_trees_mutated",
      nameCn: "沙砾山地+",
      category: "山地干旱",
      fileName: "biomes/extreme_hills_plus_trees_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "extreme_hills_plus_trees_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_extreme_hills_plus_trees_mutated",
            },
            "minecraft:water_appearance": {
              surface_color: "#0E63AB",
            },
          },
        },
      },
    },
    {
      id: "flower_forest",
      slug: "flower_forest",
      nameCn: "繁花森林",
      category: "森林原野",
      fileName: "biomes/flower_forest.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "flower_forest",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_flower_forest",
            },
            "minecraft:water_appearance": {
              surface_color: "#20A3CC",
            },
          },
        },
      },
    },
    {
      id: "forest",
      slug: "forest",
      nameCn: "森林",
      category: "森林原野",
      fileName: "biomes/forest.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "forest",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_forest",
            },
            "minecraft:water_appearance": {
              surface_color: "#1E97F2",
            },
          },
        },
      },
    },
    {
      id: "forest_hills",
      slug: "forest_hills",
      nameCn: "繁茂的丘陵",
      category: "森林原野",
      fileName: "biomes/forest_hills.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "forest_hills",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_forest_hills",
            },
            "minecraft:water_appearance": {
              surface_color: "#056bd1",
            },
          },
        },
      },
    },
    {
      id: "frozen_ocean",
      slug: "frozen_ocean",
      nameCn: "冻洋",
      category: "水域",
      fileName: "biomes/frozen_ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "frozen_ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_frozen_ocean",
            },
            "minecraft:water_appearance": {
              surface_color: "#2570B5",
            },
          },
        },
      },
    },
    {
      id: "frozen_peaks",
      slug: "frozen_peaks",
      nameCn: "冰封山峰",
      category: "冰雪",
      fileName: "biomes/frozen_peaks.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "frozen_peaks",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "frozen_river",
      slug: "frozen_river",
      nameCn: "冻河",
      category: "水域",
      fileName: "biomes/frozen_river.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "frozen_river",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_frozen_river",
            },
            "minecraft:water_appearance": {
              surface_color: "#185390",
            },
          },
        },
      },
    },
    {
      id: "grove",
      slug: "grove",
      nameCn: "雪林",
      category: "森林原野",
      fileName: "biomes/grove.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "grove",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "hell",
      slug: "hell",
      nameCn: "下界荒地",
      category: "下界",
      fileName: "biomes/hell.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "hell",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_hell",
            },
            "minecraft:water_appearance": {
              surface_color: "#905957",
            },
          },
        },
      },
    },
    {
      id: "ice_mountains",
      slug: "ice_mountains",
      nameCn: "雪山",
      category: "冰雪",
      fileName: "biomes/ice_mountains.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "ice_mountains",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_ice_mountains",
            },
            "minecraft:water_appearance": {
              surface_color: "#1156a7",
            },
          },
        },
      },
    },
    {
      id: "ice_plains",
      slug: "ice_plains",
      nameCn: "积雪的冻原",
      category: "冰雪",
      fileName: "biomes/ice_plains.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "ice_plains",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_ice_plains",
            },
            "minecraft:water_appearance": {
              surface_color: "#14559b",
            },
          },
        },
      },
    },
    {
      id: "ice_plains_spikes",
      slug: "ice_plains_spikes",
      nameCn: "冰刺之地",
      category: "冰雪",
      fileName: "biomes/ice_plains_spikes.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "ice_plains_spikes",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_ice_plains_spikes",
            },
            "minecraft:water_appearance": {
              surface_color: "#14559b",
            },
          },
        },
      },
    },
    {
      id: "jagged_peaks",
      slug: "jagged_peaks",
      nameCn: "尖峭山峰",
      category: "山地干旱",
      fileName: "biomes/jagged_peaks.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "jagged_peaks",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "jungle",
      slug: "jungle",
      nameCn: "丛林",
      category: "丛林沼泽",
      fileName: "biomes/jungle.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "jungle",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_jungle",
            },
            "minecraft:water_appearance": {
              surface_color: "#14A2C5",
            },
          },
        },
      },
    },
    {
      id: "jungle_edge",
      slug: "jungle_edge",
      nameCn: "丛林边缘",
      category: "丛林沼泽",
      fileName: "biomes/jungle_edge.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "jungle_edge",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_jungle_edge",
            },
            "minecraft:water_appearance": {
              surface_color: "#0D8AE3",
            },
          },
        },
      },
    },
    {
      id: "jungle_edge_mutated",
      slug: "jungle_edge_mutated",
      nameCn: "变种丛林边缘",
      category: "森林原野",
      fileName: "biomes/jungle_edge_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "jungle_edge_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "jungle_hills",
      slug: "jungle_hills",
      nameCn: "丛林丘陵",
      category: "丛林沼泽",
      fileName: "biomes/jungle_hills.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "jungle_hills",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_jungle_hills",
            },
            "minecraft:water_appearance": {
              surface_color: "#1B9ED8",
            },
          },
        },
      },
    },
    {
      id: "jungle_mutated",
      slug: "jungle_mutated",
      nameCn: "丛林变种",
      category: "丛林沼泽",
      fileName: "biomes/jungle_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "jungle_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_jungle_mutated",
            },
            "minecraft:water_appearance": {
              surface_color: "#1B9ED8",
            },
          },
        },
      },
    },
    {
      id: "legacy_frozen_ocean",
      slug: "legacy_frozen_ocean",
      nameCn: "旧版冰封海洋",
      category: "水域",
      fileName: "biomes/legacy_frozen_ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "legacy_frozen_ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "lukewarm_ocean",
      slug: "lukewarm_ocean",
      nameCn: "温水海洋",
      category: "水域",
      fileName: "biomes/lukewarm_ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "lukewarm_ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_lukewarm_ocean",
            },
            "minecraft:water_appearance": {
              surface_color: "#0D96DB",
            },
          },
        },
      },
    },
    {
      id: "lush_caves",
      slug: "lush_caves",
      nameCn: "繁茂洞穴",
      category: "特殊生态",
      fileName: "biomes/lush_caves.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "lush_caves",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "mangrove_swamp",
      slug: "mangrove_swamp",
      nameCn: "红树林沼泽",
      category: "丛林沼泽",
      fileName: "biomes/mangrove_swamp.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mangrove_swamp",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_mangrove_swamp",
            },
            "minecraft:water_appearance": {
              surface_color: "#3a7a6a",
            },
          },
        },
      },
    },
    {
      id: "meadow",
      slug: "meadow",
      nameCn: "草甸",
      category: "森林原野",
      fileName: "biomes/meadow.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "meadow",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "mega_taiga",
      slug: "mega_taiga",
      nameCn: "巨型针叶林",
      category: "森林原野",
      fileName: "biomes/mega_taiga.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mega_taiga",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_mega_taiga",
            },
            "minecraft:water_appearance": {
              surface_color: "#2d6d77",
            },
          },
        },
      },
    },
    {
      id: "mega_taiga_hills",
      slug: "mega_taiga_hills",
      nameCn: "巨型针叶林丘陵",
      category: "森林原野",
      fileName: "biomes/mega_taiga_hills.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mega_taiga_hills",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_mega_taiga_hills",
            },
            "minecraft:water_appearance": {
              surface_color: "#286378",
            },
          },
        },
      },
    },
    {
      id: "mesa",
      slug: "mesa",
      nameCn: "恶地",
      category: "山地干旱",
      fileName: "biomes/mesa.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mesa",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_mesa",
            },
            "minecraft:water_appearance": {
              surface_color: "#4E7F81",
            },
          },
        },
      },
    },
    {
      id: "mesa_bryce",
      slug: "mesa_bryce",
      nameCn: "风蚀恶地",
      category: "山地干旱",
      fileName: "biomes/mesa_bryce.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mesa_bryce",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_mesa_bryce",
            },
            "minecraft:water_appearance": {
              surface_color: "#497F99",
            },
          },
        },
      },
    },
    {
      id: "mesa_plateau",
      slug: "mesa_plateau",
      nameCn: "恶地高原",
      category: "山地干旱",
      fileName: "biomes/mesa_plateau.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mesa_plateau",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_mesa_plateau",
            },
            "minecraft:water_appearance": {
              surface_color: "#55809E",
            },
          },
        },
      },
    },
    {
      id: "mesa_plateau_mutated",
      slug: "mesa_plateau_mutated",
      nameCn: "变种恶地高原",
      category: "山地干旱",
      fileName: "biomes/mesa_plateau_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mesa_plateau_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "mesa_plateau_stone",
      slug: "mesa_plateau_stone",
      nameCn: "繁茂的恶地高原",
      category: "山地干旱",
      fileName: "biomes/mesa_plateau_stone.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mesa_plateau_stone",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_mesa_plateau_stone",
            },
            "minecraft:water_appearance": {
              surface_color: "#55809E",
            },
          },
        },
      },
    },
    {
      id: "mesa_plateau_stone_mutated",
      slug: "mesa_plateau_stone_mutated",
      nameCn: "变种林木恶地高原",
      category: "山地干旱",
      fileName: "biomes/mesa_plateau_stone_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mesa_plateau_stone_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "mushroom_island",
      slug: "mushroom_island",
      nameCn: "蘑菇岛",
      category: "特殊生态",
      fileName: "biomes/mushroom_island.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mushroom_island",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_mushroom_island",
            },
            "minecraft:water_appearance": {
              surface_color: "#8a8997",
            },
          },
        },
      },
    },
    {
      id: "mushroom_island_shore",
      slug: "mushroom_island_shore",
      nameCn: "蘑菇岛岸",
      category: "特殊生态",
      fileName: "biomes/mushroom_island_shore.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "mushroom_island_shore",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_mushroom_island_shore",
            },
            "minecraft:water_appearance": {
              surface_color: "#818193",
            },
          },
        },
      },
    },
    {
      id: "ocean",
      slug: "ocean",
      nameCn: "海洋",
      category: "水域",
      fileName: "biomes/ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_ocean",
            },
            "minecraft:water_appearance": {
              surface_color: "#1787D4",
            },
          },
        },
      },
    },
    {
      id: "pale_garden",
      slug: "pale_garden",
      nameCn: "苍白花园",
      category: "特殊生态",
      fileName: "biomes/pale_garden.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "pale_garden",
          },
          components: {
            "minecraft:sky_color": {
              sky_color: "#b9b9b9",
            },
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_pale_garden",
            },
            "minecraft:water_appearance": {
              surface_color: "#76889D",
            },
            "minecraft:biome_music": {
              volume_multiplier: 0,
            },
          },
        },
      },
    },
    {
      id: "plains",
      slug: "plains",
      nameCn: "平原",
      category: "森林原野",
      fileName: "biomes/plains.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "plains",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_plains",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "redwood_taiga_hills_mutated",
      slug: "redwood_taiga_hills_mutated",
      nameCn: "变种红木针叶林丘陵",
      category: "森林原野",
      fileName: "biomes/redwood_taiga_hills_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "redwood_taiga_hills_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "redwood_taiga_mutated",
      slug: "redwood_taiga_mutated",
      nameCn: "变种红木针叶林",
      category: "森林原野",
      fileName: "biomes/redwood_taiga_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "redwood_taiga_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "river",
      slug: "river",
      nameCn: "河流",
      category: "水域",
      fileName: "biomes/river.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "river",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_river",
            },
            "minecraft:water_appearance": {
              surface_color: "#0084FF",
            },
          },
        },
      },
    },
    {
      id: "roofed_forest",
      slug: "roofed_forest",
      nameCn: "黑森林",
      category: "森林原野",
      fileName: "biomes/roofed_forest.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "roofed_forest",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_roofed_forest",
            },
            "minecraft:water_appearance": {
              surface_color: "#3B6CD1",
            },
          },
        },
      },
    },
    {
      id: "roofed_forest_mutated",
      slug: "roofed_forest_mutated",
      nameCn: "黑森林变种",
      category: "森林原野",
      fileName: "biomes/roofed_forest_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "roofed_forest_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "savanna",
      slug: "savanna",
      nameCn: "热带草原",
      category: "山地干旱",
      fileName: "biomes/savanna.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "savanna",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_savanna",
            },
            "minecraft:water_appearance": {
              surface_color: "#2C8B9C",
            },
          },
        },
      },
    },
    {
      id: "savanna_mutated",
      slug: "savanna_mutated",
      nameCn: "破碎的热带草原",
      category: "山地干旱",
      fileName: "biomes/savanna_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "savanna_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_savanna_mutated",
            },
            "minecraft:water_appearance": {
              surface_color: "#2590A8",
            },
          },
        },
      },
    },
    {
      id: "savanna_plateau",
      slug: "savanna_plateau",
      nameCn: "热带高原",
      category: "山地干旱",
      fileName: "biomes/savanna_plateau.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "savanna_plateau",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_savanna_plateau",
            },
            "minecraft:water_appearance": {
              surface_color: "#2590A8",
            },
          },
        },
      },
    },
    {
      id: "savanna_plateau_mutated",
      slug: "savanna_plateau_mutated",
      nameCn: "变种热带高原",
      category: "山地干旱",
      fileName: "biomes/savanna_plateau_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "savanna_plateau_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "snowy_slopes",
      slug: "snowy_slopes",
      nameCn: "积雪山坡",
      category: "冰雪",
      fileName: "biomes/snowy_slopes.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "snowy_slopes",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "soulsand_valley",
      slug: "soulsand_valley",
      nameCn: "灵魂沙峡谷",
      category: "下界",
      fileName: "biomes/soulsand_valley.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "soulsand_valley",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_soulsand_valley",
            },
            "minecraft:water_appearance": {
              surface_color: "#905957",
            },
          },
        },
      },
    },
    {
      id: "stone_beach",
      slug: "stone_beach",
      nameCn: "石岸",
      category: "水域",
      fileName: "biomes/stone_beach.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "stone_beach",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_stone_beach",
            },
            "minecraft:water_appearance": {
              surface_color: "#0d67bb",
            },
          },
        },
      },
    },
    {
      id: "stony_peaks",
      slug: "stony_peaks",
      nameCn: "石质山峰",
      category: "山地干旱",
      fileName: "biomes/stony_peaks.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "stony_peaks",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_default",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "sunflower_plains",
      slug: "sunflower_plains",
      nameCn: "向日葵平原",
      category: "森林原野",
      fileName: "biomes/sunflower_plains.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "sunflower_plains",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_sunflower_plains",
            },
            "minecraft:water_appearance": {
              surface_color: "#44AFF5",
            },
          },
        },
      },
    },
    {
      id: "swampland",
      slug: "swampland",
      nameCn: "沼泽",
      category: "丛林沼泽",
      fileName: "biomes/swampland.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "swampland",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_swampland",
            },
            "minecraft:water_appearance": {
              surface_color: "#4c6559",
            },
          },
        },
      },
    },
    {
      id: "swampland_mutated",
      slug: "swampland_mutated",
      nameCn: "沼泽丘陵",
      category: "丛林沼泽",
      fileName: "biomes/swampland_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "swampland_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_swampland_mutated",
            },
            "minecraft:water_appearance": {
              surface_color: "#4c6156",
            },
          },
        },
      },
    },
    {
      id: "taiga",
      slug: "taiga",
      nameCn: "针叶林",
      category: "森林原野",
      fileName: "biomes/taiga.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "taiga",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_taiga",
            },
            "minecraft:water_appearance": {
              surface_color: "#287082",
            },
          },
        },
      },
    },
    {
      id: "taiga_hills",
      slug: "taiga_hills",
      nameCn: "针叶林丘陵",
      category: "森林原野",
      fileName: "biomes/taiga_hills.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "taiga_hills",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_taiga_hills",
            },
            "minecraft:water_appearance": {
              surface_color: "#236583",
            },
          },
        },
      },
    },
    {
      id: "taiga_mutated",
      slug: "taiga_mutated",
      nameCn: "针叶林山地",
      category: "森林原野",
      fileName: "biomes/taiga_mutated.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "taiga_mutated",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_taiga_mutated",
            },
            "minecraft:water_appearance": {
              surface_color: "#1E6B82",
            },
          },
        },
      },
    },
    {
      id: "the_end",
      slug: "the_end",
      nameCn: "末地",
      category: "末地",
      fileName: "biomes/the_end.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "the_end",
          },
          components: {
            "minecraft:sky_color": {
              sky_color: "#000000",
            },
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_the_end",
            },
            "minecraft:water_appearance": {
              surface_color: "#62529e",
            },
          },
        },
      },
    },
    {
      id: "warm_ocean",
      slug: "warm_ocean",
      nameCn: "暖水海洋",
      category: "水域",
      fileName: "biomes/warm_ocean.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "warm_ocean",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_warm_ocean",
            },
            "minecraft:water_appearance": {
              surface_color: "#02B0E5",
            },
          },
        },
      },
    },
    {
      id: "warped_forest",
      slug: "warped_forest",
      nameCn: "诡异森林",
      category: "下界",
      fileName: "biomes/warped_forest.client_biome.json",
      fileJson: {
        format_version: "1.21.40",
        "minecraft:client_biome": {
          description: {
            identifier: "warped_forest",
          },
          components: {
            "minecraft:fog_appearance": {
              fog_identifier: "minecraft:fog_warped_forest",
            },
            "minecraft:water_appearance": {
              surface_color: "#905957",
            },
          },
        },
      },
    },
  ],
  BIOME_META: {
    bamboo_jungle: {
      name_cn: "竹林",
      category: "丛林沼泽",
      fog_identifier: "minecraft:fog_bamboo_jungle",
      water_color: "#14A2C5",
    },
    bamboo_jungle_hills: {
      name_cn: "竹林丘陵",
      category: "丛林沼泽",
      fog_identifier: "minecraft:fog_bamboo_jungle_hills",
      water_color: "#1B9ED8",
    },
    basalt_deltas: {
      name_cn: "玄武岩三角洲",
      category: "下界",
      fog_identifier: "minecraft:fog_basalt_deltas",
      water_color: "#3f76e4",
    },
    beach: {
      name_cn: "沙滩",
      category: "水域",
      fog_identifier: "minecraft:fog_beach",
      water_color: "#157cab",
    },
    birch_forest: {
      name_cn: "桦木森林",
      category: "森林原野",
      fog_identifier: "minecraft:fog_birch_forest",
      water_color: "#0677ce",
    },
    birch_forest_hills: {
      name_cn: "桦木森林丘陵",
      category: "森林原野",
      fog_identifier: "minecraft:fog_birch_forest_hills",
      water_color: "#0a74c4",
    },
    birch_forest_hills_mutated: {
      name_cn: "变种桦木森林丘陵",
      category: "森林原野",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    birch_forest_mutated: {
      name_cn: "变种桦木森林",
      category: "森林原野",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    cherry_grove: {
      name_cn: "樱花树林",
      category: "森林原野",
      fog_identifier: "minecraft:fog_cherry_grove",
      water_color: "#5db7ef",
    },
    cold_beach: {
      name_cn: "积雪沙滩",
      category: "水域",
      fog_identifier: "minecraft:fog_cold_beach",
      water_color: "#1463a5",
    },
    cold_ocean: {
      name_cn: "冷水海洋",
      category: "水域",
      fog_identifier: "minecraft:fog_cold_ocean",
      water_color: "#2080C9",
    },
    cold_taiga: {
      name_cn: "积雪针叶林",
      category: "冰雪",
      fog_identifier: "minecraft:fog_cold_taiga",
      water_color: "#205e83",
    },
    cold_taiga_hills: {
      name_cn: "积雪的针叶林丘陵",
      category: "冰雪",
      fog_identifier: "minecraft:fog_cold_taiga_hills",
      water_color: "#245b78",
    },
    cold_taiga_mutated: {
      name_cn: "积雪的针叶林山地",
      category: "冰雪",
      fog_identifier: "minecraft:fog_cold_taiga_mutated",
      water_color: "#205e83",
    },
    crimson_forest: {
      name_cn: "绯红森林",
      category: "下界",
      fog_identifier: "minecraft:fog_crimson_forest",
      water_color: "#905957",
    },
    deep_cold_ocean: {
      name_cn: "冷水深海",
      category: "水域",
      fog_identifier: "minecraft:fog_deep_cold_ocean",
      water_color: "#2080C9",
    },
    deep_dark: {
      name_cn: "深暗之域",
      category: "特殊生态",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    deep_frozen_ocean: {
      name_cn: "冰冻深海",
      category: "水域",
      fog_identifier: "minecraft:fog_deep_frozen_ocean",
      water_color: "#2570B5",
    },
    deep_lukewarm_ocean: {
      name_cn: "温水深海",
      category: "水域",
      fog_identifier: "minecraft:fog_deep_lukewarm_ocean",
      water_color: "#0D96DB",
    },
    deep_ocean: {
      name_cn: "深海",
      category: "水域",
      fog_identifier: "minecraft:fog_deep_ocean",
      water_color: "#1787D4",
    },
    deep_warm_ocean: {
      name_cn: "暖水深海",
      category: "水域",
      fog_identifier: "minecraft:fog_deep_warm_ocean",
      water_color: "#02B0E5",
    },
    desert: {
      name_cn: "沙漠",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_desert",
      water_color: "#32A598",
    },
    desert_hills: {
      name_cn: "沙漠丘陵",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_desert_hills",
      water_color: "#1a7aa1",
    },
    desert_mutated: {
      name_cn: "变种沙漠",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    dripstone_caves: {
      name_cn: "滴水石洞穴",
      category: "特殊生态",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    extreme_hills: {
      name_cn: "山地",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_extreme_hills",
      water_color: "#007BF7",
    },
    extreme_hills_edge: {
      name_cn: "山地边缘",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_extreme_hills_edge",
      water_color: "#045cd5",
    },
    extreme_hills_mutated: {
      name_cn: "沙砾山地",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_extreme_hills_mutated",
      water_color: "#0E63AB",
    },
    extreme_hills_plus_trees: {
      name_cn: "繁茂的山地",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_extreme_hills_plus_trees",
      water_color: "#0E63AB",
    },
    extreme_hills_plus_trees_mutated: {
      name_cn: "沙砾山地+",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_extreme_hills_plus_trees_mutated",
      water_color: "#0E63AB",
    },
    flower_forest: {
      name_cn: "繁花森林",
      category: "森林原野",
      fog_identifier: "minecraft:fog_flower_forest",
      water_color: "#20A3CC",
    },
    forest: {
      name_cn: "森林",
      category: "森林原野",
      fog_identifier: "minecraft:fog_forest",
      water_color: "#1E97F2",
    },
    forest_hills: {
      name_cn: "繁茂的丘陵",
      category: "森林原野",
      fog_identifier: "minecraft:fog_forest_hills",
      water_color: "#056bd1",
    },
    frozen_ocean: {
      name_cn: "冻洋",
      category: "水域",
      fog_identifier: "minecraft:fog_frozen_ocean",
      water_color: "#2570B5",
    },
    frozen_peaks: {
      name_cn: "冰封山峰",
      category: "冰雪",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    frozen_river: {
      name_cn: "冻河",
      category: "水域",
      fog_identifier: "minecraft:fog_frozen_river",
      water_color: "#185390",
    },
    grove: {
      name_cn: "雪林",
      category: "森林原野",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    hell: {
      name_cn: "下界荒地",
      category: "下界",
      fog_identifier: "minecraft:fog_hell",
      water_color: "#905957",
    },
    ice_mountains: {
      name_cn: "雪山",
      category: "冰雪",
      fog_identifier: "minecraft:fog_ice_mountains",
      water_color: "#1156a7",
    },
    ice_plains: {
      name_cn: "积雪的冻原",
      category: "冰雪",
      fog_identifier: "minecraft:fog_ice_plains",
      water_color: "#14559b",
    },
    ice_plains_spikes: {
      name_cn: "冰刺之地",
      category: "冰雪",
      fog_identifier: "minecraft:fog_ice_plains_spikes",
      water_color: "#14559b",
    },
    jagged_peaks: {
      name_cn: "尖峭山峰",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    jungle: {
      name_cn: "丛林",
      category: "丛林沼泽",
      fog_identifier: "minecraft:fog_jungle",
      water_color: "#14A2C5",
    },
    jungle_edge: {
      name_cn: "丛林边缘",
      category: "丛林沼泽",
      fog_identifier: "minecraft:fog_jungle_edge",
      water_color: "#0D8AE3",
    },
    jungle_edge_mutated: {
      name_cn: "变种丛林边缘",
      category: "森林原野",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    jungle_hills: {
      name_cn: "丛林丘陵",
      category: "丛林沼泽",
      fog_identifier: "minecraft:fog_jungle_hills",
      water_color: "#1B9ED8",
    },
    jungle_mutated: {
      name_cn: "丛林变种",
      category: "丛林沼泽",
      fog_identifier: "minecraft:fog_jungle_mutated",
      water_color: "#1B9ED8",
    },
    legacy_frozen_ocean: {
      name_cn: "旧版冰封海洋",
      category: "水域",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    lukewarm_ocean: {
      name_cn: "温水海洋",
      category: "水域",
      fog_identifier: "minecraft:fog_lukewarm_ocean",
      water_color: "#0D96DB",
    },
    lush_caves: {
      name_cn: "繁茂洞穴",
      category: "特殊生态",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    mangrove_swamp: {
      name_cn: "红树林沼泽",
      category: "丛林沼泽",
      fog_identifier: "minecraft:fog_mangrove_swamp",
      water_color: "#3a7a6a",
    },
    meadow: {
      name_cn: "草甸",
      category: "森林原野",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    mega_taiga: {
      name_cn: "巨型针叶林",
      category: "森林原野",
      fog_identifier: "minecraft:fog_mega_taiga",
      water_color: "#2d6d77",
    },
    mega_taiga_hills: {
      name_cn: "巨型针叶林丘陵",
      category: "森林原野",
      fog_identifier: "minecraft:fog_mega_taiga_hills",
      water_color: "#286378",
    },
    mesa: {
      name_cn: "恶地",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_mesa",
      water_color: "#4E7F81",
    },
    mesa_bryce: {
      name_cn: "风蚀恶地",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_mesa_bryce",
      water_color: "#497F99",
    },
    mesa_plateau: {
      name_cn: "恶地高原",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_mesa_plateau",
      water_color: "#55809E",
    },
    mesa_plateau_mutated: {
      name_cn: "变种恶地高原",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    mesa_plateau_stone: {
      name_cn: "繁茂的恶地高原",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_mesa_plateau_stone",
      water_color: "#55809E",
    },
    mesa_plateau_stone_mutated: {
      name_cn: "变种林木恶地高原",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    mushroom_island: {
      name_cn: "蘑菇岛",
      category: "特殊生态",
      fog_identifier: "minecraft:fog_mushroom_island",
      water_color: "#8a8997",
    },
    mushroom_island_shore: {
      name_cn: "蘑菇岛岸",
      category: "特殊生态",
      fog_identifier: "minecraft:fog_mushroom_island_shore",
      water_color: "#818193",
    },
    ocean: {
      name_cn: "海洋",
      category: "水域",
      fog_identifier: "minecraft:fog_ocean",
      water_color: "#1787D4",
    },
    pale_garden: {
      name_cn: "苍白花园",
      category: "特殊生态",
      fog_identifier: "minecraft:fog_pale_garden",
      water_color: "#76889D",
    },
    plains: {
      name_cn: "平原",
      category: "森林原野",
      fog_identifier: "minecraft:fog_plains",
      water_color: "#44AFF5",
    },
    redwood_taiga_hills_mutated: {
      name_cn: "变种红木针叶林丘陵",
      category: "森林原野",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    redwood_taiga_mutated: {
      name_cn: "变种红木针叶林",
      category: "森林原野",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    river: {
      name_cn: "河流",
      category: "水域",
      fog_identifier: "minecraft:fog_river",
      water_color: "#0084FF",
    },
    roofed_forest: {
      name_cn: "黑森林",
      category: "森林原野",
      fog_identifier: "minecraft:fog_roofed_forest",
      water_color: "#3B6CD1",
    },
    roofed_forest_mutated: {
      name_cn: "黑森林变种",
      category: "森林原野",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    savanna: {
      name_cn: "热带草原",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_savanna",
      water_color: "#2C8B9C",
    },
    savanna_mutated: {
      name_cn: "破碎的热带草原",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_savanna_mutated",
      water_color: "#2590A8",
    },
    savanna_plateau: {
      name_cn: "热带高原",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_savanna_plateau",
      water_color: "#2590A8",
    },
    savanna_plateau_mutated: {
      name_cn: "变种热带高原",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    snowy_slopes: {
      name_cn: "积雪山坡",
      category: "冰雪",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    soulsand_valley: {
      name_cn: "灵魂沙峡谷",
      category: "下界",
      fog_identifier: "minecraft:fog_soulsand_valley",
      water_color: "#905957",
    },
    stone_beach: {
      name_cn: "石岸",
      category: "水域",
      fog_identifier: "minecraft:fog_stone_beach",
      water_color: "#0d67bb",
    },
    stony_peaks: {
      name_cn: "石质山峰",
      category: "山地干旱",
      fog_identifier: "minecraft:fog_default",
      water_color: "#44AFF5",
    },
    sunflower_plains: {
      name_cn: "向日葵平原",
      category: "森林原野",
      fog_identifier: "minecraft:fog_sunflower_plains",
      water_color: "#44AFF5",
    },
    swampland: {
      name_cn: "沼泽",
      category: "丛林沼泽",
      fog_identifier: "minecraft:fog_swampland",
      water_color: "#4c6559",
    },
    swampland_mutated: {
      name_cn: "沼泽丘陵",
      category: "丛林沼泽",
      fog_identifier: "minecraft:fog_swampland_mutated",
      water_color: "#4c6156",
    },
    taiga: {
      name_cn: "针叶林",
      category: "森林原野",
      fog_identifier: "minecraft:fog_taiga",
      water_color: "#287082",
    },
    taiga_hills: {
      name_cn: "针叶林丘陵",
      category: "森林原野",
      fog_identifier: "minecraft:fog_taiga_hills",
      water_color: "#236583",
    },
    taiga_mutated: {
      name_cn: "针叶林山地",
      category: "森林原野",
      fog_identifier: "minecraft:fog_taiga_mutated",
      water_color: "#1E6B82",
    },
    the_end: {
      name_cn: "末地",
      category: "末地",
      fog_identifier: "minecraft:fog_the_end",
      water_color: "#62529e",
    },
    warm_ocean: {
      name_cn: "暖水海洋",
      category: "水域",
      fog_identifier: "minecraft:fog_warm_ocean",
      water_color: "#02B0E5",
    },
    warped_forest: {
      name_cn: "诡异森林",
      category: "下界",
      fog_identifier: "minecraft:fog_warped_forest",
      water_color: "#905957",
    },
  },
  REFERENCE_PRESETS: [
    {
      id: "movie_warm",
      name: "电影暖黄",
      chips: "你的包 · 太阳 182 · 转向 320 · 浓度 0.083 · 聚性 0.8",
      description:
        "本机电影暖黄抽出来的数  太阳偏暖  轨道约 320  相位 0.8  黄昏地平线是橙红",
      patches: [
        ["lighting", "directional_lights.orbital.sun.illuminance", 182.0],
        [
          "lighting",
          "directional_lights.orbital.orbital_offset_degrees",
          320.0,
        ],
        ["fog", "volumetric.density.air.max_density", 0.083],
        ["fog", "volumetric.henyey_greenstein_g.air.henyey_greenstein_g", 0.8],
      ],
    },
    {
      id: "base",
      name: "原版增强底",
      chips: "安全底 · 太阳 120 · 转向 3 · 浓度 0.04 · 聚性 0.55",
      description:
        "合格创建包那份 JSON  太阳 120  轨道 3 度  浓度 0.04  聚性 0.55",
      patches: [
        ["lighting", "directional_lights.orbital.sun.illuminance", 120.0],
        ["lighting", "directional_lights.orbital.orbital_offset_degrees", 3.0],
        ["fog", "volumetric.density.air.max_density", 0.04],
        ["fog", "volumetric.henyey_greenstein_g.air.henyey_greenstein_g", 0.55],
      ],
    },
    {
      id: "dark_gauze_beam",
      name: "暗纱强光柱",
      chips: "GY 已验收 · 浓度 0.2415 · 聚性 0.72 · 吸收 0.08464 · 饱和 1",
      description:
        "GY 盘里在 3.9 实机通过的强光柱  视频没有暴露吸收 0.08464 对应的具体 RGB 槽  所以只写能唯一定位的浓度与相位",
      patches: [
        ["fog", "volumetric.density.air.max_density", 0.2415],
        ["fog", "volumetric.henyey_greenstein_g.air.henyey_greenstein_g", 0.72],
      ],
    },
    {
      id: "gy39_router",
      name: "3.9强路由",
      chips: "GY 强档 · 太阳 120 · 环境 0.045 · 天空 0.38 · 聚性 0.68",
      description:
        "GY 盘 3.9 强路由  太阳仍是 120  环境光 0.045  天空间接光 0.38  相位 0.68",
      patches: [
        ["lighting", "directional_lights.orbital.sun.illuminance", 120.0],
        ["lighting", "ambient.illuminance", 0.045],
        ["lighting", "sky.intensity", 0.38],
        ["fog", "volumetric.henyey_greenstein_g.air.henyey_greenstein_g", 0.68],
      ],
    },
    {
      id: "cherry_movie_water",
      name: "樱花电影水",
      chips: "GY 组合 · 太阳 152 · 浓度 0.055 · 聚性 0.7 · 日晕 1.1",
      description:
        "GY 樱花丁达尔加水浪  粉色写在散射  太阳 152  相位 0.7  水是浪箱  不是给水面涂色  视频只确认日晕数值但没有唯一暴露对应字段",
      patches: [
        ["lighting", "directional_lights.orbital.sun.illuminance", 152.0],
        ["fog", "volumetric.density.air.max_density", 0.055],
        ["fog", "volumetric.henyey_greenstein_g.air.henyey_greenstein_g", 0.7],
      ],
    },
    {
      id: "heavy_water_beam",
      name: "重水光柱",
      chips: "GY 组合 · 太阳 115 · 浓度 0.058 · 聚性 0.77 · 日晕 9.5",
      description:
        "GY 世界稳定光柱加重水  空气相位 0.77  水自己另有一层浓度  日晕 9.5 的具体 JSON 字段在视频里没有唯一暴露  不猜写",
      patches: [
        ["lighting", "directional_lights.orbital.sun.illuminance", 115.0],
        ["fog", "volumetric.density.air.max_density", 0.058],
        ["fog", "volumetric.henyey_greenstein_g.air.henyey_greenstein_g", 0.77],
      ],
    },
    {
      id: "light_pink_cherry",
      name: "浅粉樱花",
      chips: "GY 樱花 · 太阳 145 · 浓度 0.038 · 聚性 0.63 · 散射 #10090E",
      description:
        "GY 浅粉  粉色只写在散射  浓度只有 0.038  不会把树和草染成一片粉墙  #10090E 按颜色合同精确换成 RGB 0–1",
      patches: [
        ["lighting", "directional_lights.orbital.sun.illuminance", 145.0],
        ["fog", "volumetric.density.air.max_density", 0.038],
        ["fog", "volumetric.henyey_greenstein_g.air.henyey_greenstein_g", 0.63],
        [
          "fog",
          "volumetric.media_coefficients.air.scattering",
          [0.062745, 0.035294, 0.054902],
        ],
      ],
    },
    {
      id: "narrow_beam",
      name: "窄柱强光",
      chips: "GY 窄柱 · 太阳 158 · 浓度 0.135 · 聚性 0.82 · 环境 0.038",
      description: "GY 窄柱  相位 0.82  浓度 0.135  太阳 158  环境光 0.038",
      patches: [
        ["lighting", "directional_lights.orbital.sun.illuminance", 158.0],
        ["fog", "volumetric.density.air.max_density", 0.135],
        ["fog", "volumetric.henyey_greenstein_g.air.henyey_greenstein_g", 0.82],
        ["lighting", "ambient.illuminance", 0.038],
      ],
    },
    {
      id: "wave_box_water",
      name: "浪箱水",
      chips: "GY 水 · 太阳 120 · 浓度 0.04 · 聚性 0.55 · 日晕 1.1",
      description:
        "GY 浪箱  水不是十六进制涂色  是溶解物加波  视频明确给出频率 0.34  牵引 0.72  大水面会晃",
      patches: [
        ["lighting", "directional_lights.orbital.sun.illuminance", 120.0],
        ["fog", "volumetric.density.air.max_density", 0.04],
        ["fog", "volumetric.henyey_greenstein_g.air.henyey_greenstein_g", 0.55],
        ["water", "waves.frequency", 0.34],
        ["water", "waves.pull", 0.72],
      ],
    },
    {
      id: "balanced_climate",
      name: "平衡气候箱",
      chips: "GY 稳档 · 太阳 150 · 浓度 0.048 · 聚性 0.62 · 最浓高 72",
      description:
        "GY 平衡丁达尔  浓度 0.048  相位 0.62  高度带 72–165  室内不该被洗成一块颜色",
      patches: [
        ["lighting", "directional_lights.orbital.sun.illuminance", 150.0],
        ["fog", "volumetric.density.air.max_density", 0.048],
        ["fog", "volumetric.henyey_greenstein_g.air.henyey_greenstein_g", 0.62],
        ["fog", "volumetric.density.air.max_density_height", 72.0],
        ["fog", "volumetric.density.air.zero_density_height", 165.0],
      ],
    },
  ],
  BIOMES: [
    "bamboo_jungle",
    "bamboo_jungle_hills",
    "basalt_deltas",
    "beach",
    "birch_forest",
    "birch_forest_hills",
    "birch_forest_hills_mutated",
    "birch_forest_mutated",
    "cherry_grove",
    "cold_beach",
    "cold_ocean",
    "cold_taiga",
    "cold_taiga_hills",
    "cold_taiga_mutated",
    "crimson_forest",
    "deep_cold_ocean",
    "deep_dark",
    "deep_frozen_ocean",
    "deep_lukewarm_ocean",
    "deep_ocean",
    "deep_warm_ocean",
    "desert",
    "desert_hills",
    "desert_mutated",
    "dripstone_caves",
    "extreme_hills",
    "extreme_hills_edge",
    "extreme_hills_mutated",
    "extreme_hills_plus_trees",
    "extreme_hills_plus_trees_mutated",
    "flower_forest",
    "forest",
    "forest_hills",
    "frozen_ocean",
    "frozen_peaks",
    "frozen_river",
    "grove",
    "hell",
    "ice_mountains",
    "ice_plains",
    "ice_plains_spikes",
    "jagged_peaks",
    "jungle",
    "jungle_edge",
    "jungle_edge_mutated",
    "jungle_hills",
    "jungle_mutated",
    "legacy_frozen_ocean",
    "lukewarm_ocean",
    "lush_caves",
    "mangrove_swamp",
    "meadow",
    "mega_taiga",
    "mega_taiga_hills",
    "mesa",
    "mesa_bryce",
    "mesa_plateau",
    "mesa_plateau_mutated",
    "mesa_plateau_stone",
    "mesa_plateau_stone_mutated",
    "mushroom_island",
    "mushroom_island_shore",
    "ocean",
    "pale_garden",
    "plains",
    "redwood_taiga_hills_mutated",
    "redwood_taiga_mutated",
    "river",
    "roofed_forest",
    "roofed_forest_mutated",
    "savanna",
    "savanna_mutated",
    "savanna_plateau",
    "savanna_plateau_mutated",
    "snowy_slopes",
    "soulsand_valley",
    "stone_beach",
    "stony_peaks",
    "sunflower_plains",
    "swampland",
    "swampland_mutated",
    "taiga",
    "taiga_hills",
    "taiga_mutated",
    "the_end",
    "warm_ocean",
    "warped_forest",
  ],
  COOL_CYAN_GRADE: {
    midtones: {
      contrast: [1.14, 1.14, 1.14],
      gain: [1.06, 1.0, 0.46],
      gamma: [2.05, 2.05, 2.05],
      offset: [0.0, 0.0, 0.0],
      saturation: [1.22, 1.18, 0.36],
    },
    highlights: {
      enabled: true,
      highlightsMin: 1.5,
      contrast: [1.0, 1.0, 1.0],
      gain: [1.14, 1.06, 0.7],
      gamma: [2.2, 2.2, 2.2],
      offset: [0.0, 0.0, 0.0],
      saturation: [1.1, 1.06, 0.52],
    },
    shadows: {
      enabled: true,
      shadowsMax: 0.42,
      contrast: [1.0, 1.0, 1.0],
      gain: [0.8, 0.72, 0.38],
      gamma: [2.2, 2.2, 2.2],
      offset: [0.0, 0.0, 0.0],
      saturation: [0.9, 0.84, 0.4],
    },
    temperature: {
      enabled: true,
      temperature: 3800.0,
      type: "white_balance",
    },
  },
  COOL_CYAN_TONE: "hable",
};
