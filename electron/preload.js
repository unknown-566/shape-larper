const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('SL',{
 native:true,
 desktop:enabled=>ipcRenderer.invoke('sl:desktop',!!enabled),
 present:()=>ipcRenderer.send('sl:present'),
 minimize:()=>ipcRenderer.send('sl:minimize'),
 quit:()=>ipcRenderer.send('sl:quit')
});
