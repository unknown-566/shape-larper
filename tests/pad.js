const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();for(const f of process.argv.slice(2)){const p=await b.newPage({viewport:{width:960,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.clear();navigator.getGamepads=()=>[{connected:true,axes:[0],buttons:[]}]});
await p.goto('file://'+f);await p.waitForTimeout(300);await p.mouse.click(200,229);await p.waitForTimeout(1500);
console.log(f.split('/').pop(),await p.evaluate(()=>({S,Px:P&&P.x,Py:P&&P.y,mvy:P&&P.mvy})),errs);await p.close()}await b.close()})();
