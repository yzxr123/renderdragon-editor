(function (global) {
  "use strict";

  const core = global.RenderDragonCore;
  const registry = global.RenderDragonPBRRegistry;
  const EYE_RECTS = {
    zombie: [
      [8, 11, 2, 1],
      [13, 11, 2, 1],
    ],
    husk: [
      [8, 11, 2, 1],
      [13, 11, 2, 1],
    ],
    drowned: [
      [8, 11, 2, 1],
      [13, 11, 2, 1],
    ],
    creeper: [
      [8, 11, 2, 2],
      [13, 11, 2, 2],
    ],
    enderman: [
      [8, 11, 3, 1],
      [13, 11, 3, 1],
    ],
    warden: [
      [8, 12, 2, 1],
      [14, 12, 2, 1],
    ],
    spider: [[6, 10, 12, 4]],
  };
  const GLOW_PRESETS = [
    {
      id: "eyes",
      zh: "生物眼部眨眼",
    },
    {
      id: "warden",
      zh: "监守者彩色循环",
    },
    {
      id: "creeper_fuse",
      zh: "苦力怕爆炸闪烁",
    },
    {
      id: "arrow",
      zh: "箭矢自发光",
    },
    {
      id: "ore",
      zh: "矿物呼吸自发光",
    },
    {
      id: "lights",
      zh: "发光材质微光",
    },
    {
      id: "lamps",
      zh: "灯具自发光",
    },
    {
      id: "weapons",
      zh: "武器材质微光",
    },
    {
      id: "hurt_flash",
      zh: "生物受伤红色闪烁",
    },
  ];
  const EXAMPLES = [
    {
      name: "镜面铁块",
      stem: "iron_block",
      kind: "block",
    },
    {
      name: "钻石矿石自发光",
      stem: "diamond_ore",
      kind: "block",
    },
    {
      name: "钻石剑自发光",
      stem: "diamond_sword",
      kind: "item",
    },
    {
      name: "苦力怕眼部自发光",
      stem: "creeper",
      kind: "entity",
    },
  ];
  const sourceMap = core.sourceHandles;
  const thumbCache = new WeakMap();
  const heightDrafts = new WeakMap();
  const fioExtras = new WeakMap();
  let lastRefToken = "";
  function db() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open("RenderDragonStudio", 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains("materials"))
          d.createObjectStore("materials", {
            keyPath: "name",
          });
        if (!d.objectStoreNames.contains("packs"))
          d.createObjectStore("packs", {
            keyPath: "name",
          });
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async function dbAll(store) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction(store, "readonly"),
        r = t.objectStore(store).getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  }
  async function dbGet(store, key) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction(store, "readonly"),
        r = t.objectStore(store).get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  }
  async function dbPut(store, obj) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction(store, "readwrite");
      t.objectStore(store).put(obj);
      t.oncomplete = () => {
        d.close();
        resolve(obj);
      };
      t.onabort = () => {
        d.close();
        reject(t.error || new Error("材质库事务被中止"));
      };
      t.onerror = () => {
        d.close();
        reject(t.error);
      };
    });
  }
  async function dbDel(store, key) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction(store, "readwrite");
      t.objectStore(store).delete(key);
      t.oncomplete = () => {
        d.close();
        resolve(undefined);
      };
      t.onabort = () => {
        d.close();
        reject(t.error || new Error("材质库事务被中止"));
      };
      t.onerror = () => {
        d.close();
        reject(t.error);
      };
    });
  }
  function clamp(n, a, b) {
    n = Number(n);
    return Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
  }
  function basename(rel) {
    return (
      String(rel || "")
        .replace(/\\/g, "/")
        .split("/")
        .pop() || ""
    );
  }
  function stemOf(rel) {
    return basename(rel).replace(/\.[^.]+$/, "");
  }
  function extOf(rel) {
    const m = String(rel)
      .toLowerCase()
      .match(/(\.[^.\/]+)$/);
    return m ? m[1] : "";
  }
  function kindFromRel(rel) {
    return registry.kind(rel);
  }
  const TEXTURE_ZH_EXACT = {
    stone: "石头",
    cobblestone: "圆石",
    bedrock: "基岩",
    dirt: "泥土",
    grass_top: "草方块顶部",
    grass_side: "草方块侧面",
    grass_side_carried: "草方块侧面",
    grass_path_top: "土径顶部",
    grass_path_side: "土径侧面",
    sand: "沙子",
    red_sand: "红沙",
    gravel: "沙砾",
    clay: "黏土",
    snow: "雪",
    ice: "冰",
    packed_ice: "浮冰",
    blue_ice: "蓝冰",
    obsidian: "黑曜石",
    crying_obsidian: "哭泣的黑曜石",
    glowstone: "萤石",
    sea_lantern: "海晶灯",
    shroomlight: "菌光体",
    netherrack: "下界岩",
    soul_sand: "灵魂沙",
    soul_soil: "灵魂土",
    end_stone: "末地石",
    crafting_table_top: "工作台顶部",
    crafting_table_side: "工作台侧面",
    crafting_table_front: "工作台正面",
    furnace_front_on: "熔炉正面点燃",
    furnace_front_off: "熔炉正面",
    furnace_side: "熔炉侧面",
    furnace_top: "熔炉顶部",
    diamond_ore: "钻石矿石",
    deepslate_diamond_ore: "深层钻石矿石",
    iron_ore: "铁矿石",
    deepslate_iron_ore: "深层铁矿石",
    gold_ore: "金矿石",
    deepslate_gold_ore: "深层金矿石",
    coal_ore: "煤矿石",
    deepslate_coal_ore: "深层煤矿石",
    emerald_ore: "绿宝石矿石",
    deepslate_emerald_ore: "深层绿宝石矿石",
    lapis_ore: "青金石矿石",
    deepslate_lapis_ore: "深层青金石矿石",
    redstone_ore: "红石矿石",
    deepslate_redstone_ore: "深层红石矿石",
    iron_block: "铁块",
    gold_block: "金块",
    diamond_block: "钻石块",
    emerald_block: "绿宝石块",
    lapis_block: "青金石块",
    redstone_block: "红石块",
    coal_block: "煤炭块",
    netherite_block: "下界合金块",
    creeper: "苦力怕",
    zombie: "僵尸",
    husk: "尸壳",
    drowned: "溺尸",
    skeleton: "骷髅",
    wither_skeleton: "凋零骷髅",
    enderman: "末影人",
    warden: "监守者",
    spider: "蜘蛛",
    pig: "猪",
    cow: "牛",
    sheep: "羊",
    chicken: "鸡",
    villager: "村民",
    iron_golem: "铁傀儡",
    snow_golem: "雪傀儡",
    diamond_sword: "钻石剑",
    iron_sword: "铁剑",
    golden_sword: "金剑",
    stone_sword: "石剑",
    wooden_sword: "木剑",
    netherite_sword: "下界合金剑",
    bow: "弓",
    crossbow: "弩",
    arrow: "箭",
  };
  Object.assign(TEXTURE_ZH_EXACT, {
    bed_feet_end: "床脚端面",
    bed_head_end: "床头端面",
    big_dripleaf_side1: "大型垂滴叶侧面一",
    big_dripleaf_side2: "大型垂滴叶侧面二",
    big_dripleaf_stem: "大型垂滴叶茎",
    border: "边界方块",
    build_allow: "允许方块",
    build_deny: "拒绝方块",
    chain1: "锁链一",
    chain2: "锁链二",
    coarse_dirt: "砂土",
    compost: "堆肥桶内容",
    compost_ready: "成熟堆肥",
    deadbush: "枯萎的灌木",
    decorated_pot_base: "饰纹陶罐底部",
    endframe_eye: "末地传送门框架之眼",
    eyeblossom_blooming: "盛开的眼眸花",
    eyeblossom_dormant: "闭合的眼眸花",
    eyeblossom_eyes_blooming: "盛开眼眸花花眼",
    eyeblossom_stem_blooming: "盛开眼眸花花茎",
    frogspawn: "青蛙卵",
    frosted_ice_0: "霜冰阶段零",
    frosted_ice_1: "霜冰阶段一",
    frosted_ice_2: "霜冰阶段二",
    frosted_ice_3: "霜冰阶段三",
    hardened_clay: "陶瓦",
    hardened_clay_stained_silver: "淡灰色陶瓦",
    heavy_core: "沉重核心",
    honeycomb: "蜜脾",
    ice_packed: "浮冰",
    itemframe_background: "物品展示框背景",
    jigsaw_lock: "拼图方块锁",
    ladder: "梯子",
    lectern_base: "讲台底部",
    lectern_sides: "讲台侧面",
    lever: "拉杆",
    magma: "岩浆块",
    mob_spawner: "刷怪笼",
    mud: "泥巴",
    nether_sprouts: "下界苗",
    noteblock: "音符盒",
    packed_mud: "泥坯",
    pointed_dripstone_down_base: "向下滴水石锥根部",
    pointed_dripstone_down_frustum: "向下滴水石锥中段",
    pointed_dripstone_down_merge: "向下滴水石锥连接段",
    pointed_dripstone_down_tip: "向下滴水石锥尖端",
    pointed_dripstone_up_base: "向上滴水石锥根部",
    pointed_dripstone_up_frustum: "向上滴水石锥中段",
    pointed_dripstone_up_merge: "向上滴水石锥连接段",
    pointed_dripstone_up_tip: "向上滴水石锥尖端",
    powder_snow: "细雪",
    pumpkin_stem_connected: "南瓜茎连接",
    pumpkin_stem_disconnected: "南瓜茎未连接",
    rail_activator: "激活铁轨",
    rail_activator_powered: "充能激活铁轨",
    rail_detector: "探测铁轨",
    rail_detector_powered: "充能探测铁轨",
    rail_normal_turned: "弯曲铁轨",
    redstone_dust_cross: "红石粉交叉",
    redstone_dust_line: "红石粉直线",
    reeds: "甘蔗",
    resin_clump: "树脂团",
    respawn_anchor_side0: "重生锚侧面零",
    respawn_anchor_side1: "重生锚侧面一",
    respawn_anchor_side2: "重生锚侧面二",
    respawn_anchor_side3: "重生锚侧面三",
    respawn_anchor_side4: "重生锚侧面四",
    sculk: "幽匿块",
    sculk_sensor_tendril_active: "幽匿感测体激活触须",
    sculk_sensor_tendril_inactive: "幽匿感测体未激活触须",
    sculk_vein: "幽匿脉络",
    sea_pickle: "海泡菜",
    seagrass: "海草",
    short_dry_grass: "矮枯草",
    slime: "黏液块",
    sponge: "海绵",
    sponge_wet: "湿海绵",
    spore_blossom: "孢子花",
    spore_blossom_base: "孢子花底部",
    stonebrick: "石砖",
    stonebrick_carved: "雕纹石砖",
    stonecutter2_saw: "切石机锯片",
    structure_air: "结构空气",
    structure_void: "结构空位",
    suspicious_gravel_0: "可疑的沙砾阶段零",
    suspicious_gravel_1: "可疑的沙砾阶段一",
    suspicious_gravel_2: "可疑的沙砾阶段二",
    suspicious_gravel_3: "可疑的沙砾阶段三",
    suspicious_sand_0: "可疑的沙子阶段零",
    suspicious_sand_1: "可疑的沙子阶段一",
    suspicious_sand_2: "可疑的沙子阶段二",
    suspicious_sand_3: "可疑的沙子阶段三",
    tall_dry_grass: "高枯草",
    tallgrass: "高草丛",
    torchflower: "火把花",
    trip_wire: "绊线",
    trip_wire_source: "绊线钩",
    vine: "藤蔓",
    waterlily: "睡莲",
    web: "蜘蛛网",
    wildflowers: "野花",
    wildflowers_stem: "野花茎",
    candle: "蜡烛",
  });
  const TEXTURE_ZH_PHRASES = [
    ["cobbled_deepslate", "深板岩圆石"],
    ["polished_deepslate", "磨制深板岩"],
    ["deepslate_bricks", "深板岩砖"],
    ["deepslate_tiles", "深板岩瓦"],
    ["reinforced_deepslate", "强化深板岩"],
    ["polished_blackstone_bricks", "磨制黑石砖"],
    ["polished_blackstone", "磨制黑石"],
    ["gilded_blackstone", "镶金黑石"],
    ["dark_prismarine", "暗海晶石"],
    ["prismarine_bricks", "海晶石砖"],
    ["red_nether_bricks", "红色下界砖"],
    ["nether_bricks", "下界砖"],
    ["red_sandstone", "红砂岩"],
    ["smooth_sandstone", "平滑砂岩"],
    ["cut_sandstone", "切制砂岩"],
    ["dark_oak", "深色橡木"],
    ["pale_oak", "苍白橡木"],
    ["fence_gate", "栅栏门"],
    ["pressure_plate", "压力板"],
    ["stained_glass_pane", "染色玻璃板"],
    ["stained_glass", "染色玻璃"],
    ["light_blue", "淡蓝色"],
    ["light_gray", "淡灰色"],
    ["hanging_sign", "悬挂告示牌"],
    ["redstone_lamp", "红石灯"],
    ["redstone_torch", "红石火把"],
    ["redstone_ore", "红石矿石"],
    ["sea_lantern", "海晶灯"],
    ["magma_block", "岩浆块"],
    ["mossy_cobblestone", "苔石圆石"],
    ["mossy_stone_bricks", "苔石砖"],
    ["stone_bricks", "石砖"],
    ["end_stone", "末地石"],
    ["ancient_debris", "远古残骸"],
    ["nether_gold_ore", "下界金矿石"],
    ["nether_quartz_ore", "下界石英矿石"],
    ["raw_iron", "粗铁"],
    ["raw_gold", "粗金"],
    ["raw_copper", "粗铜"],
  ];
  const TEXTURE_ZH_TOKENS = {
    acacia: "金合欢木",
    oak: "橡木",
    spruce: "云杉木",
    birch: "白桦木",
    jungle: "丛林木",
    mangrove: "红树木",
    cherry: "樱花木",
    bamboo: "竹",
    crimson: "绯红",
    warped: "诡异",
    planks: "木板",
    plank: "木板",
    log: "原木",
    wood: "木",
    leaves: "树叶",
    leaf: "树叶",
    sapling: "树苗",
    door: "门",
    trapdoor: "活板门",
    fence: "栅栏",
    gate: "门",
    sign: "告示牌",
    button: "按钮",
    slab: "台阶",
    stairs: "楼梯",
    wall: "墙",
    bricks: "砖",
    brick: "砖",
    tiles: "瓦",
    tile: "瓦",
    block: "块",
    ore: "矿石",
    raw: "粗矿",
    iron: "铁",
    gold: "金",
    golden: "金",
    copper: "铜",
    diamond: "钻石",
    emerald: "绿宝石",
    lapis: "青金石",
    coal: "煤炭",
    quartz: "石英",
    netherite: "下界合金",
    amethyst: "紫水晶",
    stone: "石头",
    cobblestone: "圆石",
    deepslate: "深板岩",
    blackstone: "黑石",
    granite: "花岗岩",
    diorite: "闪长岩",
    andesite: "安山岩",
    tuff: "凝灰岩",
    calcite: "方解石",
    basalt: "玄武岩",
    obsidian: "黑曜石",
    prismarine: "海晶石",
    sandstone: "砂岩",
    netherrack: "下界岩",
    purpur: "紫珀",
    terracotta: "陶瓦",
    concrete: "混凝土",
    wool: "羊毛",
    carpet: "地毯",
    glass: "玻璃",
    pane: "玻璃板",
    moss: "苔藓",
    mossy: "苔石",
    polished: "磨制",
    smooth: "平滑",
    chiseled: "雕纹",
    cracked: "裂纹",
    cut: "切制",
    waxed: "涂蜡",
    exposed: "斑驳",
    weathered: "锈蚀",
    oxidized: "氧化",
    black: "黑色",
    blue: "蓝色",
    brown: "棕色",
    cyan: "青色",
    gray: "灰色",
    green: "绿色",
    lime: "黄绿色",
    magenta: "品红色",
    orange: "橙色",
    pink: "粉红色",
    purple: "紫色",
    red: "红色",
    white: "白色",
    yellow: "黄色",
    top: "顶部",
    bottom: "底部",
    side: "侧面",
    front: "正面",
    back: "背面",
    inner: "内侧",
    outer: "外侧",
    on: "点亮",
    off: "熄灭",
    open: "打开",
    closed: "关闭",
    lit: "点亮",
    zombie: "僵尸",
    husk: "尸壳",
    drowned: "溺尸",
    creeper: "苦力怕",
    enderman: "末影人",
    warden: "监守者",
    skeleton: "骷髅",
    wither: "凋零",
    spider: "蜘蛛",
    villager: "村民",
    golem: "傀儡",
    pig: "猪",
    cow: "牛",
    sheep: "羊",
    chicken: "鸡",
    sword: "剑",
    pickaxe: "镐",
    axe: "斧",
    shovel: "锹",
    hoe: "锄",
    helmet: "头盔",
    chestplate: "胸甲",
    leggings: "护腿",
    boots: "靴子",
    bow: "弓",
    crossbow: "弩",
    arrow: "箭",
    shield: "盾牌",
    torch: "火把",
    lantern: "灯笼",
    campfire: "营火",
    bookshelf: "书架",
    chest: "箱子",
    barrel: "木桶",
    furnace: "熔炉",
    crafting: "工作",
    table: "台",
    farmland: "耕地",
    water: "水",
    lava: "熔岩",
    flower: "花",
    bush: "灌木",
    plant: "植物",
    fern: "蕨",
    vines: "藤蔓",
    berries: "浆果",
    cactus: "仙人掌",
    wheat: "小麦",
    carrots: "胡萝卜",
    potatoes: "马铃薯",
    beetroots: "甜菜根",
    melon: "西瓜",
    kelp: "海带",
    roots: "根",
    chorus: "紫颂",
    portal: "传送门",
    gateway: "折跃门",
    rod: "杆",
    beacon: "信标",
    barrier: "屏障",
    anvil: "铁砧",
    brewing: "酿造",
    stand: "台",
    hopper: "漏斗",
    conduit: "潮涌核心",
    crafter: "合成器",
    grindstone: "砂轮",
    fire: "火焰",
    glow: "发光",
    frame: "物品展示框",
    item: "物品",
    egg: "蛋",
    spawn: "生成",
    bucket: "桶",
    potion: "药水",
    bottle: "瓶",
    splash: "喷溅",
    lingering: "滞留",
    banner: "旗帜",
    pottery: "陶器",
    pattern: "纹样",
    sherd: "陶片",
    armor: "盔甲",
    trim: "纹饰",
    smithing: "锻造",
    template: "模板",
    horse: "马",
    wolf: "狼",
    rabbit: "兔",
    panda: "熊猫",
    bee: "蜜蜂",
    guardian: "守卫者",
    piglin: "猪灵",
    ghast: "恶魂",
    breeze: "旋风人",
    strider: "炽足兽",
    stage: "阶段",
    state: "状态",
    left: "左侧",
    right: "右侧",
    middle: "中部",
    vertical: "垂直",
    horizontal: "水平",
    dead: "枯萎",
    dried: "干燥",
    carried: "携带",
    placeholder: "占位",
  };
  function textureZh(stem, rel, kind) {
    const raw = String(stem || "").toLowerCase();
    if (TEXTURE_ZH_EXACT[raw]) return TEXTURE_ZH_EXACT[raw];
    const wood = {
      acacia: "金合欢木",
      birch: "白桦木",
      dark_oak: "深色橡木",
      darkoak: "深色橡木",
      big_oak: "深色橡木",
      jungle: "丛林木",
      spruce: "云杉木",
      oak: "橡木",
      wood: "橡木",
      mangrove: "红树木",
      cherry: "樱花木",
      pale_oak: "苍白橡木",
      bamboo: "竹",
    };
    let m = raw.match(
      /^door_(acacia|birch|dark_oak|jungle|spruce|wood)_(lower|upper)$/,
    );
    if (m) return wood[m[1]] + "门" + (m[2] === "upper" ? "上半" : "下半");
    m = raw.match(
      /^(planks|log|leaves|sapling)_(acacia|birch|big_oak|dark_oak|jungle|spruce|oak|mangrove|cherry|pale_oak)(?:_(top|carried|opaque))?$/,
    );
    if (m) {
      const noun = {
          planks: "木板",
          log: "原木",
          leaves: "树叶",
          sapling: "树苗",
        }[m[1]],
        suffix =
          {
            top: "顶部",
            carried: "携带",
            opaque: "不透明",
          }[m[3]] || "";
      return wood[m[2]] + noun + suffix;
    }
    m = raw.match(/^sign_(acacia|birch|darkoak|jungle|spruce|oak)$/);
    if (m) return wood[m[1]] + "告示牌";
    m = raw.match(
      /^(fence_gate|trapdoor|door|sign)_(acacia|birch|dark_oak|darkoak|big_oak|jungle|spruce|oak|wood|mangrove|cherry|pale_oak|bamboo)$/,
    );
    if (m) {
      const noun = {
        fence_gate: "栅栏门",
        trapdoor: "活板门",
        door: "门",
        sign: "告示牌",
      }[m[1]];
      return wood[m[2]] + noun;
    }
    m = raw.match(
      /^(acacia|birch|dark_oak|darkoak|big_oak|jungle|spruce|oak|wood|mangrove|cherry|pale_oak|bamboo)_(fence_gate|trapdoor|door|sign)$/,
    );
    if (m) {
      const noun = {
        fence_gate: "栅栏门",
        trapdoor: "活板门",
        door: "门",
        sign: "告示牌",
      }[m[2]];
      return wood[m[1]] + noun;
    }
    let work = "_" + raw + "_";
    for (const [en, zh] of TEXTURE_ZH_PHRASES)
      work = work.split("_" + en + "_").join("_" + zh + "_");
    let tokens = work
      .replace(/^_+|_+$/g, "")
      .split("_")
      .filter(Boolean);
    let known = 0;
    const out = tokens.map((t) => {
      if (/[\u3400-\u9fff]/.test(t)) {
        known++;
        return t;
      }
      if (TEXTURE_ZH_TOKENS[t]) {
        known++;
        return TEXTURE_ZH_TOKENS[t];
      }
      if (/^\d+$/.test(t)) return t;
      return t;
    });
    if (!known) return String(stem || "");
    return out.join("");
  }
  function textureSearchZh(stem, rel, kind) {
    const zh = textureZh(stem, rel, kind),
      k =
        kind === "ui"
          ? "UI"
          : kind === "entity"
            ? "生物展开图"
            : kind === "item"
              ? "物品贴图"
              : kind === "block"
                ? "方块纹理"
                : kind === "particle"
                  ? "粒子贴图"
                  : "其他纹理";
    const aliases = [zh, k];
    return Array.from(new Set(aliases.filter(Boolean))).join(" ");
  }
  function colorRelFor(kind, stem) {
    if (kind === "ui") return "textures/ui/" + stem + ".png";
    if (kind === "item") return "textures/items/" + stem + ".png";
    if (kind === "entity") return "textures/entity/" + stem + ".png";
    if (kind === "block") return "textures/blocks/" + stem + ".png";
    if (kind === "particle") return "textures/particle/" + stem + ".png";
    return "textures/" + stem + ".png";
  }
  function dataUrlFromBlob(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
  }
  async function blobFromDataUrl(url) {
    return fetch(url).then((r) => r.blob());
  }
  function decodeTga(bytes) {
    if (bytes.length < 18) throw new Error("TGA 文件头被截断");
    const idlen = bytes[0],
      cmap = bytes[1],
      type = bytes[2],
      w = bytes[12] | (bytes[13] << 8),
      h = bytes[14] | (bytes[15] << 8),
      bpp = bytes[16],
      desc = bytes[17],
      pxSize = bpp >> 3;
    if (
      cmap !== 0 ||
      ![2, 3, 10, 11].includes(type) ||
      ![1, 3, 4].includes(pxSize)
    )
      throw new Error("暂不支持这个 TGA 编码");
    if (!w || !h || w * h > 16777216) throw new Error("TGA 尺寸无效或过大");
    let pos = 18 + idlen;
    const rgba = new Uint8ClampedArray(w * h * 4),
      top = !!(desc & 0x20),
      right = !!(desc & 0x10);
    let idx = 0;
    function writePixel(arr) {
      if (arr.length !== pxSize) throw new Error("TGA 像素数据被截断");
      let r,
        g,
        b,
        a = 255;
      if (pxSize === 1) {
        r = g = b = arr[0];
      } else {
        b = arr[0];
        g = arr[1];
        r = arr[2];
        if (pxSize === 4) a = arr[3];
      }
      const x0 = idx % w,
        y0 = Math.floor(idx / w),
        x = right ? w - 1 - x0 : x0,
        y = top ? y0 : h - 1 - y0,
        o = (y * w + x) * 4;
      rgba[o] = r;
      rgba[o + 1] = g;
      rgba[o + 2] = b;
      rgba[o + 3] = a;
      idx++;
    }
    if (type === 2 || type === 3) {
      while (idx < w * h) {
        writePixel(bytes.slice(pos, pos + pxSize));
        pos += pxSize;
      }
    } else {
      while (idx < w * h) {
        if (pos >= bytes.length) throw new Error("TGA RLE 数据被截断");
        const head = bytes[pos++],
          count = (head & 0x7f) + 1;
        if (idx + count > w * h) throw new Error("TGA RLE 像素计数超出范围");
        if (head & 0x80) {
          const p = bytes.slice(pos, pos + pxSize);
          pos += pxSize;
          for (let i = 0; i < count && idx < w * h; i++) writePixel(p);
        } else {
          for (let i = 0; i < count && idx < w * h; i++) {
            writePixel(bytes.slice(pos, pos + pxSize));
            pos += pxSize;
          }
        }
      }
    }
    return new ImageData(rgba, w, h);
  }
  function encodeTga(img) {
    const w = img.width,
      h = img.height,
      out = new Uint8Array(18 + w * h * 4);
    out[2] = 2;
    out[12] = w & 255;
    out[13] = w >> 8;
    out[14] = h & 255;
    out[15] = h >> 8;
    out[16] = 32;
    out[17] = 0x28;
    let p = 18;
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      out[p++] = img.data[o + 2];
      out[p++] = img.data[o + 1];
      out[p++] = img.data[o];
      out[p++] = img.data[o + 3];
    }
    return out;
  }
  async function imageDataFromBlob(blob, ext = "") {
    const signature = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
    if (
      signature[0] === 137 &&
      signature[1] === 80 &&
      signature[2] === 78 &&
      signature[3] === 71
    )
      return global.RenderDragonPNG.decode(await blob.arrayBuffer());
    if (ext === ".tga") {
      return decodeTga(new Uint8Array(await blob.arrayBuffer()));
    }
    const bm = await createImageBitmap(blob);
    const c = document.createElement("canvas");
    c.width = bm.width;
    c.height = bm.height;
    const x = c.getContext("2d", {
      willReadFrequently: true,
    });
    x.drawImage(bm, 0, 0);
    bm.close && bm.close();
    return x.getImageData(0, 0, c.width, c.height);
  }
  async function imageDataFromFile(root, rel) {
    const h = await core.getFileHandle(root, rel, false),
      f = await h.getFile();
    return imageDataFromBlob(f, extOf(rel));
  }
  async function materialColor(root, rel) {
    const owner = textureSetRel(rel),
      doc = await core.readJson(root, owner, {}),
      body = doc["minecraft:texture_set"] || {};
    const ref = await registry.resolve(root, owner, body.color, true),
      fixed = registry.uniform(body.color, 4, [0, 0, 0, 255]);
    const hasImage = await core.exists(root, rel),
      image = ref
        ? await imageDataFromFile(root, ref)
        : hasImage
          ? await imageDataFromFile(root, rel)
          : null;
    if (fixed)
      return {
        image: blankImage(image?.width || 16, image?.height || 16, ...fixed),
        rel: ref || rel,
      };
    if (!image) throw new Error("材质没有可读取的颜色层 " + owner);
    if (
      !(await core.exists(root, owner)) &&
      global.RenderDragonTargets.detectFIO(image)
    ) {
      const decoded = global.RenderDragonTargets.unpackFIO(image);
      let extra = fioExtras.get(root);
      if (!extra) {
        extra = new Map();
        fioExtras.set(root, extra);
      }
      extra.set(owner, {
        fioBlue: decoded.fioBlue,
      });
      return {
        image: decoded.color,
        rel: ref || rel,
        fio: decoded,
      };
    }
    return {
      image,
      rel: ref || rel,
    };
  }
  async function imageDataFromDataUrl(url) {
    return imageDataFromBlob(await blobFromDataUrl(url));
  }
  async function pngBlob(img) {
    return global.RenderDragonPNG.encode(img);
  }
  async function imageDataUrl(img) {
    return dataUrlFromBlob(await pngBlob(img));
  }
  function blankImage(w, h, r = 0, g = r, b = r, a = 255) {
    const d = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      d[o] = r;
      d[o + 1] = g;
      d[o + 2] = b;
      d[o + 3] = a;
    }
    return new ImageData(d, w, h);
  }
  function resizeImage(src, w, h) {
    if (src.width === w && src.height === h) return src;
    const out = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const a =
            (Math.floor((y * src.height) / h) * src.width +
              Math.floor((x * src.width) / w)) *
            4,
          b = (y * w + x) * 4;
        for (let k = 0; k < 4; k++) out[b + k] = src.data[a + k];
      }
    return new ImageData(out, w, h);
  }
  function grayFromImage(src) {
    const d = new Uint8ClampedArray(src.width * src.height * 4);
    for (let i = 0; i < src.width * src.height; i++) {
      const o = i * 4,
        v = Math.round(
          src.data[o] * 0.299 +
            src.data[o + 1] * 0.587 +
            src.data[o + 2] * 0.114,
        );
      d[o] = d[o + 1] = d[o + 2] = v;
      d[o + 3] = 255;
    }
    return new ImageData(d, src.width, src.height);
  }
  function channelGray(src, ch) {
    const d = new Uint8ClampedArray(src.width * src.height * 4);
    for (let i = 0; i < src.width * src.height; i++) {
      const o = i * 4,
        v = src.data[o + ch];
      d[o] = d[o + 1] = d[o + 2] = v;
      d[o + 3] = 255;
    }
    return new ImageData(d, src.width, src.height);
  }
  function combineMer(m, e, r, s, w, h) {
    return global.RenderDragonMERS.pack(
      {
        metal: m,
        emissive: e,
        roughness: r,
        sub: s,
      },
      w,
      h,
    );
  }
  function normalFromHeight(height, strength = 2.2) {
    const g = grayFromImage(height),
      w = g.width,
      h = g.height,
      d = new Uint8ClampedArray(w * h * 4),
      val = (x, y) =>
        g.data[
          (Math.max(0, Math.min(h - 1, y)) * w +
            Math.max(0, Math.min(w - 1, x))) *
            4
        ];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const sx =
          val(x + 1, y - 1) +
          2 * val(x + 1, y) +
          val(x + 1, y + 1) -
          (val(x - 1, y - 1) + 2 * val(x - 1, y) + val(x - 1, y + 1));
        const sy =
          val(x - 1, y + 1) +
          2 * val(x, y + 1) +
          val(x + 1, y + 1) -
          (val(x - 1, y - 1) + 2 * val(x, y - 1) + val(x + 1, y - 1));
        let nx = (-sx / 255) * strength,
          ny = (-sy / 255) * strength,
          nz = 1,
          len = Math.hypot(nx, ny, nz) || 1;
        nx /= len;
        ny /= len;
        nz /= len;
        const o = (y * w + x) * 4;
        d[o] = Math.round((nx * 0.5 + 0.5) * 255);
        d[o + 1] = Math.round((ny * 0.5 + 0.5) * 255);
        d[o + 2] = Math.round((nz * 0.5 + 0.5) * 255);
        d[o + 3] = 255;
      }
    return new ImageData(d, w, h);
  }
  function equalPixels(a, b) {
    return (
      !!a &&
      !!b &&
      a.width === b.width &&
      a.height === b.height &&
      a.data.every((v, i) => v === b.data[i])
    );
  }
  async function writeImage(root, rel, img, options = {}) {
    if (
      !img ||
      img.width < 1 ||
      img.height < 1 ||
      img.width * img.height > 16777216
    )
      throw new Error("贴图尺寸无效或超过 1600 万像素");
    if (await core.exists(root, rel)) {
      const current = await imageDataFromFile(root, rel);
      if (
        equalPixels(current, img) &&
        (options.colorType == null ||
          (await core.readBytes(root, rel))[25] === options.colorType)
      )
        return false;
    }
    const baseline = global.RenderDragonWorkspace?.session?.baseRoot;
    if (
      root.__rdWorkspace &&
      baseline &&
      (await core.exists(baseline, rel)) &&
      equalPixels(await imageDataFromFile(baseline, rel), img) &&
      (options.colorType == null ||
        (await core.readBytes(baseline, rel))[25] === options.colorType)
    ) {
      await core.writeBytes(root, rel, await core.readBytes(baseline, rel));
      return true;
    }
    const ext = extOf(rel);
    if (ext === ".tga") await core.writeBytes(root, rel, encodeTga(img));
    else
      await core.writeBytes(
        root,
        rel,
        await global.RenderDragonPNG.encode(img, options),
      );
    return true;
  }
  function textureSetRel(colorRel) {
    return registry.setPath(colorRel);
  }
  const PBR_EDITOR_META = "renderdragon_pbr_editor.json";
  async function pbrEditorMeta(root) {
    const d = await core.readJson(root, PBR_EDITOR_META, {
      format_version: 1,
      source_sizes: {},
    });
    d.source_sizes =
      d.source_sizes && typeof d.source_sizes === "object"
        ? d.source_sizes
        : {};
    return d;
  }
  async function setPbrSourceSize(root, rel, w, h, meta) {
    const d = meta || (await pbrEditorMeta(root));
    d.source_sizes[rel] = {
      w: Math.max(1, Number(w) || 1),
      h: Math.max(1, Number(h) || 1),
    };
    d.updated = Date.now();
    if (!meta) await core.writeJson(root, PBR_EDITOR_META, d);
    return d;
  }
  async function readAux(root, colorRel) {
    const owner = textureSetRel(colorRel),
      registered = await core.exists(root, owner);
    const ts = registered ? await core.readJson(root, owner) : {},
      body = registered ? registry.validate(ts, owner) : {};
    const contract = registered
      ? await registry.imageContracts(root, owner, ts)
      : {
          images: {},
          warnings: [],
        };
    const readColor = await materialColor(root, colorRel),
      color = readColor.image,
      resolvedColor = readColor.rel;
    const w = color.width,
      h = color.height,
      defaults = await registry.fallback(root, colorRel);
    if (readColor.fio)
      return Object.assign(readColor.fio, {
        heightSource: "default",
        merMode: "mers",
        bump: "normal",
        ts: {},
        registered: false,
        defaults,
        resolvedColor: colorRel,
        merSource: "op_fio",
        contract: {
          images: {},
          warnings: [],
        },
        sourceMode: "FIO",
        fio: true,
      });
    const hasMers = body[registry.MERS] != null,
      explicit = hasMers || body[registry.MER] != null;
    const mer = explicit
      ? hasMers
        ? body[registry.MERS]
        : body[registry.MER]
      : defaults.value;
    const merMode = await registry.materialMode(root, colorRel, ts);
    let metal = blankImage(w, h, 0),
      emissive = blankImage(w, h, 0),
      roughness = blankImage(w, h, 255),
      sub = blankImage(w, h, 0);
    let height = blankImage(w, h, 128),
      normal = blankImage(w, h, 128, 128, 255, 255),
      bump = "none";
    const fixed = registry.uniform(mer, explicit && !hasMers ? 3 : 4);
    if (fixed) {
      metal = blankImage(w, h, fixed[0]);
      emissive = blankImage(w, h, fixed[1]);
      roughness = blankImage(w, h, fixed[2]);
      sub = blankImage(w, h, fixed[3] ?? 0);
    } else {
      const ref = await registry.resolve(root, owner, mer, true),
        im = resizeImage(await imageDataFromFile(root, ref), w, h);
      metal = channelGray(im, 0);
      emissive = channelGray(im, 1);
      roughness = channelGray(im, 2);
      sub =
        hasMers && !contract.images[registry.MERS]?.missingAlpha
          ? channelGray(im, 3)
          : blankImage(w, h, 0);
    }
    const nr = await registry.resolve(root, owner, body.normal, true);
    if (nr) {
      normal = resizeImage(await imageDataFromFile(root, nr), w, h);
      bump = "normal";
    }
    const hr = await registry.resolve(root, owner, body.heightmap, true),
      hv = registry.uniform(body.heightmap, 1);
    if (hr) {
      height = resizeImage(
        grayFromImage(await imageDataFromFile(root, hr)),
        w,
        h,
      );
      bump = "heightmap";
    } else if (hv) {
      height = blankImage(w, h, hv[0]);
      bump = "heightmap";
    }
    const draft = heightDrafts.get(root)?.get(owner);
    let heightSource = bump === "heightmap" ? "registered" : "default";
    if (bump === "normal" && draft && equalPixels(normal, draft.normal)) {
      height = resizeImage(draft.height, w, h);
      heightSource = "generated";
    }
    return {
      color,
      metal,
      emissive,
      roughness,
      sub,
      height,
      normal,
      heightSource,
      merMode,
      bump,
      ts,
      registered,
      defaults,
      fioBlue: fioExtras.get(root)?.get(owner)?.fioBlue,
      resolvedColor: resolvedColor || colorRel,
      merSource: explicit ? "texture_set" : defaults.source,
      contract,
      sourceMode: hasMers
        ? "MERS"
        : body[registry.MER] != null
          ? "MER"
          : merMode === "mers"
            ? "分类默认"
            : "普通纹理",
    };
  }
  function versionAtLeast(a, b) {
    const aa = String(a || "0")
        .split(".")
        .map(Number),
      bb = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if ((aa[i] || 0) > (bb[i] || 0)) return a;
      if ((aa[i] || 0) < (bb[i] || 0)) return b;
    }
    return a || b;
  }
  async function textureListIndex(root) {
    const doc = await core.readJson(root, "textures/textures_list.json", []);
    if (!Array.isArray(doc)) return [];
    const out = [];
    for (const raw of doc) {
      let rel = String(raw || "")
        .trim()
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");
      if (!rel) continue;
      if (!rel.startsWith("textures/")) rel = "textures/" + rel;
      out.push(rel);
    }
    return out;
  }
  async function scanTexturesUncached(root) {
    if (!root) return [];
    const graph = await registry.index(root),
      rows = await core.walk(root, "textures", {
        filter: (rel) =>
          registry.IMAGE.test(rel) &&
          (!registry.auxiliary(graph, rel) ||
            graph.sets.has(textureSetRel(rel))),
      });
    for (const [owner] of graph.sets) {
      const logical = owner.slice(0, -registry.SET_SUFFIX.length);
      if (!rows.some((row) => registry.stem(row.rel) === logical))
        rows.push({
          rel: logical + ".png",
          virtual: true,
        });
    }
    // 颜色图只是另一个注册材质的底图时  以注册名展示  不制造一个错误的无 PBR 副本
    for (let i = rows.length - 1; i >= 0; i--) {
      const rel = rows[i].rel;
      if (
        graph.sets.has(textureSetRel(rel)) ||
        graph.animations.has(rel) ||
        graph.roles.get(rel)?.has("atlas")
      )
        continue;
      if (
        [...(graph.reverse.get(rel) || [])].some((owner) =>
          registry
            .candidates(owner, graph.sets.get(owner)?.body.color)
            .includes(rel),
        )
      )
        rows.splice(i, 1);
    }
    rows.sort((a, b) =>
      String(a.rel).localeCompare(String(b.rel), "zh-Hans-CN", {
        numeric: true,
        sensitivity: "base",
      }),
    );
    const preferred = new Map();
    for (const row of rows) {
      const key = registry.stem(row.rel).toLowerCase(),
        old = preferred.get(key);
      if (!old || (/\.tga$/i.test(row.rel) && !/\.tga$/i.test(old.rel)))
        preferred.set(key, row);
    }
    rows.splice(
      0,
      rows.length,
      ...rows.filter(
        (row) => preferred.get(registry.stem(row.rel).toLowerCase()) === row,
      ),
    );
    const byRel = new Map(),
      byBase = new Map();
    for (const r of rows) {
      byRel.set(r.rel.toLowerCase(), r.rel);
      const base = registry.stem(r.rel).toLowerCase();
      if (!byBase.has(base)) byBase.set(base, r.rel);
    }
    const ordered = [],
      seen = new Set();
    for (const entry of await textureListIndex(root)) {
      const rel =
        byRel.get(entry.toLowerCase()) ||
        byBase.get(registry.stem(entry).toLowerCase());
      if (rel && !seen.has(rel)) {
        seen.add(rel);
        ordered.push(rel);
      }
    }
    for (const row of rows)
      if (!seen.has(row.rel)) {
        seen.add(row.rel);
        ordered.push(row.rel);
      }
    return ordered.map((rel, i) => {
      const stem = stemOf(rel),
        kind = kindFromRel(rel);
      return {
        stem,
        zh: textureZh(stem, rel, kind),
        search_zh: textureSearchZh(stem, rel, kind),
        kind,
        rel,
        thumb: "",
        common: i < 24,
        extra: false,
        water: /water/i.test(stem),
        vanilla:
          !!root.__rdWorkspace &&
          !global.RenderDragonWorkspace.session.sourcePaths.has(rel) &&
          !global.RenderDragonWorkspace.session.sourcePaths.has(
            textureSetRel(rel),
          ),
        flipbook: graph.animations.has(rel),
        registered: graph.sets.has(textureSetRel(rel)),
        origin: root.store?.overlay.has(rel)
          ? "modified"
          : root.__rdWorkspace &&
              !global.RenderDragonWorkspace.session.sourcePaths.has(rel) &&
              !global.RenderDragonWorkspace.session.sourcePaths.has(
                textureSetRel(rel),
              )
            ? "catalog"
            : "source",
      };
    });
  }
  const textureScanCache = new WeakMap();
  async function scanTextures(root) {
    if (!root) return [];
    const revision = root.store?.cacheGeneration ?? root.store?.revision ?? -1,
      old = textureScanCache.get(root);
    if (old && old.revision === revision) return old.promise;
    const promise = scanTexturesUncached(root);
    textureScanCache.set(root, {
      revision,
      promise,
    });
    try {
      return await promise;
    } catch (error) {
      textureScanCache.delete(root);
      throw error;
    }
  }
  async function textureThumb(root, rel, size = 88) {
    if (!root || !rel) return "";
    size = Math.max(32, Math.min(320, Number(size) || 88));
    let cache = thumbCache.get(root);
    if (!cache) {
      cache = new Map();
      thumbCache.set(root, cache);
    }
    const stamp = root.store?.cacheGeneration ?? null;
    const key = rel + "@" + size;
    const old = cache.get(key);
    if (old && old.stamp === stamp) return old.url;
    const src = (await materialColor(root, rel)).image,
      sw = src.width,
      sh = src.height,
      scale = size / Math.max(sw, sh),
      dw = Math.max(1, Math.round(sw * scale)),
      dh = Math.max(1, Math.round(sh * scale));
    const a = document.createElement("canvas"),
      b = document.createElement("canvas");
    a.width = sw;
    a.height = sh;
    a.getContext("2d").putImageData(src, 0, 0);
    b.width = size;
    b.height = size;
    const x = b.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.clearRect(0, 0, size, size);
    x.drawImage(
      a,
      Math.floor((size - dw) / 2),
      Math.floor((size - dh) / 2),
      dw,
      dh,
    );
    const url = b.toDataURL("image/png");
    cache.set(key, {
      stamp,
      url,
    });
    return url;
  }
  async function textureDoc(root, data) {
    let rel = data.rel || "";
    if (!rel) {
      const rows = await scanTextures(root);
      const row = rows.find(
        (x) =>
          x.stem === data.stem && (data.kind ? x.kind === data.kind : true),
      );
      if (row) rel = row.rel;
    }
    if (
      !rel ||
      (!(await core.exists(root, rel)) &&
        !(await core.exists(root, textureSetRel(rel))))
    )
      return {
        ok: false,
        reason: "当前资源包中未找到该纹理",
      };
    const aux = await readAux(root, rel),
      meta = await pbrEditorMeta(root),
      srcSize = meta.source_sizes[rel] || {};
    const layers = {};
    for (const k of [
      "color",
      "normal",
      "metal",
      "emissive",
      "roughness",
      "sub",
      "height",
    ])
      layers[k] = await imageDataUrl(aux[k]);
    if (aux.fioBlue) layers.fioBlue = await imageDataUrl(aux.fioBlue);
    const kind = data.kind || kindFromRel(rel),
      stem = stemOf(rel),
      graph = await registry.index(root);
    return {
      ok: true,
      registration: {
        defined: aux.registered,
        source: aux.merSource,
        category: aux.defaults.category,
        protocol: aux.fio ? "op_fio" : "native_texture_set",
        height_source: aux.heightSource,
        source_mode: aux.sourceMode,
        output_mode: aux.merMode === "mers" ? "MERS" : "普通纹理",
        warnings: aux.contract.warnings,
        images: aux.contract.images,
        defaults: Object.fromEntries(
          ["metal", "emissive", "roughness", "sub"].map((key, i) => [
            key,
            aux.defaults.value[i],
          ]),
        ),
        file: aux.registered ? textureSetRel(rel) : "pbr/global.json",
        references: core.clone(aux.ts["minecraft:texture_set"] || {}),
        shared: [...graph.reverse]
          .filter(
            ([path, owners]) =>
              owners.has(textureSetRel(rel)) &&
              owners.size > 1 &&
              core.currentHandle?.store?.has(path),
          )
          .map(([path, owners]) => ({
            path,
            materials: owners.size,
          })),
        animation: core.clone(graph.animations.get(rel) || []),
      },
      stem,
      zh: textureZh(stem, rel, kind),
      search_zh: textureSearchZh(stem, rel, kind),
      kind,
      size: aux.color.width,
      size_w: aux.color.width,
      size_h: aux.color.height,
      algorithm_source_width: Number(srcSize.w) || aux.color.width,
      algorithm_source_height: Number(srcSize.h) || aux.color.height,
      rel,
      eyes: EYE_RECTS[stem] || "",
      mer_mode: aux.merMode,
      bump: aux.bump,
      layers,
      from_vanilla:
        !!root.__rdWorkspace &&
        !global.RenderDragonWorkspace.session.sourcePaths.has(rel) &&
        !global.RenderDragonWorkspace.session.sourcePaths.has(
          textureSetRel(rel),
        ),
      from_library: false,
      pipeline: global.RenderDragonWorkspace?.target || "renderdragon",
    };
  }
  function reportProgress(data, pct, detail, state) {
    if (data && typeof data.onProgress === "function")
      data.onProgress(
        Math.max(0, Math.min(100, Math.round(Number(pct) || 0))),
        String(detail || ""),
        state,
      );
  }
  function keepHeightDraft(root, owner, normal, height) {
    let cache = heightDrafts.get(root);
    if (!cache) {
      cache = new Map();
      heightDrafts.set(root, cache);
    }
    cache.set(owner, {
      normal: new ImageData(
        new Uint8ClampedArray(normal.data),
        normal.width,
        normal.height,
      ),
      height: new ImageData(
        new Uint8ClampedArray(height.data),
        height.width,
        height.height,
      ),
    });
  }
  function opOverrides(root) {
    return new Map(
      [...(fioExtras.get(root) || [])].filter(([key, x]) => x.bakedColor),
    );
  }
  function clearOPOverride(root, owner) {
    const extra = fioExtras.get(root)?.get(owner);
    if (extra?.bakedColor) {
      delete extra.bakedColor;
      root.store?.changed();
    }
  }
  async function saveOPOverride(root, owner, data) {
    if (data.op_baked_color) {
      const frame = await imageDataFromDataUrl(data.op_baked_color);
      let map = fioExtras.get(root);
      if (!map) {
        map = new Map();
        fioExtras.set(root, map);
      }
      const prev = map.get(owner) || {};
      if (!equalPixels(prev.bakedColor, frame)) {
        map.set(
          owner,
          Object.assign({}, prev, {
            bakedColor: frame,
          }),
        );
        root.store?.changed();
      }
    } else clearOPOverride(root, owner);
  }
  async function writePaint(root, data) {
    const layers = data.layers || {},
      w = Math.max(1, Number(data.size_w || data.size || 16) | 0),
      h = Math.max(1, Number(data.size_h || data.size || w) | 0);
    if (w * h > 16777216) throw new Error("贴图过大  单张不能超过 1600 万像素");
    const stem = core
        .safeName(data.stem || "texture", "texture")
        .replace(/\s+/g, "_"),
      kind = data.kind || "block";
    const rel = registry.path(data.rel || colorRelFor(kind, stem)),
      owner = textureSetRel(rel);
    const present =
        (await core.exists(root, rel)) || (await core.exists(root, owner)),
      before = present ? await readAux(root, rel) : null;
    const baseRoot = global.RenderDragonWorkspace?.session?.baseRoot;
    const base =
      root.__rdWorkspace &&
      baseRoot &&
      ((await core.exists(baseRoot, rel)) ||
        (await core.exists(baseRoot, owner)))
        ? await readAux(baseRoot, rel)
        : null;
    const current = before?.ts || {},
      doc = core.clone(current),
      body = doc["minecraft:texture_set"] || {};
    const baseBody = base?.ts?.["minecraft:texture_set"] || {},
      bump = data.bump ?? before?.bump ?? "none";
    const requested = data.mer_mode ?? before?.merMode ?? "none";
    let mode = global.RenderDragonMERS.normalizeMode(requested, bump);
    if (
      !["none", "mer", "mers"].includes(requested) ||
      !["none", "normal", "heightmap"].includes(bump)
    )
      throw new Error("材质通道模式无效");
    if (bump === "heightmap" && kind === "item")
      throw new Error("物品贴图不能使用高度图");
    const fioBefore = !!before?.fio;
    const get = async (key, def) =>
      resizeImage(
        layers[key]
          ? await imageDataFromDataUrl(layers[key])
          : before?.[key] || blankImage(w, h, def),
        w,
        h,
      );
    const color = layers.color
      ? resizeImage(await imageDataFromDataUrl(layers.color), w, h)
      : before?.color || blankImage(w, h, 0, 0, 0, 0);
    reportProgress(data, 8, "正在比较实际改动");
    const colorEdited =
      !data.painted ||
      data.painted.color ||
      !present ||
      before.color.width !== w ||
      before.color.height !== h;
    let colorChanged = false;
    if (
      !fioBefore &&
      (!data.lock_color || !present) &&
      colorEdited &&
      !equalPixels(before?.color, color)
    ) {
      const graph = await registry.index(root),
        shared = [...(graph.reverse.get(rel) || [])].some((x) => x !== owner);
      const dest = shared
        ? await registry.outputPath(root, rel, "_rd_color.png", body.color)
        : rel;
      colorChanged = await writeImage(root, dest, color);
      if (
        dest !== rel ||
        before?.resolvedColor !== rel ||
        Array.isArray(body.color) ||
        String(body.color || "").startsWith("#")
      )
        body.color = registry.reference(owner, dest);
    }
    const metal = await get("metal", data.uniform?.metal ?? 0),
      emissive = await get("emissive", data.uniform?.emissive ?? 0),
      roughness = await get("roughness", data.uniform?.roughness ?? 255),
      sub = await get("sub", data.uniform?.sub ?? 0);
    // 普通材质的真实通道改动也从数据入口触发PBR  显式关闭和纯基色缩放除外
    if (
      mode === "none" &&
      (before?.merMode ?? "none") === "none" &&
      data.pbr_enabled !== false
    ) {
      const channels = {
        metal,
        emissive,
        roughness,
        sub,
      };
      if (
        Object.entries(channels).some(
          ([key, image]) =>
            layers[key] &&
            !equalPixels(
              image,
              before?.[key]
                ? resizeImage(before[key], w, h)
                : blankImage(w, h, key === "roughness" ? 255 : 0),
            ),
        )
      )
        mode = "mers";
    }
    const sourceFioSame =
      !!before?.fio &&
      mode === before.merMode &&
      bump === before.bump &&
      equalPixels(color, before.color) &&
      equalPixels(metal, before.metal) &&
      equalPixels(emissive, before.emissive) &&
      equalPixels(roughness, before.roughness) &&
      equalPixels(sub, before.sub) &&
      (!layers.normal || equalPixels(await get("normal", 128), before.normal));
    if (sourceFioSame) {
      await saveOPOverride(root, owner, data);
      return {
        ok: true,
        unchanged: true,
        reason: "原始 FIO 没有变化",
        rel,
      };
    }
    if (fioBefore) {
      const dest = await registry.outputPath(root, rel, "_rd_color.png", null);
      await writeImage(root, dest, color);
      body.color = registry.reference(owner, dest);
      colorChanged = true;
    }
    const channelsEqual = (aux) =>
      !!aux &&
      mode === aux.merMode &&
      (mode === "none" ||
        (equalPixels(metal, aux.metal) &&
          equalPixels(emissive, aux.emissive) &&
          equalPixels(roughness, aux.roughness) &&
          (mode !== "mers" || equalPixels(sub, aux.sub))));
    const restoreKeys = (keys) => {
      for (const key of keys) {
        delete body[key];
        if (baseBody[key] != null) body[key] = core.clone(baseBody[key]);
      }
    };
    if (!fioBefore && channelsEqual(base))
      restoreKeys([registry.MER, registry.MERS]);
    else if (fioBefore || !channelsEqual(before)) {
      const previous = body[registry.MERS] ?? body[registry.MER];
      delete body[registry.MER];
      delete body[registry.MERS];
      if (mode !== "none") {
        const combined = combineMer(metal, emissive, roughness, sub, w, h);
        const dest = await registry.outputPath(
          root,
          rel,
          "_mers.png",
          typeof previous === "string" && !previous.startsWith("#")
            ? previous
            : null,
        );
        await writeImage(root, dest, combined);
        body[registry.MERS] = registry.reference(owner, dest);
      }
    }
    reportProgress(data, 52, "材质通道已暂存");
    const normal = bump === "normal" ? await get("normal", 128) : null,
      height =
        bump === "heightmap" ? grayFromImage(await get("height", 128)) : null;
    const bumpEqual = (aux) =>
      !!aux &&
      bump === aux.bump &&
      (bump === "none" ||
        (bump === "normal"
          ? equalPixels(normal, aux.normal)
          : equalPixels(height, aux.height)));
    if (!fioBefore && bumpEqual(base)) restoreKeys(["normal", "heightmap"]);
    else if (fioBefore || !bumpEqual(before)) {
      const oldNormal = body.normal,
        oldHeight = body.heightmap;
      delete body.normal;
      delete body.heightmap;
      if (normal) {
        const dest = await registry.outputPath(
          root,
          rel,
          "_normal.png",
          oldNormal,
        );
        await writeImage(root, dest, normal);
        body.normal = registry.reference(owner, dest);
      }
      if (height) {
        const dest = await registry.outputPath(
          root,
          rel,
          "_height.png",
          oldHeight,
        );
        await writeImage(root, dest, height, {
          colorType: 0,
        });
        body.heightmap = registry.reference(owner, dest);
      }
    }
    let changedBody = !global.RenderDragonWorkspace.equal(
      current["minecraft:texture_set"] || {},
      body,
    );
    const implicitColor =
      base &&
      !base.registered &&
      (body.color == null ||
        (typeof body.color === "string" &&
          !body.color.startsWith("#") &&
          (await registry.resolve(root, owner, body.color)) === rel));
    const restored =
      base &&
      channelsEqual(base) &&
      bumpEqual(base) &&
      (implicitColor ||
        body.color === baseBody.color ||
        equalPixels(color, base.color));
    if (restored && root.__rdWorkspace) {
      if (base.registered) await core.writeJson(root, owner, base.ts);
      else root.store.revert(owner);
    } else if (
      changedBody ||
      (!present && (mode !== "none" || bump !== "none"))
    ) {
      body.color = body.color ?? stemOf(rel);
      doc["minecraft:texture_set"] = body;
      doc.format_version =
        body[registry.MERS] != null
          ? versionAtLeast(doc.format_version, "1.21.30")
          : doc.format_version || "1.16.100";
      registry.validate(doc, owner);
      await core.writeJson(root, owner, doc);
    }
    await registry.cleanup(root, rel);
    if (
      (colorChanged || changedBody) &&
      (data.algorithm_source_width || data.algorithm_source_height)
    )
      await setPbrSourceSize(
        root,
        rel,
        Number(data.algorithm_source_width) || w,
        Number(data.algorithm_source_height) || h,
      );
    if (
      bump === "normal" &&
      layers.height &&
      (data.height_draft || data.painted?.height)
    )
      keepHeightDraft(root, owner, normal, await get("height", 128));
    await saveOPOverride(root, owner, data);
    reportProgress(data, 100, "暂存完成");
    return {
      ok: true,
      reason:
        colorChanged || changedBody
          ? "当前纹理修改已暂存  下载时仅输出改动和依赖"
          : "纹理与当前状态相同  未新增导出文件",
      rel,
      pipeline: global.RenderDragonWorkspace?.target || "renderdragon",
    };
  }
  async function materialRows() {
    let rows;
    try {
      rows = await dbAll("materials");
    } catch (error) {
      if (
        ["SecurityError", "InvalidStateError", "NotAllowedError"].includes(
          error.name,
        )
      )
        return [];
      throw error;
    }
    return rows.map((x) => ({
      name: x.name,
      zh: x.zh || x.stem || x.name,
      stem: x.stem || x.name,
      kind: x.kind || "block",
      thumb: x.layers?.color || "",
      size_w: x.size_w || 16,
      size_h: x.size_h || 16,
    }));
  }
  async function materialSave(data) {
    reportProgress(data, 15, "正在整理材质库数据");
    const name = core.safeName(
      data.lib_name || data.name || data.stem,
      "material",
    );
    const obj = {
      name,
      stem: data.stem || name,
      zh: data.zh || data.stem || name,
      kind: data.kind || "block",
      size_w: data.size_w || data.size || 16,
      size_h: data.size_h || data.size || 16,
      mer_mode: global.RenderDragonMERS.normalizeMode(data.mer_mode, data.bump),
      bump: data.bump || "none",
      uniform: data.uniform || {},
      layers: core.clone(data.layers || {}),
      updated: Date.now(),
    };
    await dbPut("materials", obj);
    reportProgress(data, 72, "材质数据已写入");
    const library = await materialRows();
    reportProgress(data, 100, "材质库已刷新");
    return {
      ok: true,
      reason: "已保存到材质库",
      lib_name: name,
      library,
    };
  }
  async function materialGet(name) {
    const x = await dbGet("materials", name);
    if (!x) return null;
    return {
      ok: true,
      stem: x.stem,
      zh: x.zh,
      kind: x.kind,
      size: x.size_w,
      size_w: x.size_w,
      size_h: x.size_h,
      mer_mode: global.RenderDragonMERS.normalizeMode(x.mer_mode, x.bump),
      pbr_enabled:
        global.RenderDragonMERS.normalizeMode(x.mer_mode, x.bump) !== "none",
      bump: x.bump || "none",
      layers: x.layers,
      from_library: true,
      lib_name: x.name,
      eyes: EYE_RECTS[x.stem] || "",
    };
  }
  async function updateEffectMeta(root, id, payload) {
    const rel = "textures/_renderdragon_material_effects.json",
      doc = await core.readJson(root, rel, {
        format_version: 1,
        effects: {},
      });
    doc.effects = doc.effects || {};
    doc.effects[id] = Object.assign({}, payload, {
      updated: Date.now(),
    });
    await core.writeJson(root, rel, doc);
  }
  function effectCandidates(rows, id) {
    const match = {
      eyes: (r) => r.kind === "entity" && !!EYE_RECTS[r.stem],
      mob_blink: (r) => r.kind === "entity" && !!EYE_RECTS[r.stem],
      ore: (r) => r.kind === "block" && /(?:^|_)ore$/.test(r.stem),
      lights: (r) =>
        r.kind === "block" &&
        /^(?:glowstone|sea_lantern|shroomlight|redstone_lamp_on|lit_pumpkin|lantern|soul_lantern)$/.test(
          r.stem,
        ),
      lamps: (r) => r.kind === "block" && /(?:lamp|lantern|light)/.test(r.stem),
      diamond_sword: (r) => r.kind === "item" && r.stem === "diamond_sword",
      weapons: (r) => r.kind === "item" && /(?:sword|bow|trident)/.test(r.stem),
      warden: (r) => r.kind === "entity" && /^warden(?:_|$)/.test(r.stem),
      copper_golem: (r) => r.kind === "entity" && /copper_golem/.test(r.stem),
      creeper_fuse: (r) => r.kind === "entity" && r.stem === "creeper",
      arrow: (r) => r.stem === "arrow",
    }[id];
    return match ? rows.filter(match) : [];
  }
  function makeMask(color, target, stem, options = {}) {
    const w = color.width,
      h = color.height,
      mask = new Uint8Array(w * h),
      rects =
        target === "eyes"
          ? EYE_RECTS[stem] || []
          : options.rect
            ? [options.rect]
            : [];
    let rgb = null;
    if (typeof options.match === "string")
      rgb = registry.uniform(options.match, 3);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x,
          o = i * 4;
        if (color.data[o + 3] === 0) continue;
        let selected = target === "texture" || target === "all";
        if (target === "bright")
          selected =
            color.data[o] * 0.299 +
              color.data[o + 1] * 0.587 +
              color.data[o + 2] * 0.114 >=
            Number(options.threshold ?? 128);
        if (target === "color" || target === "match")
          selected =
            !!rgb &&
            Math.max(...rgb.map((v, k) => Math.abs(v - color.data[o + k]))) <=
              Number(options.tolerance ?? 24);
        if (target === "eyes" || target === "rect")
          selected = rects.some((rect) => {
            const values = Array.isArray(rect)
                ? rect
                : [rect.x, rect.y, rect.w, rect.h],
              scale = target === "eyes" ? w / 64 : 1;
            return (
              x >= values[0] * scale &&
              x < (values[0] + values[2]) * scale &&
              y >= values[1] * scale &&
              y < (values[1] + values[3]) * scale
            );
          });
        mask[i] = selected ? 1 : 0;
      }
    return mask;
  }
  async function applyEmissive(root, row, options = {}) {
    const aux = await readAux(root, row.rel),
      mask = makeMask(
        aux.color,
        options.target || "texture",
        row.stem,
        options,
      );
    if (!mask.some(Boolean)) return false;
    const maps = {
      emissive: aux.emissive,
    };
    if (options.metal != null) maps.metal = aux.metal;
    if (options.roughness != null) maps.roughness = aux.roughness;
    for (const [key, image] of Object.entries(maps)) {
      const value = clamp(options[key] ?? 230, 0, 255);
      for (let i = 0; i < mask.length; i++)
        if (mask[i]) {
          const o = i * 4;
          image.data[o] = image.data[o + 1] = image.data[o + 2] = value;
        }
    }
    const layers = {};
    for (const [key, image] of Object.entries(maps))
      layers[key] = await imageDataUrl(image);
    if (options.keep_color === false && options.color) {
      const rgb = registry.uniform(options.color, 3);
      if (rgb) {
        for (let i = 0; i < mask.length; i++)
          if (mask[i])
            for (let c = 0; c < 3; c++) aux.color.data[i * 4 + c] = rgb[c];
        layers.color = await imageDataUrl(aux.color);
      }
    }
    const result = await writePaint(root, {
      rel: row.rel,
      stem: row.stem,
      kind: row.kind,
      size_w: aux.color.width,
      size_h: aux.color.height,
      layers,
      mer_mode: "mers",
      bump: aux.bump,
      lock_color: options.keep_color !== false,
      painted: {
        color: options.keep_color === false,
      },
    });
    return result.ok;
  }
  async function applyUniformMaterial(root, data) {
    if (!root)
      return {
        ok: false,
        reason: "请先打开资源包",
      };
    let rows = await scanTextures(root);
    if (Array.isArray(data.rels))
      rows = rows.filter((row) => data.rels.includes(row.rel));
    else if (root.__rdWorkspace)
      rows = rows.filter((row) => row.origin !== "catalog");
    rows = rows.filter((row) => !["ui", "other"].includes(row.kind));
    if (!rows.length)
      return {
        ok: false,
        reason: "请选择要处理的材质",
      };
    let count = 0;
    const drafts = [];
    for (const row of rows) {
      const aux = await readAux(root, row.rel),
        w = aux.color.width,
        h = aux.color.height,
        layers = {};
      let bump = aux.bump,
        mode = aux.merMode;
      if (data.mode === "normals") {
        const height = grayFromImage(aux.color),
          normal = normalFromHeight(height, 2);
        layers.normal = await imageDataUrl(normal);
        drafts.push({
          owner: textureSetRel(row.rel),
          normal,
          height,
        });
        bump = "normal";
      } else {
        const channels = Array.isArray(data.channels)
          ? data.channels
          : ["metal", "emissive", "roughness"];
        for (const key of channels) {
          if (!["metal", "emissive", "roughness", "sub"].includes(key))
            throw new Error("不支持的材质通道 " + key);
          layers[key] = await imageDataUrl(
            blankImage(
              w,
              h,
              clamp(
                data.uniform?.[key] ?? (key === "roughness" ? 255 : 0),
                0,
                255,
              ),
            ),
          );
        }
        mode = "mers";
      }
      await writePaint(root, {
        rel: row.rel,
        stem: row.stem,
        kind: row.kind,
        size_w: w,
        size_h: h,
        layers,
        mer_mode: mode,
        bump,
        lock_color: true,
        painted: {
          color: false,
        },
        compact_uniforms: true,
      });
      count++;
    }
    for (const draft of drafts)
      keepHeightDraft(root, draft.owner, draft.normal, draft.height);
    return {
      ok: true,
      reason: "已暂存 " + count + " 个材质的指定通道",
      count,
    };
  }
  async function applyEffect(root, id, payload = {}) {
    if (id === "hurt_flash") return 0;
    const rows = effectCandidates(await scanTextures(root), id);
    let count = 0;
    for (const r of rows) {
      let opt = {
        target: "bright",
        emissive: 150,
        roughness: 100,
      };
      if (["eyes", "mob_blink"].includes(id))
        opt = {
          target: "eyes",
          emissive: 230,
          roughness: 70,
        };
      if (id === "ore")
        opt = {
          target: "bright",
          emissive: 105,
          roughness: 150,
        };
      if (["lights", "lamps"].includes(id))
        opt = {
          target: "bright",
          emissive: 190,
          roughness: 100,
        };
      if (id === "diamond_sword")
        opt = {
          target: "bright",
          emissive: 82,
          roughness: 90,
        };
      if (id === "weapons")
        opt = {
          target: "bright",
          emissive: 72,
          roughness: 100,
        };
      if (id === "copper_golem")
        opt = {
          target: "bright",
          emissive: 165,
          roughness: 100,
        };
      if (id === "warden")
        opt = {
          target: "bright",
          emissive: 150,
          roughness: 90,
        };
      if (id === "creeper_fuse")
        opt = {
          target: "bright",
          emissive: 170,
          roughness: 110,
        };
      if (id === "arrow")
        opt = {
          target: "bright",
          emissive: 160,
          roughness: 100,
        };
      if (await applyEmissive(root, r, opt)) count++;
    }
    await updateEffectMeta(
      root,
      id,
      Object.assign({}, payload, {
        matched: count,
      }),
    );
    return count;
  }
  async function audit(root) {
    const graph = await registry.index(root),
      issues = graph.errors.map((x) => x.file + " " + x.message);
    for (const [owner, set] of graph.sets) {
      try {
        const contract = await registry.imageContracts(root, owner, set.doc);
        issues.push(...contract.warnings);
      } catch (error) {
        issues.push(error.message);
      }
      if (issues.length >= 100) break;
    }
    return issues.slice(0, 100);
  }
  async function registerSource(handle) {
    const token = "source:" + Date.now() + ":" + (sourceMap.size + 1);
    sourceMap.set(token, handle);
    lastRefToken = token;
    return token;
  }
  async function pickSource() {
    const h = await core.pickDirectory("read");
    if (!(await core.perm(h, "read")))
      throw new Error("没有来源文件夹读取权限");
    return {
      handle: h,
      token: await registerSource(h),
    };
  }
  async function sourceFromToken(token) {
    return sourceMap.get(token) || null;
  }
  function frameToImageData(f) {
    if (!f || !f.data) return null;
    return new ImageData(
      new Uint8ClampedArray(f.data),
      Number(f.width) || 1,
      Number(f.height) || 1,
    );
  }
  async function pbrGenerateAll(root, data) {
    if (!root)
      return {
        ok: false,
        reason: "请先打开资源包",
      };
    const resizing = !!data.resize_only,
      A = global.RenderDragonPBRAlgorithm;
    if (!A)
      return {
        ok: false,
        reason: "分辨率与PBR算法未加载",
      };
    reportProgress(data, 0, "正在整理处理清单", {
      phase: "prepare",
      completed: 0,
      total: 0,
      rel: "",
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    let rows = await scanTextures(root);
    if (Array.isArray(data.rels)) {
      const selected = new Set(data.rels);
      rows = rows.filter((row) => selected.has(row.rel));
    } else if (root.__rdWorkspace)
      rows = rows.filter(
        (row) =>
          global.RenderDragonWorkspace.session.sourcePaths.has(row.rel) ||
          global.RenderDragonWorkspace.session.sourcePaths.has(
            textureSetRel(row.rel),
          ) ||
          root.store.overlay.has(row.rel) ||
          root.store.overlay.has(textureSetRel(row.rel)),
      );
    rows = rows.filter((row) => !["ui", "other"].includes(row.kind));
    if (!rows.length)
      return {
        ok: false,
        reason: "请选择要处理的纹理  不会自动生成整个内置素材库",
      };
    const channels =
      resizing || data.color_only
        ? ["color"]
        : Array.isArray(data.channels)
          ? [...new Set(data.channels)]
          : ["normal", "metal", "emissive", "roughness"];
    if (
      !channels.length ||
      channels.some(
        (x) =>
          ![
            "color",
            "normal",
            "height",
            "metal",
            "emissive",
            "roughness",
          ].includes(x),
      )
    )
      throw new Error("请选择有效的生成任务");
    if (channels.includes("normal") && channels.includes("height"))
      throw new Error("法线和高度不能同时注册  生成法线会保留辅助高度");
    if (channels.includes("height") && rows.some((row) => row.kind === "item"))
      throw new Error("所选范围含物品  不能使用高度图");
    const globalParams = Object.assign(
        {},
        data.global_params || data.params || {},
      ),
      perTexture = data.per_texture || {},
      target = Number(data.resolution ?? globalParams.resolution ?? 128);
    if (!A.RESOLUTIONS.includes(target))
      throw new Error("分辨率只能选择 16X 32X 64X 128X 256X 512X 1024X");
    let count = 0;
    const details = [],
      drafts = [],
      dimensions = [];
    const notify = (phase, rel, detail) =>
      reportProgress(data, (count / rows.length) * 100, detail, {
        phase,
        completed: count,
        total: rows.length,
        rel,
      });
    for (const row of rows) {
      notify("read", row.rel, "正在读取 " + row.rel);
      await new Promise((resolve) => setTimeout(resolve, 0));
      const aux = await readAux(root, row.rel),
        override = Object.assign({}, perTexture[row.rel] || {});
      for (const k of Object.keys(override))
        if (k.startsWith("__")) delete override[k];
      const resolution = channels.includes("color") ? target : aux.color.width,
        params = Object.assign({}, globalParams, override, {
          resolution,
        });
      const layers = {};
      let outputWidth = aux.color.width,
        outputHeight = aux.color.height,
        draftHeight = null;
      if (resizing) {
        outputWidth = target;
        outputHeight = Math.max(
          1,
          Math.round((aux.color.height * target) / aux.color.width),
        );
        if (outputWidth * outputHeight > 16777216)
          throw new Error(row.rel + " 调整后的图像超过像素限制");
        notify(
          "resize",
          row.rel,
          "正在调整 " + row.rel + " 为 " + outputWidth + " × " + outputHeight,
        );
        layers.color = await imageDataUrl(
          resizeImage(aux.color, outputWidth, outputHeight),
        );
        if (aux.heightSource === "generated")
          draftHeight = resizeImage(aux.height, outputWidth, outputHeight);
      } else {
        for (const channel of channels) {
          notify(
            "generate",
            row.rel,
            "正在生成 " +
              {
                color: "基色",
                normal: "法线与辅助高度",
                height: "高度",
                metal: "R 金属度",
                emissive: "G 自发光",
                roughness: "B 粗糙度",
              }[channel] +
              "  " +
              row.rel,
          );
          await new Promise((resolve) => setTimeout(resolve, 0));
          const g = A.generateChannel(aux.color, params, channel),
            frame =
              g[
                {
                  color: "albedo",
                  metal: "metalness",
                }[channel] || channel
              ];
          if (!frame)
            throw new Error("生成器没有返回 " + channel + " " + row.rel);
          const image = channels.includes("color")
            ? frameToImageData(frame)
            : resizeImage(
                frameToImageData(frame),
                aux.color.width,
                aux.color.height,
              );
          layers[channel] = await imageDataUrl(image);
          outputWidth = image.width;
          outputHeight = image.height;
          if (channel === "normal" && g.height)
            draftHeight = resizeImage(
              frameToImageData(g.height),
              outputWidth,
              outputHeight,
            );
        }
      }
      const materialChange = channels.some((x) =>
          ["metal", "emissive", "roughness"].includes(x),
        ),
        mode = materialChange ? "mers" : aux.merMode;
      notify("save", row.rel, "正在暂存 " + row.rel);
      const out = await writePaint(root, {
        rel: row.rel,
        stem: row.stem,
        kind: row.kind,
        size_w: outputWidth,
        size_h: outputHeight,
        layers,
        mer_mode: mode,
        bump: channels.includes("normal")
          ? "normal"
          : channels.includes("height")
            ? "heightmap"
            : aux.bump,
        lock_color: !channels.includes("color"),
        painted: {
          color: channels.includes("color"),
        },
        algorithm_source_width: aux.color.width,
        algorithm_source_height: aux.color.height,
      });
      if (!out.ok) throw new Error(out.reason);
      if (draftHeight) {
        const normal = layers.normal
          ? await imageDataFromDataUrl(layers.normal)
          : resizeImage(aux.normal, outputWidth, outputHeight);
        drafts.push({
          owner: textureSetRel(row.rel),
          normal,
          height: draftHeight,
        });
      }
      count++;
      details.push(row.rel);
      dimensions.push({
        rel: row.rel,
        width: outputWidth,
        height: outputHeight,
      });
      notify(
        "processed",
        row.rel,
        "已处理 " + count + " / " + rows.length + "  " + row.rel,
      );
    }
    for (const draft of drafts)
      keepHeightDraft(root, draft.owner, draft.normal, draft.height);
    return {
      ok: true,
      reason: resizing
        ? "已调整 " + count + " 张纹理尺寸  原有材质数据保留"
        : "已处理 " +
          count +
          " 张纹理  PBR 输出使用 MERS  未选择的属性保持不变",
      count,
      skipped: 0,
      failed: 0,
      channels,
      details,
      dimensions,
    };
  }
  async function materialCall(op, data = {}) {
    try {
      let root = core.currentHandle;
      if (op === "read")
        return root
          ? {
              ok: true,
              open: true,
              meta: {
                name: await core.readPackName(root),
                root: root.name,
              },
              pipeline: global.RenderDragonWorkspace?.target || "renderdragon",
            }
          : {
              ok: true,
              open: false,
              meta: {},
            };
      if (op === "open" || op === "pick") {
        if (!data.pick && data.path === root?.name)
          return core.editorCall("state");
        let h = null;
        if (!data.pick && data.path) {
          const saved = await dbGet("packs", data.path);
          h = saved?.handle || null;
        }
        if (!h) h = await core.pickDirectory("read");
        const d = await core.openPack(h, core.currentBiome);
        try {
          await dbPut("packs", {
            name: h.name,
            handle: h,
            updated: Date.now(),
          });
        } catch (e) {}
        return d;
      }
      if (op === "create") {
        const d = await core.buildRenderDragonPack(data.name || "渲染龙光影");
        try {
          if (core.currentHandle && !core.currentHandle.__rdWorkspace)
            await dbPut("packs", {
              name: core.currentHandle.name,
              handle: core.currentHandle,
              updated: Date.now(),
            });
        } catch (e) {}
        return d;
      }
      if (op === "library") {
        let packs = [];
        try {
          packs = (await dbAll("packs")).map((x) => ({
            name: x.name,
            path: x.name,
            pipeline: global.RenderDragonWorkspace?.target || "renderdragon",
          }));
        } catch (e) {}
        if (root && !packs.some((x) => x.name === root.name))
          packs.unshift({
            name: root.name,
            path: root.name,
            pipeline: global.RenderDragonWorkspace?.target || "renderdragon",
          });
        return {
          ok: true,
          items: packs,
          library_dir: "浏览器本地授权",
        };
      }
      if (op === "pack_delete")
        return {
          ok: false,
          reason: "浏览器端不直接删除磁盘资源包，请在系统文件管理器中删除",
        };
      if (op === "textures") {
        const items = root ? await scanTextures(root) : [];
        return {
          ok: true,
          items,
          texture_count: items.length,
          library: await materialRows(),
          examples: EXAMPLES,
          eye_presets: {
            "Him 白色眼部": "#FFFFFF",
            红色眼部: "#FF2020",
            绿色眼部: "#40FF40",
            末影紫色: "#C040FF",
          },
          glow_presets: GLOW_PRESETS,
          pack_open: !!root,
          audit: [],
          pipeline: global.RenderDragonWorkspace?.target || "renderdragon",
        };
      }
      if (op === "textures_watch") {
        const items = root ? await scanTextures(root) : [];
        return {
          ok: true,
          items,
          texture_count: items.length,
          pack_open: !!root,
          pipeline: global.RenderDragonWorkspace?.target || "renderdragon",
        };
      }
      if (op === "texture_thumb") {
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
          };
        const rel = String(data.rel || "");
        if (
          !rel ||
          (!(await core.exists(root, rel)) &&
            !(await core.exists(root, textureSetRel(rel))))
        )
          return {
            ok: false,
            reason: "纹理不存在",
          };
        return {
          ok: true,
          rel,
          thumb: await textureThumb(root, rel, data.size || 88),
        };
      }
      if (op === "texture_thumbs") {
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
            thumbs: {},
          };
        const rels = Array.from(
            new Set(
              (Array.isArray(data.rels) ? data.rels : [])
                .map((x) => String(x || ""))
                .filter(Boolean),
            ),
          ).slice(0, 72),
          thumbs = {};
        let cursor = 0;
        async function worker() {
          while (true) {
            const i = cursor++;
            if (i >= rels.length) break;
            const rel = rels[i];
            try {
              if (
                (await core.exists(root, rel)) ||
                (await core.exists(root, textureSetRel(rel)))
              )
                thumbs[rel] = await textureThumb(root, rel, data.size || 88);
            } catch (e) {}
          }
        }
        await Promise.all(
          Array.from(
            {
              length: Math.min(6, Math.max(1, rels.length)),
            },
            worker,
          ),
        );
        return {
          ok: true,
          thumbs,
          count: Object.keys(thumbs).length,
        };
      }
      if (op === "texture_get") {
        if (data.lib_name) {
          const x = await materialGet(data.lib_name);
          return (
            x || {
              ok: false,
              reason: "材质库中不存在该条目",
            }
          );
        }
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
          };
        return textureDoc(root, data);
      }
      if (op === "pbr_generate_all") return pbrGenerateAll(root, data);
      if (op === "paint_save") {
        if (data.to_library) return materialSave(data);
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
          };
        return writePaint(root, data);
      }
      if (op === "material_library")
        return {
          ok: true,
          library: await materialRows(),
          items: await materialRows(),
        };
      if (op === "material_library_save") return materialSave(data);
      if (op === "material_library_delete") {
        await dbDel("materials", core.safeName(data.name, ""));
        return {
          ok: true,
          reason: "已删除",
          library: await materialRows(),
        };
      }
      if (op === "material_library_apply") {
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
          };
        const e = await materialGet(data.lib_name);
        if (!e)
          return {
            ok: false,
            reason: "材质库中不存在该条目",
          };
        e.lock_color = false;
        return writePaint(root, e);
      }
      if (op === "material_apply") return applyUniformMaterial(root, data);
      if (op === "material_import_pick" || op === "material_import_list") {
        let h;
        if (op === "material_import_pick" || !data.src)
          ({ handle: h } = await pickSource());
        else h = await sourceFromToken(data.src);
        if (!h)
          return {
            ok: false,
            reason: "来源资源包授权已失效",
            items: [],
          };
        const token =
          Array.from(sourceMap.entries()).find((x) => x[1] === h)?.[0] ||
          (await registerSource(h));
        const items = await scanTextures(h);
        return {
          ok: true,
          reason: "已读取来源资源包",
          path: token,
          items,
          count: items.length,
        };
      }
      if (op === "material_import_copy") {
        const src = await sourceFromToken(data.src);
        if (!src)
          return {
            ok: false,
            reason: "来源资源包授权已失效",
          };
        let count = 0;
        if (data.to_library) {
          for (const rel of data.rels || []) {
            const doc = await textureDoc(src, {
              rel,
            });
            if (doc.ok) {
              doc.lib_name = doc.zh || doc.stem;
              await materialSave(doc);
              count++;
            }
          }
          return {
            ok: true,
            reason: "已导入材质库 " + count + " 条",
            library: await materialRows(),
            count,
          };
        }
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
          };
        return registry.copyMaterials(root, src, data.rels);
      }
      if (op === "material_export") {
        reportProgress(data, 4, "正在准备导出目录");
        if (data.lib_name) {
          const e = await materialGet(data.lib_name);
          if (!e)
            return {
              ok: false,
              reason: "材质库中不存在该条目",
            };
          const out = await core.makeOutputDir(
              core.safeName(data.lib_name, "材质导出"),
            ),
            d = out.dir;
          const manifest = {
            format_version: 2,
            header: {
              name: d.name,
              description: "RenderDragon 材质导出",
              uuid: core.uuid(),
              version: [1, 0, 0],
              min_engine_version: [1, 21, 120],
            },
            modules: [
              {
                type: "resources",
                uuid: core.uuid(),
                version: [1, 0, 0],
              },
            ],
          };
          if (
            global.RenderDragonMERS.normalizeMode(e.mer_mode, e.bump) === "mers"
          )
            manifest.capabilities = ["pbr"];
          await core.writeJson(d, "manifest.json", manifest);
          reportProgress(data, 16, "资源包清单已创建");
          e.lock_color = false;
          e.onProgress = function (pct, detail) {
            reportProgress(
              data,
              16 + Math.round((Number(pct) || 0) * 0.62),
              detail,
            );
          };
          await writePaint(d, e);
          if (out.fallback) {
            reportProgress(data, 84, "正在打包 ZIP");
            await core.downloadZipHandle(d, d.name, true);
          }
          reportProgress(data, 100, "导出完成");
          return {
            ok: true,
            reason: out.fallback
              ? "已导出 " + d.name + " ZIP"
              : "已导出 " + d.name,
            path: d.name,
          };
        }
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
          };
        return global.RenderDragonWorkspace.exportChanges(true);
      }
      if (op === "material_audit") {
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
          };
        const issues = await audit(root);
        return {
          ok: true,
          reason: issues[0] || "检查完成",
          audit: issues,
          count: issues.length,
        };
      }
      if (op === "material_ref_scan") {
        const { handle, token } = await pickSource();
        lastRefToken = token;
        const items = await scanTextures(handle);
        return {
          ok: true,
          reason: "参考资源读取完成",
          path: token,
          items,
          count: items.length,
          skipped_cjk: 0,
        };
      }
      if (op === "material_ref_get") {
        const src = await sourceFromToken(data.src || lastRefToken);
        if (!src)
          return {
            ok: false,
            reason: "参考资源包授权已失效",
          };
        const doc = await textureDoc(src, data);
        if (doc.ok) doc.from_ref = data.stem || doc.stem;
        return doc;
      }
      if (op === "material_glow_presets")
        return {
          ok: true,
          items: GLOW_PRESETS,
          glow_presets: GLOW_PRESETS,
        };
      if (op === "material_diy_glow" || op === "material_eye_glow") {
        const stem = data.stem || "texture";
        if (data.to_library && !root) {
          const base =
            (await materialGet(data.source_lib_name || data.lib_name)) ||
            (await materialGet(stem));
          if (!base)
            return {
              ok: false,
              reason: "请先从材质库载入一张纹理",
            };
          const color = await imageDataFromDataUrl(base.layers.color),
            em = base.layers.emissive
              ? await imageDataFromDataUrl(base.layers.emissive)
              : blankImage(color.width, color.height, 0),
            mask = makeMask(
              color,
              op === "material_eye_glow" ? "eyes" : data.target || "texture",
              stem,
              data,
            );
          for (let i = 0; i < mask.length; i++)
            if (mask[i]) {
              const o = i * 4,
                v = clamp(data.emissive ?? 230, 0, 255);
              em.data[o] = em.data[o + 1] = em.data[o + 2] = v;
            }
          base.layers.emissive = await imageDataUrl(em);
          base.mer_mode = "mers";
          base.lib_name = data.lib_name || stem + " 自发光";
          return materialSave(base);
        }
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
          };
        const rows = await scanTextures(root),
          row = rows.find(
            (r) => r.stem === stem && (data.rel ? r.rel === data.rel : true),
          );
        if (!row)
          return {
            ok: false,
            reason: "当前资源包中未找到该纹理",
          };
        const ok = await applyEmissive(root, row, {
          target:
            op === "material_eye_glow" ? "eyes" : data.target || "texture",
          match: data.match || data.color,
          rect: data.rect,
          emissive: data.emissive ?? 230,
          metal: data.metal,
          roughness: data.roughness ?? 70,
          keep_color: data.keep_color !== false,
          color: data.color,
        });
        if (!ok)
          return {
            ok: false,
            reason: "目标区域没有可写入的像素",
          };
        await updateEffectMeta(root, "diy:" + stem, {
          stem,
          target: data.target || "texture",
          random: data.random || "none",
          seconds: Number(data.seconds || 4),
          halo: !!data.halo,
        });
        return {
          ok: true,
          reason: "已写入当前纹理",
          rel: row.rel,
        };
      }
      const wrappers = {
        material_eyes_catalog: "eyes",
        material_mob_blink: "mob_blink",
        material_ore_breath: "ore",
        material_light_sources: "lights",
        material_creative_lamps: "lamps",
        material_diamond_sword_glow: "diamond_sword",
        material_weapon_glow: "weapons",
        material_warden_rainbow: "warden",
        material_copper_golem_flash: "copper_golem",
        material_creeper_fuse: "creeper_fuse",
        material_arrow_glow: "arrow",
      };
      if (wrappers[op]) {
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
          };
        const n = await applyEffect(root, wrappers[op], data);
        return {
          ok: true,
          reason: "已暂存静态自发光贴图",
          note:
            "已处理 " +
            n +
            " 张纹理  眨眼 呼吸和受伤触发需要额外的游戏端动画或脚本",
          count: n,
        };
      }
      if (op === "material_hurt_flash")
        return {
          ok: false,
          reason:
            "受伤触发需要游戏端实体动画或脚本  当前网页不能只靠材质 JSON 实现  未生成无效配置",
        };
      if (op === "material_glow_apply" || op === "material_finish_all") {
        if (!root)
          return {
            ok: false,
            reason: "请先打开资源包",
          };
        let ids = data.ids;
        if (ids === "all" || !Array.isArray(ids))
          ids = GLOW_PRESETS.map((x) => x.id);
        let total = 0,
          details = {};
        for (const id of ids) {
          const n = await applyEffect(root, id, data);
          details[id] = n;
          total += n;
        }
        return {
          ok: true,
          reason: "已应用自发光预设",
          note: "已处理 " + total + " 张静态贴图  动态触发未包含",
          count: total,
          details,
        };
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
  global.RenderDragonBridge = global.RenderDragonBridge || {};
  async function workspaceMaterialCall(op, data = {}) {
    const workspace = global.RenderDragonWorkspace;
    if (op === "material_export_current")
      return workspace.guard(() =>
        workspace.serial(() =>
          workspace.exportMaterial(
            data.rel,
            data.name,
            data.download !== false,
            data.snapshot || null,
          ),
        ),
      );
    if (op === "material_export" && !data.lib_name)
      return global.RenderDragonApp?.downloadChanges
        ? global.RenderDragonApp.downloadChanges()
        : workspace.download();
    if (["create", "open", "pick"].includes(op)) {
      const app = global.RenderDragonApp;
      if (
        app?.pending &&
        !global.confirm("当前工作区存在未下载的修改  继续会放弃这些修改")
      )
        return {
          ok: false,
          cancelled: true,
          reason: "已取消",
        };
      const d = await materialCall(op, data);
      if (d.ok && app) await app.refreshProject();
      return d;
    }
    if (op === "reset_texture")
      return workspace.editorCall("reset_texture", data);
    const readOnly = new Set([
      "read",
      "textures",
      "textures_watch",
      "texture_thumb",
      "texture_thumbs",
      "texture_get",
      "library",
      "material_library",
      "material_audit",
      "material_glow_presets",
      "material_import_list",
      "material_import_pick",
      "material_ref_scan",
      "material_ref_get",
    ]);
    if (readOnly.has(op) || (data.lib_name && op === "material_export"))
      return materialCall(op, data);
    return workspace.guard(() =>
      workspace.serial(() =>
        workspace.transaction(() => materialCall(op, data)),
      ),
    );
  }
  global.RenderDragonBridge.materialCall = workspaceMaterialCall;
  async function exportMERS(
    root,
    owner,
    input,
    virtual = new Map(),
    conversionCache = new Map(),
  ) {
    const doc = core.clone(input),
      body = registry.validate(doc, owner),
      contract = await registry.imageContracts(root, owner, doc);
    const isMer = body[registry.MER] != null,
      hasMers = body[registry.MERS] != null;
    if (!isMer && !hasMers)
      return {
        doc,
      };
    doc.format_version = versionAtLeast(doc.format_version, "1.21.30");
    const info = contract.images[isMer ? registry.MER : registry.MERS];
    const value = registry.uniform(
      body[isMer ? registry.MER : registry.MERS],
      isMer ? 3 : 4,
    );
    let image;
    if (value) {
      const graph = await registry.index(root),
        logical = owner.slice(0, -registry.SET_SUFFIX.length);
      const variants = [
        ...registry.candidates(owner, body.color),
        ...[".png", ".tga", ".jpg", ".jpeg"].map((ext) => logical + ext),
      ].some((p) => graph.roles.get(p)?.has("variation"));
      // 普通固定参数保留常量  随机纹理变体则按引擎要求提供实际 MERS 图
      if (!variants) {
        delete body[registry.MER];
        body[registry.MERS] = isMer ? value.concat(0) : value;
        return {
          doc,
          warnings: contract.warnings,
        };
      }
      const color = (await materialColor(root, logical + ".png")).image;
      image = blankImage(
        color.width,
        color.height,
        value[0],
        value[1],
        value[2],
        isMer ? 0 : value[3],
      );
    } else if (
      !isMer &&
      (!info ||
        (!info.missingAlpha && (info.format !== "png" || info.colorType === 6)))
    )
      return {
        doc,
      };
    const conversionKey =
      !value && info?.rel ? (isMer ? "MER:" : "MERS:") + info.rel : null;
    if (conversionKey && conversionCache.has(conversionKey)) {
      delete body[registry.MER];
      body[registry.MERS] = registry.reference(
        owner,
        conversionCache.get(conversionKey),
      );
      return {
        doc,
        replaced: info.rel,
        warnings: contract.warnings,
      };
    }
    if (!value) {
      image = await imageDataFromFile(root, info.rel);
      image = new ImageData(
        new Uint8ClampedArray(image.data),
        image.width,
        image.height,
      );
      if (isMer || info.missingAlpha)
        for (let i = 3; i < image.data.length; i += 4) image.data[i] = 0;
    }
    const base = owner.slice(0, -registry.SET_SUFFIX.length) + "_mers";
    let dest = base + ".png",
      n = 2;
    while (
      virtual.has(dest) ||
      (await core.exists(root, dest)) ||
      (await registry.hasSiblingImage(root, owner, dest, virtual))
    )
      dest = base + "_rd" + n++ + ".png";
    virtual.set(
      dest,
      new Uint8Array(
        await (await global.RenderDragonPNG.encode(image)).arrayBuffer(),
      ),
    );
    if (conversionKey) conversionCache.set(conversionKey, dest);
    delete body[registry.MER];
    body[registry.MERS] = registry.reference(owner, dest);
    return {
      doc,
      replaced: info?.rel,
      warnings: contract.warnings,
    };
  }
  async function compileOP(plan, session, root, graph) {
    const files = new Map(plan.files),
      reasons = new Map(plan.reasons),
      enc = new TextEncoder(),
      dec = new TextDecoder(),
      T = global.RenderDragonTargets;
    const nativeParameter =
      /^(?:pbr|lighting|atmosphere|water|color_grading|shadows|local_lighting|fogs|biomes)\//;
    const changes = [...session.store.overlay.keys()].filter(
      (p) => nativeParameter.test(p) && !p.startsWith("renderdragon_"),
    );
    if (changes.length)
      throw new Error(
        "这些修改是渲染龙参数  不能伪装成 OP 配置  请切换渲染龙目标下载  " +
          changes.join("  "),
      );
    const converted = [],
      remove = new Set(),
      replacements = new Map();
    for (const [owner, bytes] of plan.files) {
      if (!owner.endsWith(registry.SET_SUFFIX)) continue;
      const body = JSON.parse(dec.decode(bytes))["minecraft:texture_set"] || {},
        logical = owner.slice(0, -registry.SET_SUFFIX.length),
        rel = logical + ".png";
      const aux = await readAux(root, rel);
      remove.add(owner);
      const enabled = aux.merMode !== "none" || aux.bump !== "none";
      if (
        enabled &&
        (aux.color.width !== aux.color.height || aux.bump === "heightmap")
      )
        throw new Error(
          "OP 已记录的 FPBR 协议需要正方形法线四分区  矩形 动画或独立高度请使用渲染龙目标  " +
            rel,
        );
      for (const key of registry.LAYERS)
        for (const path of registry.candidates(owner, body[key]))
          if (files.has(path)) remove.add(path);
      // Native subsurface is retained in workspace but never jammed into an unrelated OP field.
      const packedLayers = Object.assign({}, aux);
      if (aux.bump === "none") packedLayers.normal = null;
      const extra = fioExtras.get(root)?.get(owner);
      if (extra?.bakedColor) packedLayers.color = extra.bakedColor;
      const image = enabled
        ? T.packFIO(packedLayers, aux.color.width, aux.color.height)
        : aux.color;
      let dest = rel;
      if (await core.exists(root, logical + ".tga")) dest = logical + ".tga";
      if (dest !== rel) replacements.set(logical, registry.stem(dest));
      files.set(
        dest,
        dest.endsWith(".tga")
          ? encodeTga(image)
          : new Uint8Array(
              await (await global.RenderDragonPNG.encode(image)).arrayBuffer(),
            ),
      );
      reasons.set(dest, "OP 四分区 基色 法线 属性 检测标记");
      converted.push({
        owner,
        logical,
        dest,
        enabled,
        width: aux.color.width,
        height: aux.color.height,
        kind: registry.kind(rel),
        sub: aux.sub.data.some((v, i) => i % 4 === 0 && v !== 0),
      });
    }
    const sizes = new Map();
    for (const rel of root.store?.paths() || []) {
      if (
        !/\.(?:fio|glsl|fsh|fragment)$/.test(rel) ||
        !rel.startsWith("shaders/")
      )
        continue;
      const text = new TextDecoder().decode(await core.readBytes(root, rel));
      if (!/DETMOD/.test(text)) continue;
      const match = text.match(/#\s*define\s+iRES\s+(\d+)\b/);
      if (match) sizes.set(rel, Number(match[1]));
    }
    for (const [rel, size] of sizes)
      for (const row of converted)
        if (row.enabled && (row.width !== size || row.height !== size))
          throw new Error(
            "OP 光影 " +
              rel +
              " 固定 iRES " +
              size +
              "  但 " +
              row.dest +
              " 的每区是 " +
              row.width +
              " × " +
              row.height +
              "  请调整到匹配尺寸或使用支持该尺寸的着色器",
          );
    const finalImages = new Set(converted.map((x) => x.dest));
    for (const p of remove)
      if (!finalImages.has(p)) {
        files.delete(p);
        reasons.delete(p);
      }
    for (const p of [...files.keys()])
      if (nativeParameter.test(p)) {
        files.delete(p);
        reasons.delete(p);
      }
    const terrainSource = await core.readJson(
        root,
        "textures/terrain_texture.json",
        {},
      ),
      terrain = {};
    function matches(v, logical) {
      if (typeof v === "string")
        return registry.stem(v) === logical || v === logical;
      if (Array.isArray(v)) return v.some((x) => matches(x, logical));
      if (v && typeof v === "object")
        return Object.values(v).some((x) => matches(x, logical));
      return false;
    }
    function rewrite(v, logical, dest) {
      if (typeof v === "string")
        return v === logical || registry.stem(v) === logical
          ? registry.stem(dest)
          : v;
      if (Array.isArray(v)) return v.map((x) => rewrite(x, logical, dest));
      if (v && typeof v === "object")
        return Object.fromEntries(
          Object.entries(v).map(([k, x]) => [k, rewrite(x, logical, dest)]),
        );
      return v;
    }
    for (const row of converted) {
      if (row.kind !== "block") continue;
      let found = false;
      for (const [id, entry] of Object.entries(
        terrainSource.texture_data || {},
      ))
        if (matches(entry.textures, row.logical)) {
          const value = terrain[id] || core.clone(entry);
          value.textures = rewrite(value.textures, row.logical, row.dest);
          value.quad = row.enabled ? 1 : 0;
          terrain[id] = value;
          found = true;
        }
      if (!found)
        terrain[stemOf(row.logical)] = {
          textures: registry.stem(row.dest),
          quad: row.enabled ? 1 : 0,
        };
    }
    if (Object.keys(terrain).length) {
      const doc = {
        resource_pack_name: terrainSource.resource_pack_name || "op_material",
        texture_name: terrainSource.texture_name || "atlas.terrain",
        padding: terrainSource.padding ?? 8,
        num_mip_levels: terrainSource.num_mip_levels ?? 4,
        texture_data: terrain,
      };
      // Entries with variants must not leave references to missing new aliases.
      files.set(
        "textures/terrain_texture.json",
        enc.encode(core.prettyJson(doc)),
      );
      reasons.set("textures/terrain_texture.json", "OP 四分区图集注册");
    }
    const warnings = converted.filter((x) => x.enabled).length
      ? [
          "OP 输出使用已记录 FPBR FIO 检测协议  需要对应着色器  每区尺寸必须与 iRES 匹配  不包含着色器代码",
        ]
      : [];
    if (files.has("manifest.json")) {
      const manifest = JSON.parse(dec.decode(files.get("manifest.json")));
      manifest.capabilities = (manifest.capabilities || []).filter(
        (x) => x !== "pbr",
      );
      if (!manifest.capabilities.length) delete manifest.capabilities;
      manifest.header.description =
        "OP FIO 四分区材质修改包  需要匹配的 OpenGL FPBR 着色器";
      files.set("manifest.json", enc.encode(core.prettyJson(manifest)));
    }
    const images = [...files.keys()]
      .filter((p) => registry.IMAGE.test(p))
      .map((p) => registry.stem(p))
      .sort();
    if (images.length)
      files.set(
        "textures/textures_list.json",
        enc.encode(core.prettyJson([...new Set(images)])),
      );
    else files.delete("textures/textures_list.json");
    return Object.assign({}, plan, {
      files,
      reasons,
      target: "opengl",
      warnings,
      count: files.size,
      bytes: [...files.values()].reduce((n, b) => n + b.length, 0),
    });
  }
  global.RenderDragonMaterial = {
    opOverrides,
    clearOPOverride,
    compileOP,
    exportMERS,
    combineMer,
    scanTextures,
    textureDoc,
    writePaint,
    pbrGenerateAll,
    materialCall: workspaceMaterialCall,
    readAux,
    textureZh,
    textureSearchZh,
  };
})(window);
