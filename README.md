# RenderDragon Resource Pack Editor

浏览器端的 RenderDragon 光影参数与 PBR 材质编辑器。纯 HTML、CSS、JavaScript，无服务端，无运行时第三方依赖。

[在线使用](https://yzxr123.github.io/renderdragon-editor/) · [算法与架构](docs/ARCHITECTURE.md) · [审计记录](docs/AUDIT.md) · [贡献指南](CONTRIBUTING.md)

## 功能

- 编辑群系光照、体积雾、大气、水体、色彩分级、阴影和局部光源。
- 多通道像素画板、材质库、PBR 通道生成、材质预览与布局配色。
- RenderDragon MERS 与 OpenGL / FIO 两种纹理输出。
- 在内存中暂存修改，计算最小导出文件集；导入的原文件不会被写回。
- 参数修改项、算法配置、界面设置均可导入导出。

## 本地运行

需要 Python 3.11+。构建过程仅使用标准库：

```sh
python scripts/build.py
python -m http.server 8000 --bind 127.0.0.1
```

访问 `http://127.0.0.1:8000`。建议使用当前 Chrome 或 Edge。构建后也可直接打开 `index.html`；文件选择能力取决于浏览器，目录选择不受支持时会退回文件夹输入。在线使用目录选择需要 HTTPS。不要直接打开 `src/painter.html`，它是由主页面托管的子页面模板。

先导入资源包，或新建工作区；修改参数后点击“暂存修改”，再查看“下载清单”并“下载修改包”。输出是修改覆盖包，编辑已有包时需要与原包配合使用。浏览器工作区不是持久备份，关闭页面前应下载修改。

## 测试

Node.js 22+：

```sh
node --test tests/core.test.mjs
```

浏览器回归测试（仅开发需要）：

```sh
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
python tests/browser.py
```

## 源码目录

| 路径 | 用途 |
| --- | --- |
| `index.html`, `assets/` | 主界面、文件系统、工作区、颜色协议和编解码算法 |
| `src/` | 材质画板 HTML、CSS、画板逻辑与宿主桥接源码 |
| `data/template/` | 内置贴图源文件，共 2,703 张，保留原文件名用于资源引用兼容 |
| `scripts/build.py` | 确定性生成画板与贴图包，无额外依赖 |
| `tests/` | 算法与浏览器回归测试 |
| `docs/` | 架构、算法、审计与发布说明 |

`assets/template-bundle.js` 和 `assets/painter-doc.js` 是构建产物，不提交 Git；修改源文件后重新构建。GitHub Pages 工作流会自动构建并测试，仅部署网页运行文件。

## 许可与来源

项目按 [MIT](LICENSE) 开源。提交者已确认随包贴图为本人制作，可按 MIT 公开；此处记录该声明，不声称已对每张贴图完成独立著作权鉴定。原始代码中的 JS Paint / Piskel 来源线索保留于 [第三方说明](THIRD_PARTY_NOTICES.md)。Minecraft、RenderDragon 等名称用于格式和兼容性说明；本项目非官方产品。

算法根据图像特征启发式估计 PBR 通道，预览不能替代目标游戏中的实际渲染。本轮未验证网易或 Bedrock 游戏运行效果。
