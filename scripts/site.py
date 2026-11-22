"""Assemble only browser runtime files for static hosting."""
from pathlib import Path
import shutil
ROOT = Path(__file__).resolve().parents[1]
def assemble():
    target = ROOT/'_site'
    target.mkdir(exist_ok=True)
    shutil.copy2(ROOT/'index.html',target/'index.html')
    shutil.copytree(ROOT/'assets',target/'assets',dirs_exist_ok=True)
    for name in ['LICENSE','THIRD_PARTY_NOTICES.md']:
        shutil.copy2(ROOT/name,target/name)
    print('Prepared _site')
if __name__=='__main__':
    assemble()
