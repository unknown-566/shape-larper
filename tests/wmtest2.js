const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:960,height:640},screen:{width:1920,height:1080}});
const errs=[];ctx.on('page',pg=>pg.on('pageerror',e=>errs.push('popup:'+e.message)));
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>localStorage.setItem('ng_cfg',JSON.stringify({wm:1})));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
await p.mouse.click(200,229);await p.waitForTimeout(300);
const out={};
// big late wave, splitters included
await p.evaluate(()=>{P.hp=P.mhp=999;stage=5;wave=1;spawnQ=[];E=[];startWave();window.__mw=0;window.__ml=0;setInterval(()=>{__mw=Math.max(__mw,WE.size);__ml=Math.max(__ml,E.length)},30)});
await p.waitForTimeout(8000);
Object.assign(out,await p.evaluate(()=>({queued:spawnQ.length,maxWindows:__mw,maxLive:__ml,popups:0})));
out.openPopups=(ctx.pages().length-1);
// die -> over -> retry
await p.evaluate(()=>{P.hp=1;P.inv=0;U.rev=0;hurt();lk=0});await p.waitForTimeout(200);
out.afterDeath=await p.evaluate(()=>S);
await p.evaluate(()=>retry());await p.waitForTimeout(500);
out.afterRetry=await p.evaluate(()=>[S,WM,!!WP]);
// user closes player window
await p.evaluate(()=>WP.w.close());await p.waitForTimeout(150);
out.afterClose=await p.evaluate(()=>[S,WM,!!WP,WE.size]);
await p.screenshot({path:'status_closed.png'});
// reopen from the status tab (click = user gesture)
await p.mouse.click(480,333);await p.waitForTimeout(600);
out.afterReopen=await p.evaluate(()=>[S,WM,!!WP]);
// loop still running after reopen?
const t0=await p.evaluate(()=>t);await p.waitForTimeout(500);out.loopRuns=(await p.evaluate(()=>t))>t0;
await p.evaluate(()=>toMenu());await p.waitForTimeout(300);out.popupsAfterMenu=ctx.pages().length-1;
console.log(out,errs.slice(0,5));await b.close()})();
