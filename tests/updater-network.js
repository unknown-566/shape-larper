const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');const {_electron}=require('playwright');
(async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'shape-update-network-')),payload=Buffer.concat([Buffer.from('MZ-test-only-never-executed'),Buffer.alloc(4096,7)]),hash=crypto.createHash('sha512').update(payload).digest('base64');
 let downloads=0;
 const server=http.createServer((req,res)=>{if(req.url.includes('latest.yml')){const good=!req.url.startsWith('/bad/'),version=req.url.startsWith('/old/')?'0.3.0':'0.4.2';res.setHeader('Content-Type','text/yaml');res.end('version: '+version+'\nfiles:\n  - url: setup.exe\n    sha512: '+(good?hash:Buffer.alloc(64).toString('base64'))+'\n    size: '+payload.length+'\npath: setup.exe\nsha512: '+(good?hash:Buffer.alloc(64).toString('base64'))+'\nreleaseDate: 2026-11-05T00:00:00.000Z\n')}else if(req.url.endsWith('/setup.exe')){downloads++;res.writeHead(200,{'Content-Length':payload.length,'Content-Type':'application/octet-stream'});res.end(payload)}else{res.writeHead(404);res.end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const app=await _electron.launch({executablePath:path.resolve(process.argv[2]||'dist/win-unpacked/Shape Larper.exe')});
 try{
  const results=await app.evaluate(async({app},{url,directory})=>{
   const {createRequire}=process.getBuiltinModule('module');const require=createRequire(process.resourcesPath+'/app.asar/package.json');const fs=require('fs'),path=require('path'),root=path.join(process.resourcesPath,'app.asar');
   const {NsisUpdater}=require(path.join(root,'node_modules/electron-updater'));
   const {ElectronHttpExecutor}=require(path.join(root,'node_modules/electron-updater/out/electronHttpExecutor'));
   const {createUpdateService}=require(path.join(root,'electron/updater.js'));const results={};
   for(const scenario of ['good','bad','old']){
    const dir=path.join(directory,scenario);fs.mkdirSync(dir);const config=path.join(dir,'app-update.yml');fs.writeFileSync(config,'updaterCacheDirName: cache\n');
    const adapter={version:'0.4.1',name:'shape-update-test',isPackaged:true,appUpdateConfigPath:config,userDataPath:dir,baseCachePath:dir,whenReady:async()=>{},onQuit(){},quit(){throw Error('Test must not quit or execute an installer')},relaunch(){throw Error('Test must not relaunch')}};
    const updater=new NsisUpdater(null,adapter);updater.httpExecutor=new ElectronHttpExecutor();updater.setFeedURL({provider:'generic',url:url+'/'+scenario});updater.disableDifferentialDownload=true;
    const service=createUpdateService({app,updater,supported:true,preferencesPath:path.join(dir,'prefs.json'),autoStart:false});await service.check();results[scenario]=service.getState().phase;service.dispose();
   }
   return results;
  },{url,directory});
  assert.deepEqual(results,{good:'ready',bad:'error',old:'current'});assert.equal(downloads,2);console.log(JSON.stringify({realNsisUpdater:results,downloads,installerExecuted:false},null,2));
 }finally{await app.close();await new Promise(r=>server.close(r));if(path.dirname(path.resolve(directory))!==path.resolve(os.tmpdir()))throw Error('Unsafe test cleanup path');fs.rmSync(directory,{recursive:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
