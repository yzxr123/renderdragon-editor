"""End-to-end checks using Chromium; starts a loopback-only static server."""
from pathlib import Path
import functools, http.server, json, os, threading
from playwright.sync_api import sync_playwright

PROJECT = Path(__file__).resolve().parents[1]
ROOT = PROJECT/'_site' if os.environ.get('EDITOR_TEST_SITE') else PROJECT
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def run():
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    errors = []
    try:
        with sync_playwright() as playwright:
            edge = Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
            browser = playwright.chromium.launch(headless=True, **({'executable_path':str(edge)} if edge.exists() else {}))
            page = browser.new_page(viewport={'width':1440,'height':900})
            requests=[]
            page.on('request',lambda request:requests.append(request.url))
            page.on('pageerror', lambda error:errors.append(str(error)))
            page.goto(f'http://127.0.0.1:{server.server_port}')
            page.wait_for_function('window.RenderDragonApp?.state?.open', timeout=60000)
            if os.environ.get('EDITOR_TEST_SITE'):
                assert not any('template.tar.gz' in url for url in requests), 'startup must not fetch texture bytes'
                assert page.locator('#startupStatus').count()==0
                page.route('**/assets/template.tar.gz',lambda route:route.abort())
                failure=page.evaluate('async()=>{try{await RenderDragonCore.readBytes(RenderDragonWorkspace.root,"textures/blocks/stone.png");return "unexpected success";}catch(error){return error.message;}}')
                assert '贴图库加载失败' in failure
                page.unroute('**/assets/template.tar.gz')
                image=page.evaluate('async()=>{const bytes=await RenderDragonCore.readBytes(RenderDragonWorkspace.root,"textures/blocks/stone.png");return {size:bytes.length,signature:[...bytes.slice(0,4)]};}')
                assert image['signature']==[137,80,78,71]
                assert page.evaluate('RenderDragonApp.state.open')
                page.locator('[data-tab="pbr"]').click()
                page.locator('#openPainterBtn').click()
            page.wait_for_function('document.querySelector("#painterFrame").contentWindow.RenderDragonPaint', timeout=30000)
            assert page.evaluate('RenderDragonApp.state.biomes.length') == 87
            if page.locator('#painterOverlay').is_visible():
                page.locator('#closePainterBtn').click()
            # Every category renders without a runtime error.
            for button in page.locator('#tabs button').all():
                button.click()
                assert page.locator('#editor').inner_text()
            result = page.evaluate('''async()=>{
              const core=RenderDragonCore, workspace=RenderDragonWorkspace;
              const check=(value,message)=>{if(!value)throw new Error(message);};
              const before=workspace.session.store.paths().length;
              try {await workspace.transaction(async()=>{await core.writeText(workspace.root,'rollback-check/new.txt','test');throw new Error('intentional rollback');});}catch(error){check(error.message==='intentional rollback','unexpected error');}
              check(workspace.session.store.paths().length===before,'rollback file leak');
              check(!workspace.session.store.directories.has('rollback-check'),'rollback directory leak');
              const empty=await workspace.preview();check(empty.empty===true,'untouched project should not export');
              workspace.setTarget('renderdragon');
              const state=await workspace.editorCall('state');
              const fog=core.clone(state.categories.fog.data);
              core.setPath(fog,'distance.air.fog_end',101.25);
              const staged=await workspace.stagePayload({categories:{fog}},'cherry_grove');check(staged.ok,'stage fog');
              const plan=await workspace.compile();check(plan.ok&&plan.files.has('manifest.json'),'compile manifest');
              check([...plan.files.keys()].some(path=>path.startsWith('fogs/')),'compile fog');
              const manifest=JSON.parse(new TextDecoder().decode(plan.files.get('manifest.json')));
              check(manifest.format_version===2,'manifest version');
              check(manifest.header.uuid!==manifest.modules[0].uuid,'unique UUIDs');
              const delta=await workspace.editorCall('site_delta_export');check(delta.ok&&delta.delta.entries.length>0,'delta export');
              const reset=await workspace.editorCall('restore');check(reset.ok,'restore');
              const imported=await workspace.editorCall('site_delta_import',{delta:delta.delta});check(imported.ok,'delta import');
              const root=new core.MemoryDirectoryHandle('imported-pack');
              await core.writeJson(root,'manifest.json',manifest);
              const original=await core.readText(root,'manifest.json');
              const opened=await workspace.open(root);check(opened.ok,'open imported source');
              const importedState=await workspace.editorCall('state');
              const next=core.clone(importedState.categories.fog.data);core.setPath(next,'distance.air.fog_end',77);
              check((await workspace.stagePayload({categories:{fog:next}},'cherry_grove')).ok,'stage imported source');
              check(await core.readText(root,'manifest.json')===original,'source mutated');
              check((await core.walk(root)).length===1,'source files added');
              localStorage.setItem('renderdragon_recipes','{}');
              check((await workspace.editorCall('state')).ok,'malformed recipe cache');localStorage.removeItem('renderdragon_recipes');
              return {catalogFiles:before,exportFiles:plan.files.size,deltaEntries:delta.delta.entries.length};
            }''')
            page.locator('#themeBtn').click()
            page.locator('#appearanceBtn').click()
            assert page.locator('#appearancePanel').is_visible()
            page.set_viewport_size({'width':390,'height':844})
            page.wait_for_timeout(100)
            assert page.locator('#editor').is_visible()
            page.set_viewport_size({'width':1440,'height':900})
            assert not errors, errors
            print(json.dumps({'ok':True,'checks':['startup','painter','all category tabs','transaction rollback','empty export','stage and compile','manifest UUIDs','delta roundtrip','read-only import','invalid recipe cache','theme','appearance','narrow viewport'],'details':result}))
            browser.close()
    finally:
        server.shutdown()

if __name__=='__main__':
    run()
