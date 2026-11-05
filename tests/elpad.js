const {_electron}=require('playwright');
(async()=>{const app=await _electron.launch({executablePath:'require('path').join(__dirname,'..','node_modules','electron','dist','electron')',args:['--no-sandbox',require('path').join(__dirname,'..')]});
let mainErr=null;app.process().stderr.on('data',d=>{const s=String(d);if(/Uncaught|TypeError/.test(s))mainErr=s.slice(0,200)});
const p=await app.firstWindow();await p.waitForTimeout(1200);
await p.evaluate(()=>{navigator.getGamepads=()=>[{connected:true,axes:[0],buttons:[]}]});
await p.mouse.click(200,229);await p.waitForTimeout(3000);
const r=await p.evaluate(()=>({S,WM,Px:P.x,Py:P.y,windows:WE.size,lead:[LEAD.x,LEAD.y]}));
// the main process also refuses junk positions now
await p.evaluate(()=>SL.move([['sl_p',NaN,NaN],['sl_p',10,'x'],null]));await p.waitForTimeout(300);
console.log(r,'main process error:',mainErr,'still running:',await p.evaluate(()=>S));await app.close()})();
