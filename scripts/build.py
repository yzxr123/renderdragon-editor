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
    packed = base64.b64encode(gzip.compress(archive.getvalue(), mtime=0)).decode('ascii')
    bundle = 'window.RenderDragonTemplateGzipBase64 =\n' + json.dumps(packed) + ';\n'
    (ROOT/'assets/template-bundle.js').write_text(bundle, encoding='utf-8')
    painter = ROOT/'src/painter.html'
    html = painter.read_text(encoding='utf-8')
    def resolve(name):
        path = (painter.parent/name).resolve()
        if not path.is_relative_to(ROOT):
            raise ValueError('Asset outside project: '+name)
        return path.read_text(encoding='utf-8')
    html = re.sub(r'<script src="([^"]+)"></script>', lambda m:'<script>'+resolve(m[1]).replace('</script', r'<\/script')+'</script>', html)
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m:'<style>'+resolve(m[1])+'</style>', html)
    (ROOT/'assets/painter-doc.js').write_text('window.RenderDragonPainterDocument = '+json.dumps(html,ensure_ascii=False)+';\n',encoding='utf-8')
    print('Built template-bundle.js and painter-doc.js')

if __name__=='__main__':
    build()
