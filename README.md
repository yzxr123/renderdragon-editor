# RenderDragon 资源包编辑器

纯浏览器光影参数与 PBR 材质编辑器，MIT 开源。

[在线使用](https://yzxr123.github.io/renderdragon-editor/) · [下载完整网站](https://github.com/yzxr123/renderdragon-editor/releases/latest) · [核心算法](docs/ARCHITECTURE.md) · [修复记录](docs/AUDIT.md)

## 使用

完整网站位于 **`website/`**，可独立复制、部署。直接打开 `website/index.html`，或启动本地服务：

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory website
```

浏览器访问 `http://127.0.0.1:8000`，建议 Chrome 或 Edge。先导入资源包或新建工作区，再修改参数、暂存并下载修改包。编辑已有资源包时，导出的是配合原包使用的修改覆盖包；不会写回原文件。关闭页面前应下载保存。

支持光照、雾、大气、水体、色彩分级、阴影、局部光源，以及像素画板、PBR 生成和 MERS / OpenGL FIO 导出。在线与本地使用同一套网站文件，先启动编辑器，首次读取材质时再加载贴图库。

## 开发

`website/assets/` 是网站模块；`src/` 是页面与画板源码；`data/template/` 是 2,703 张贴图源文件。修改后执行：

```sh
python scripts/build.py
node --test tests/core.test.mjs
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
python tests/browser.py
```

构建直接更新 `website/`，生成的网页和素材一并提交。GitHub Pages 直接发布该目录，不再维护另一套在线专用网站。

项目代码与提交者确认可公开的贴图按 [MIT](LICENSE) 提供，来源线索和第三方许可见 [说明](THIRD_PARTY_NOTICES.md)。PBR 为启发式估计，预览不能替代游戏内验证；本项目非 Minecraft 官方产品。
