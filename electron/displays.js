const fs=require('node:fs'),path=require('node:path');
function createDisplays({app,screen,getWindow,isDesktop,onSelected=()=>{}}){
 let preferred=null;const file=()=>path.join(app.getPath('userData'),'display.json');
 try{const saved=JSON.parse(fs.readFileSync(file(),'utf8'));if(Number.isSafeInteger(saved.id))preferred=saved.id}catch{}
 const available=()=>screen.getAllDisplays();
 const menuRect=area=>{const width=Math.min(960,area.width),height=Math.min(640,area.height);return{x:area.x+Math.round((area.width-width)/2),y:area.y+Math.round((area.height-height)/2),width,height}};
 function current(){const win=getWindow();return available().find(d=>d.id===preferred)||(win?screen.getDisplayMatching(win.getBounds()):screen.getDisplayNearestPoint(screen.getCursorScreenPoint()))}
 function list(){const d=current();return{selected:d.id,displays:available().map((s,i)=>({id:s.id,name:s.label||'Monitor '+(i+1),width:Math.round((s.size?.width||s.bounds?.width||s.workArea.width)*(s.scaleFactor||1)),height:Math.round((s.size?.height||s.bounds?.height||s.workArea.height)*(s.scaleFactor||1)),scale:s.scaleFactor||1}))}}
 function notify(){const win=getWindow();if(win&&!win.isDestroyed())win.webContents.send?.('sl:displays',list())}
 function select(id){const target=available().find(d=>d.id===id);if(!target)throw Error('Monitor is no longer connected');preferred=id;try{fs.writeFileSync(file(),JSON.stringify({id}))}catch{}const win=getWindow();if(win&&!win.isDestroyed())win.setBounds(isDesktop()?target.workArea:menuRect(target.workArea),false);onSelected(target);notify();return list()}
 function sync(){const win=getWindow();if(!win||win.isDestroyed())return;const found=available().find(d=>d.id===preferred);const target=found||screen.getDisplayMatching(win.getBounds());if(preferred!==null&&!found){preferred=target.id;try{fs.writeFileSync(file(),JSON.stringify({id:preferred}))}catch{}}if(isDesktop()||!found)win.setBounds(isDesktop()?target.workArea:menuRect(target.workArea),false);onSelected(target);notify()}
 return{current,list,select,sync,menuRect};
}
module.exports={createDisplays};
