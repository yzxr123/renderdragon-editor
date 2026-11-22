# 贡献指南

先运行 `python scripts/build.py` 和 `node --test tests/core.test.mjs`。交互、导入导出或画板变更还应运行浏览器测试。

- 源码文件使用 kebab-case，函数和局部变量使用 camelCase，常量集合使用 UPPER_SNAKE_CASE。
- 使用明确的领域名称，如 `workspace`、`registry`、`paintState`、`roughness`。数学中的 x/y、RGB 分量和短循环索引可保留惯用符号。
- Minecraft JSON 字段、纹理路径、公开桥接 API 与本地存储键是兼容接口，不要仅为美观改名。
- 修改 `src/` 与 `data/template/` 源文件，不要直接修改生成的两个 bundle。
- 修复问题时添加能复现该问题的最小回归测试；保持无运行时外部依赖。
- PR 说明触发条件、改变后的行为、测试结果以及尚未覆盖的情况。
- 不提交凭据、个人路径、资源包私有素材、缓存、日志或构建输出。

提交代码和素材前确认拥有相应权利。贡献按本仓库 MIT 许可提供，已有第三方版权与许可声明必须保留。
