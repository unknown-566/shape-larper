// One transparent native surface. Every game panel is composed by the same canvas.
const {app,BrowserWindow,ipcMain,screen}=require('electron');
const path=require('path');
let main=null,desktop=false,menuBounds=null,displayId=null;
function menuRect(area){const width=Math.min(960,area.width),height=Math.min(640,area.height);return{x:area.x+Math.round((area.width-width)/2),y:area.y+Math.round((area.height-height)/2),width,height}}
function createMain(){
 const display=screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
 main=new BrowserWindow({...menuRect(display.workArea),frame:false,transparent:true,backgroundColor:'#00000000',thickFrame:false,hasShadow:false,resizable:false,maximizable:false,fullscreenable:false,show:false,title:'Shape Larper v'+app.getVersion(),autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,backgroundThrottling:false}});
 main.setMenu(null);main.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 main.once('ready-to-show',()=>main.show());
 main.on('page-title-updated',e=>e.preventDefault());
 main.on('closed',()=>{main=null;app.quit()});
 main.loadFile(path.join(__dirname,'..','index.html'));
}
const trusted=event=>main&&!main.isDestroyed()&&event.sender===main.webContents;
ipcMain.handle('sl:desktop',(event,enabled)=>{
 if(!trusted(event))throw new Error('Unknown window');
 const display=screen.getDisplayMatching(main.getBounds());
 main.hide();
 if(enabled){if(!desktop)menuBounds=main.getBounds();desktop=true;displayId=display.id;main.setBounds(display.workArea,false)}
 else{desktop=false;displayId=null;const area=display.workArea;const b=menuBounds||menuRect(area);const width=Math.min(b.width,area.width),height=Math.min(b.height,area.height);main.setBounds({x:Math.max(area.x,Math.min(b.x,area.x+area.width-width)),y:Math.max(area.y,Math.min(b.y,area.y+area.height-height)),width,height},false)}
 return main.getBounds();
});
ipcMain.on('sl:present',event=>{if(trusted(event)&&!main.isVisible()){main.show();main.focus()}});
ipcMain.on('sl:minimize',event=>{if(trusted(event))main.minimize()});
ipcMain.on('sl:quit',event=>{if(trusted(event))app.quit()});
function displayChanged(){if(!desktop||!main)return;const display=screen.getAllDisplays().find(d=>d.id===displayId)||screen.getDisplayMatching(main.getBounds());displayId=display.id;main.setBounds(display.workArea,false)}
app.whenReady().then(()=>{createMain();screen.on('display-metrics-changed',displayChanged);screen.on('display-removed',displayChanged)});
app.on('window-all-closed',()=>app.quit());
