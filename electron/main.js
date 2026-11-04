// Desktop shell for Shape Larper. The game itself is index.html; this only
// gives its pop-ups real frameless windows, positions them natively and
// reports the cursor even when it is over the desktop between windows.
const {app,BrowserWindow,ipcMain,screen}=require('electron');
const path=require('path');
let main=null;const kids=new Map();
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

function createMain(){
  main=new BrowserWindow({width:960,height:640,useContentSize:true,backgroundColor:'#07060f',title:'Shape Larper v'+app.getVersion(),autoHideMenuBar:true,
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,backgroundThrottling:false}});
  main.setMenu(null);
  main.loadFile(path.join(__dirname,'..','index.html'));
  main.on('page-title-updated',e=>e.preventDefault());
  const wc=main.webContents;
  wc.setWindowOpenHandler(({frameName})=>{
    const player=frameName=='sl_p';
    return{action:'allow',overrideBrowserWindowOptions:{
      frame:false,resizable:false,maximizable:false,minimizable:false,fullscreenable:false,
      useContentSize:true,show:false,skipTaskbar:!player,hasShadow:false,
      // non-focusable keeps clicks on enemy windows from stealing focus (on Linux it would make them unmanaged and always on top)
      focusable:player||process.platform==='linux',
      alwaysOnTop:player,backgroundColor:'#04030a',enableLargerThanScreen:true,
      title:player?'Shape Larper':'',webPreferences:{backgroundThrottling:false}}}});
  wc.on('did-create-window',(w,{frameName})=>{
    kids.set(frameName,w);w.on('closed',()=>kids.delete(frameName));
    const player=kids.get('sl_p');
    // only the player window floats above everything, so enemy windows can never cover your view
    if(frameName=='sl_p'){w.setAlwaysOnTop(true,'screen-saver');w.show();w.focus()}
    else{w.showInactive();if(player&&!player.isDestroyed())player.moveTop()}});
  main.on('closed',()=>{main=null;app.quit()});
}
// never let a bad position from the page crash the app
ipcMain.on('sl:move',(_,list)=>{if(!Array.isArray(list))return;for(const it of list){if(!Array.isArray(it))continue;const [n,x,y]=it,w=kids.get(n);
  if(!w||w.isDestroyed()||!Number.isFinite(x)||!Number.isFinite(y))continue;try{w.setPosition(Math.round(x),Math.round(y))}catch(e){}}});
ipcMain.on('sl:main',(_,show)=>{if(!main)return;if(show){main.show();main.focus()}else main.hide()});
let lx=null,ly=null;
setInterval(()=>{if(!main||!kids.size)return;const p=screen.getCursorScreenPoint();if(p.x!==lx||p.y!==ly){lx=p.x;ly=p.y;main.webContents.send('sl:cur',p.x,p.y)}},8);

app.whenReady().then(createMain);
app.on('window-all-closed',()=>app.quit());
