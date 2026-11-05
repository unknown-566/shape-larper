const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const handlers={},events={},screenEvents={};let created=0;
const display={id:7,workArea:{x:-1280,y:0,width:1280,height:720}};
class Window{
 constructor(options){created++;this.options=options;this.bounds={x:options.x,y:options.y,width:options.width,height:options.height};this.webContents={setWindowOpenHandler:fn=>this.popupHandler=fn};this.visible=false}
 setMenu(){} once(){} on(){} loadFile(){} getBounds(){return {...this.bounds}} setBounds(b){this.bounds={...b}} hide(){this.visible=false} show(){this.visible=true} focus(){} isDestroyed(){return false} isVisible(){return this.visible} minimize(){this.minimized=true}
}
const electron={BrowserWindow:Window,app:{whenReady:()=>({then:fn=>fn()}),on:(key,fn)=>events[key]=fn,getVersion:()=> '0.4.0',quit:()=>{}},screen:{getDisplayNearestPoint:()=>display,getCursorScreenPoint:()=>({x:0,y:0}),getDisplayMatching:()=>display,getAllDisplays:()=>[display],on:(key,fn)=>screenEvents[key]=fn},ipcMain:{handle:(key,fn)=>handlers[key]=fn,on:(key,fn)=>handlers[key]=fn}};
const context=vm.createContext({require:key=>key==='electron'?electron:key==='./lan'?{createLan:()=>({leave(){}})}:key==='./updater'?{createUpdateService:()=>({getState:()=>({phase:'unsupported'}),dispose(){}})}:require(key),__dirname:path.resolve(__dirname,'../electron')});
vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../electron/main.js'),'utf8'),context);
const main=vm.runInContext('main',context),sender={sender:main.webContents};
assert.equal(created,1);assert.ok(main.options.transparent);assert.equal(main.popupHandler().action,'deny');
const menu=main.getBounds();handlers['sl:desktop'](sender,true);assert.deepEqual(main.getBounds(),display.workArea);assert.equal(main.visible,false);
handlers['sl:present']({sender:{}});assert.equal(main.visible,false);handlers['sl:present'](sender);assert.equal(main.visible,true);
display.workArea={x:-1024,y:20,width:1024,height:600};screenEvents['display-metrics-changed']();assert.deepEqual(main.getBounds(),display.workArea);
handlers['sl:desktop'](sender,false);const restored=main.getBounds();assert.ok(restored.x>=-1024&&restored.x+restored.width<=0&&restored.height<=600);
assert.throws(()=>handlers['sl:desktop']({sender:{}},true));assert.equal(created,1);
console.log('Native overlay: one transparent window, no popups, trusted IPC, work-area/DPI updates and bounded menu restore.');
