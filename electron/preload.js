const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('SL',{
 native:true,
 clearDesktop:()=>ipcRenderer.invoke('sl:clear-desktop'),
 lan:(action,value)=>ipcRenderer.invoke('sl:lan',action,value),
 lanSend:message=>ipcRenderer.send('sl:lan-send',message),
 onLan:callback=>ipcRenderer.on('sl:lan',(_,event)=>callback(event)),
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
