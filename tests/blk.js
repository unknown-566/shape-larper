const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:960,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('ng_cfg',JSON.stringify({wm:1}));let n=0;const o=window.open;window.open=function(...a){return ++n>1?null:o.apply(this,a)}});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);await p.mouse.click(200,229);await p.waitForTimeout(400);
const a=await p.evaluate(()=>[S,WM]);await p.screenshot({path:'blocked.png'});
await p.mouse.click(480,423);await p.waitForTimeout(400);const c=await p.evaluate(()=>[S,WM,CFG.wm]);
console.log('blocked:',a,'after Play Classic:',c,errs);await b.close()})();
