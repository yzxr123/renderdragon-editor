"""Rebuild offline assets using Python's standard library only."""
from pathlib import Path
import base64, gzip, io, json, re, tarfile

ROOT = Path(__file__).resolve().parents[1]

def build():
    archive = io.BytesIO()
    source = ROOT / 'data' / 'template'
    with tarfile.open(fileobj=archive, mode='w', format=tarfile.USTAR_FORMAT) as tar:
        for path in sorted(source.rglob('*')):
            if not path.is_file():
                continue
            raw = path.read_bytes()
            entry = tarfile.TarInfo(path.relative_to(source).as_posix())
            entry.size = len(raw)
            entry.mode = 0o644
            tar.addfile(entry, io.BytesIO(raw))
    compressed=gzip.compress(archive.getvalue(),mtime=0)
    (ROOT/'website/assets/template.tar.gz').write_bytes(compressed)
    packed = base64.b64encode(compressed).decode('ascii')
    bundle = 'window.RenderDragonTemplateGzipBase64 =\n' + json.dumps(packed) + ';\n'
    (ROOT/'website/assets/template-bundle.js').write_text(bundle, encoding='utf-8')
    painter = ROOT/'src/painter.html'
    html = painter.read_text(encoding='utf-8')
    def resolve(name):
        path = (painter.parent/name).resolve()
        if not path.is_relative_to(ROOT):
            raise ValueError('Asset outside project: '+name)
        return path.read_text(encoding='utf-8')
    html = re.sub(r'<script\s+src="([^"]+)"\s*>\s*</script>', lambda m:'<script>'+resolve(m[1]).replace('</script', r'<\/script')+'</script>', html)
    html = re.sub(r'<link\s+rel="stylesheet"\s+href="([^"]+)"\s*/?>', lambda m:'<style>'+resolve(m[1])+'</style>', html)
    if re.search(r'<(?:link|script)\b[^>]*\b(?:href|src)=', html):
        raise ValueError('Painter contains an asset reference that was not bundled')
    (ROOT/'website/assets/painter-doc.js').write_text('window.RenderDragonPainterDocument = '+json.dumps(html,ensure_ascii=False)+';\n',encoding='utf-8')
    build_page(source)
    print('Built complete website/')


def build_page(source):
    target=ROOT/'website'
    paths=[p.relative_to(source).as_posix() for p in sorted(source.rglob('*')) if p.is_file()]
    html=(ROOT/'src/index.html').read_text(encoding='utf-8')
    html=re.sub(r'<link\s+rel="stylesheet"\s+href="assets/[^\"]+"\s*/?>',lambda m:'<style>'+(ROOT/'website/assets/app.css').read_text(encoding='utf-8')+'</style>',html)
    def inline(match):
        name=match[1].split('?')[0]
        if name=='template-bundle.js':
            code='window.RenderDragonTemplatePaths='+json.dumps(paths)+';\n'+(ROOT/'website/assets/template-loader.js').read_text(encoding='utf-8')
        else:
            code=(ROOT/'website/assets'/name).read_text(encoding='utf-8')
        return '<script>'+code.replace('</script',r'<\/script')+'</script>'
    html=re.sub(r'<script src="assets/([^\"]+)"></script>',inline,html)
    status='''<div id="startupStatus" role="status" style="position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 18px;background:#23272b;color:#fff;border-radius:8px">正在加载编辑器…</div>
<script>setTimeout(function(){var status=document.getElementById('startupStatus');if(status)status.textContent='加载时间较长，请检查网络后刷新；也可使用 GitHub Release 中的离线版。';},15000);window.addEventListener('error',function(event){var status=document.getElementById('startupStatus');if(status)status.textContent='编辑器加载失败：'+(event.message||'资源无法读取')+'，请刷新重试。';});</script>'''
    html=html.replace('<body>','<body>'+status,1)
    (target/'index.html').write_text(html,encoding='utf-8')

if __name__=='__main__':
    build()
