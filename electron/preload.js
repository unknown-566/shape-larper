// Small bridge the game uses when it runs as a desktop app.
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('SL',{
  native:true,
  move:list=>ipcRenderer.send('sl:move',list),       // [[frameName,x,y],...] once per frame
  main:show=>ipcRenderer.send('sl:main',!!show),     // show or hide the launcher window
  onCursor:f=>ipcRenderer.on('sl:cur',(_,x,y)=>f(x,y)) // cursor position anywhere on the desktop
});
