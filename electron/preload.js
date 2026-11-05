const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('SL',{
 native:true,
 desktop:enabled=>ipcRenderer.invoke('sl:desktop',!!enabled),
 present:()=>ipcRenderer.send('sl:present'),
 minimize:()=>ipcRenderer.send('sl:minimize'),
 quit:()=>ipcRenderer.send('sl:quit'),
 updateState:()=>ipcRenderer.invoke('sl:update-state'),
 checkUpdates:()=>ipcRenderer.invoke('sl:update-check'),
 setAutoUpdates:value=>ipcRenderer.invoke('sl:update-auto',!!value),
 installUpdate:()=>ipcRenderer.invoke('sl:update-install'),
 updateInstaller:()=>ipcRenderer.send('sl:update-installer'),
 onUpdate:callback=>ipcRenderer.on('sl:update',(_,state)=>callback(state))
});
