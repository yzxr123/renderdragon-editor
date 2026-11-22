(function (global) {
  let pending;
  global.RenderDragonTemplateCatalog = {
    paths: global.RenderDragonTemplatePaths,
    async read(path) {
      if (!pending) {
        pending = (async () => {
          const response = await fetch("assets/template.tar.gz", {
            signal: AbortSignal.timeout(30000),
          });
          if (!response.ok)
            throw new Error("贴图库下载失败 HTTP " + response.status);
          const bytes = new Uint8Array(
            await new Response(
              response.body.pipeThrough(new DecompressionStream("gzip")),
            ).arrayBuffer(),
          );
          return new Map(
            global.RenderDragonCore.tarEntries(bytes).map((entry) => [
              entry.path,
              entry.data,
            ]),
          );
        })().catch((error) => {
          pending = null;
          throw new Error("贴图库加载失败，请稍后重试：" + error.message);
        });
      }
      const bytes = (await pending).get(path);
      if (!bytes) throw new Error("贴图库中没有 " + path);
      return bytes;
    },
  };
})(window);
