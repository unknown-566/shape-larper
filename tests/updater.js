const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EventEmitter}=require('node:events');const {createUpdateService}=require('../electron/updater');
(async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'shape-updater-test-')),preferencesPath=path.join(directory,'updates.json');
 class Updater extends EventEmitter{
  async checkForUpdates(){this.checks=(this.checks||0)+1;await new Promise(r=>setTimeout(r,5));if(this.fail)throw Error('offline');this.emit('update-available',{version:'0.4.2'});return{isUpdateAvailable:true,updateInfo:{version:'0.4.2'}}}
  async downloadUpdate(){this.downloads=(this.downloads||0)+1;this.emit('download-progress',{percent:42.9});this.emit('update-downloaded',{version:'0.4.2'})}
  quitAndInstall(...args){this.installArgs=args}
 }
 const app={getVersion:()=> '0.4.1',getPath:()=>directory},updater=new Updater(),states=[];
 const service=createUpdateService({app,updater,notify:s=>states.push(s),supported:true,preferencesPath,autoStart:false});
 assert.equal(service.install(),false);assert.equal(updater.autoInstallOnAppQuit,false);assert.equal(updater.autoDownload,false);assert.equal(updater.allowDowngrade,false);
 await Promise.all([service.check(),service.check()]);assert.equal(updater.checks,1);assert.equal(updater.downloads,1);assert.equal(service.getState().phase,'ready');assert.ok(states.some(s=>s.phase==='downloading'&&s.percent===42));
 assert.equal(updater.installArgs,undefined);assert.ok(service.install());assert.deepEqual(updater.installArgs,[true,true]);service.setAutomatic(false);service.dispose();
 const errorUpdater=new Updater();errorUpdater.fail=true;
 const errorService=createUpdateService({app,updater:errorUpdater,supported:true,preferencesPath,autoStart:false});assert.equal(errorService.getState().automatic,false);await errorService.check();assert.equal(errorService.getState().phase,'error');assert.equal(errorService.install(),false);
 errorUpdater.fail=false;await errorService.check();assert.equal(errorService.getState().phase,'ready');errorService.dispose();
 const portable=createUpdateService({app,supported:false,preferencesPath,autoStart:false});await portable.check();assert.equal(portable.getState().phase,'unsupported');assert.equal(portable.install(),false);portable.dispose();
 if(path.dirname(path.resolve(directory))!==path.resolve(os.tmpdir()))throw Error('Unsafe test cleanup path');fs.rmSync(directory,{recursive:true});console.log('Updater: coalescing, progress, ready-only explicit install, no install-on-quit, offline retry, preferences and portable fallback passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
