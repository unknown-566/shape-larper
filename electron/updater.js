const fs=require('node:fs'),path=require('node:path');
function createUpdateService({app,updater=null,notify=()=>{},supported,platform=process.platform,preferencesPath,autoStart=true}){
 if(supported===undefined)supported=platform==='win32'&&app.isPackaged&&fs.existsSync(path.join(process.resourcesPath,'app-update.yml'))&&fs.existsSync(path.join(path.dirname(app.getPath('exe')),'Uninstall Shape Larper.exe'));
 const file=preferencesPath||path.join(app.getPath('userData'),'updates.json');let automatic=true;
 try{automatic=JSON.parse(fs.readFileSync(file,'utf8')).automatic!==false}catch(_){}
 let state={phase:supported?'idle':'unsupported',supported,automatic,currentVersion:app.getVersion(),version:null,percent:0};
 let active=null,disposed=false;const timers=[],listeners=[];
 const publish=patch=>{state={...state,...patch};if(!disposed)notify({...state})};
 if(supported){
  updater=updater||require('electron-updater').autoUpdater;
  updater.autoDownload=false;updater.autoInstallOnAppQuit=false;
  updater.allowDowngrade=false;updater.allowPrerelease=false;updater.disableWebInstaller=true;
  updater.logger={info(){},warn(){},error(){},debug(){}};
  const on=(event,fn)=>{updater.on(event,fn);listeners.push([event,fn])};
  on('checking-for-update',()=>publish({phase:'checking',percent:0}));
  on('update-not-available',()=>publish({phase:'current',version:null,percent:0}));
  on('update-available',info=>publish({phase:'available',version:info.version,percent:0}));
  on('download-progress',info=>{const percent=Math.max(0,Math.min(100,Math.floor(info.percent)));if(state.phase!=='downloading'||state.percent!==percent)publish({phase:'downloading',percent})});
  on('update-downloaded',info=>publish({phase:'ready',version:info.version,percent:100}));
  on('error',()=>publish({phase:'error'}));
 }
 async function check(){
  if(!supported||disposed||active||state.phase==='ready')return {...state};
  active=(async()=>{try{
   publish({phase:'checking',percent:0});const result=await updater.checkForUpdates();
   if(result?.isUpdateAvailable&&!disposed){publish({phase:'downloading',version:result.updateInfo.version,percent:0});await updater.downloadUpdate()}
  }catch(_){publish({phase:'error'})}finally{active=null}})();
  await active;return {...state};
 }
 function setAutomatic(value){
  automatic=value===true;fs.mkdirSync(path.dirname(file),{recursive:true});
  const temporary=file+'.tmp';fs.writeFileSync(temporary,JSON.stringify({automatic}));fs.renameSync(temporary,file);
  publish({automatic});if(automatic&&supported)void check();return {...state};
 }
 function install(){if(!supported||disposed||state.phase!=='ready')return false;publish({phase:'installing'});try{updater.quitAndInstall(true,true);return true}catch(_){publish({phase:'error'});return false}}
 function dispose(){disposed=true;for(const timer of timers){clearTimeout(timer);clearInterval(timer)}for(const [event,fn] of listeners)updater.removeListener(event,fn)}
 if(supported&&autoStart){const initial=setTimeout(()=>{if(automatic)void check()},5000),interval=setInterval(()=>{if(automatic)void check()},4*60*60*1000);initial.unref?.();interval.unref?.();timers.push(initial,interval)}
 return{getState:()=>({...state}),check,setAutomatic,install,dispose};
}
module.exports={createUpdateService};
