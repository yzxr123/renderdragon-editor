"""Build a single-request startup page, loading texture bytes only on demand."""
from pathlib import Path
import base64, gzip, io, json, re, shutil, tarfile
ROOT = Path(__file__).resolve().parents[1]

def assemble():
    target=ROOT/'_site'
    target.mkdir(exist_ok=True)
    shutil.copytree(ROOT/'assets',target/'assets',dirs_exist_ok=True)
    bundle=(ROOT/'assets/template-bundle.js').read_text(encoding='utf-8')
    packed=base64.b64decode(json.loads(bundle.split('=',1)[1].strip().rstrip(';')))
    (target/'assets/template.tar.gz').write_bytes(packed)
    with tarfile.open(fileobj=io.BytesIO(gzip.decompress(packed))) as archive:
        paths=[member.name for member in archive if member.isfile()]
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    html=re.sub(r'<link\s+rel="stylesheet"\s+href="assets/[^\"]+"\s*/?>',lambda m:'<style>'+(ROOT/'assets/app.css').read_text(encoding='utf-8')+'</style>',html)
    def inline(match):
        name=match[1].split('?')[0]
        if name=='template-bundle.js':
            code='window.RenderDragonTemplatePaths='+json.dumps(paths)+';\n'+(ROOT/'assets/template-loader.js').read_text(encoding='utf-8')
        else:
            code=(ROOT/'assets'/name).read_text(encoding='utf-8')
        return '<script>'+code.replace('</script',r'<\/script')+'</script>'
    html=re.sub(r'<script src="assets/([^\"]+)"></script>',inline,html)
    status='''<div id="startupStatus" role="status" style="position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 18px;background:#23272b;color:#fff;border-radius:8px">正在加载编辑器…</div>
<script>setTimeout(function(){var status=document.getElementById('startupStatus');if(status)status.textContent='加载时间较长，请检查网络后刷新；也可使用 GitHub Release 中的离线版。';},15000);window.addEventListener('error',function(event){var status=document.getElementById('startupStatus');if(status)status.textContent='编辑器加载失败：'+(event.message||'资源无法读取')+'，请刷新重试。';});</script>'''
    html=html.replace('<body>','<body>'+status,1)
    (target/'index.html').write_text(html,encoding='utf-8')
    for name in ['LICENSE','THIRD_PARTY_NOTICES.md']:
        shutil.copy2(ROOT/name,target/name)
    print('Prepared _site: inline startup, lazy texture catalog')
if __name__=='__main__':
    assemble()
