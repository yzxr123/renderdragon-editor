# 发布与维护

1. 从干净检出执行 `python scripts/build.py`。
2. 运行核心与浏览器测试，查看 Actions 中的结果。
3. 确认新增素材的授权、第三方声明及用户可见版本一致。
4. 推送 `main` 后，GitHub Actions 构建、测试并发布 GitHub Pages。
5. 如需发行离线 ZIP，将 `index.html`、完整 `assets/`、`LICENSE` 与 `THIRD_PARTY_NOTICES.md` 放在同级目录；源码 ZIP 另包括 `src/`、`data/`、脚本和文档。

生成的 bundle 不提交版本库；本地源码包交付时包含它们，便于直接打开网站。回滚在线站点时回滚到经过验证的提交，再运行同一工作流。不要将编辑器文档复制进用户导出的 Minecraft 运行包。
