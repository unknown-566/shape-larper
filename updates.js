// The renderer receives only update status; it cannot choose download URLs or paths.
let UPDATE_STATE={phase:'idle',supported:false,automatic:true,currentVersion:'',version:null,percent:0};
const UPDATE_API=!!(window.SL&&SL.updateState);
if(UPDATE_API){SL.onUpdate(state=>UPDATE_STATE=state);SL.updateState().then(state=>UPDATE_STATE=state).catch(()=>{})}
function updateLabel(){switch(UPDATE_STATE.phase){
 case'checking':return'Checking for updates…';
 case'available':case'downloading':return'Downloading v'+UPDATE_STATE.version+' · '+UPDATE_STATE.percent+'%';
 case'ready':return'v'+UPDATE_STATE.version+' is ready to install';
 case'installing':return'Restarting to install…';
 case'current':return'You are up to date';
 case'error':return'Update unavailable · check your connection and retry';
 case'unsupported':return'Use the Windows installer for automatic updates';
 default:return'Updates from GitHub Releases';
}}
function updateAction(){
 if(!UPDATE_API)return;
 if(!UPDATE_STATE.supported){SL.updateInstaller();return}
 if(UPDATE_STATE.phase==='ready'){if(typeof saveD==='function')saveD();SL.installUpdate();return}
 if(['checking','downloading','available','installing'].includes(UPDATE_STATE.phase))return;
 SL.checkUpdates().then(state=>UPDATE_STATE=state).catch(()=>UPDATE_STATE={...UPDATE_STATE,phase:'error'});
}
function updateSettings(){
 if(!UPDATE_API)return;
 T(updateLabel(),76,498,12,UPDATE_STATE.phase==='error'?'#ff9ab1':'#b4a8ce','left','normal');
 const busy=['checking','downloading','available','installing'].includes(UPDATE_STATE.phase);
 const action=!UPDATE_STATE.supported?'Get installer':UPDATE_STATE.phase==='ready'?'Restart & update':busy?'Please wait…':'Check for updates';
 btn(action,72,516,238,36,updateAction,{sz:14,c:UPDATE_STATE.phase==='ready'?'#8ff5f2':busy?'#746b8a':'#d8d4ff'});
 if(UPDATE_STATE.supported)btn('Automatic updates · '+(UPDATE_STATE.automatic?'On':'Off'),322,516,316,36,()=>{SL.setAutoUpdates(!UPDATE_STATE.automatic).then(state=>UPDATE_STATE=state).catch(()=>{})},{sz:14});
}
function updateBanner(){
 if(!UPDATE_API||UPDATE_STATE.phase!=='ready')return;
 menuPanel(526,300,370,100);T('UPDATE READY',548,320,12,'#8ff5f2','left');
 btn('Restart & install v'+UPDATE_STATE.version,546,342,330,38,updateAction,{sz:16,c:'#b4fff8'});
}
