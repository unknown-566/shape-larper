const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const output=path.resolve(__dirname,'../../../backups/overlay-qa-v0.4.0');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});const results=[];
 try{
  for(const [width,height,dpr] of [[800,600,1],[1366,768,1.25],[1920,1080,1],[2560,1440,1.5],[3840,2160,2],[900,1280,1]]){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr});const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{localStorage.clear();window.requestAnimationFrame=()=>0;window.__presents=0;window.SL={native:true,desktop:async enabled=>({width:innerWidth,height:innerHeight}),present:()=>__presents++,quit:()=>{},minimize:()=>{}}});
   await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);await page.waitForFunction(()=>typeof desktopRender==='function'&&typeof settingsDraw==='function');
   await page.evaluate(async()=>{CFG.vol=CFG.mus=0;CFG.quality='low';await desktopStart(()=>{newGame();P.hp=P.mhp=99;P.inv=999;spawnQ=[];stage=0;startBoss();boss.x=700;boss.y=220;boss.intro=0;for(let i=0;i<8;i++)spawn(i,50+i*110,150+(i%3)*130)});dt=1/60;desktopPre();wmBounds();TIP=null;BT=[];render()});
   const checks=await page.evaluate(()=>{
    const layout=desktopLayout();const original=drawWorld;let draws=0;drawWorld=()=>{draws++;original()};render();drawWorld=original;
    // A single transform maps the pointer to the same world position as rendering.
    desktopMouse({clientX:CX+123*WSC,clientY:CY-42*WSC});const aim=Math.abs(M.x-P.x-123)<.001&&Math.abs(M.y-P.y+42)<.001;
    const point=desktopRects[desktopRects.length-1];const alpha=(x,y)=>g0.getImageData(Math.round(x*DK),Math.round(y*DK),1,1).data[3];
    return{draws,aim,mode:DESKTOPMODE,gapAlpha:alpha(0,innerHeight-1),panelAlpha:alpha(point.x+point.w/2,point.y+point.h/2),panels:desktopRects.length,layoutFits:desktopRects.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=innerWidth+.01&&r.y+r.h<=innerHeight+.01),uiFits:layout.ux>=0&&layout.uy>=0};
   });
   assert.equal(checks.draws,1);assert.ok(checks.aim&&checks.mode&&checks.layoutFits&&checks.uiFits);assert.equal(checks.gapAlpha,0);assert.ok(checks.panelAlpha>0);assert.equal(context.pages().length,1);
   if(width===1366)await page.screenshot({path:path.join(output,'desktop.png')});
   await page.keyboard.press('Escape');await page.evaluate(()=>{BT=[];render()});assert.equal(await page.evaluate(()=>S),'pause');
   if(width===1366)await page.screenshot({path:path.join(output,'pause.png')});
   // Actual pointer events exercise the centered UI coordinate conversion.
   const settings=await page.evaluate(()=>{const l=desktopLayout();return{x:l.ux+480*l.ui,y:l.uy+336*l.ui}});await page.mouse.click(settings.x,settings.y);
   await page.evaluate(()=>{BT=[];render()});assert.equal(await page.evaluate(()=>S),'set');
   assert.ok(await page.evaluate(()=>BT.every(b=>b.x>=0&&b.y>=0&&b.x+b.w<=W&&b.y+b.h<=H)));
   const frozen=await page.evaluate(()=>[P.x,P.y,RT]);await page.evaluate(()=>{for(let i=0;i<5;i++)render()});assert.deepEqual(await page.evaluate(()=>[P.x,P.y,RT]),frozen);
   if(width===1366||width===800)await page.screenshot({path:path.join(output,'settings-'+width+'.png')});
   await page.keyboard.press('Escape');await page.evaluate(()=>{BT=[];render()});assert.equal(await page.evaluate(()=>S),'pause');
   await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>S),'play');
   // Resize, layout settings and a later wave keep every coordinate finite.
   await page.evaluate(()=>{CFG.panelScale=1.15;CFG.uiScale=1.15;for(let i=0;i<90;i++){dt=1/60;t+=dt;P.inv=999;upd();fx();BT=[];render()}});
   assert.ok(await page.evaluate(()=>Number.isFinite(P.x)&&Number.isFinite(P.y)&&desktopRects.every(r=>Number.isFinite(r.x+r.y+r.w+r.h))));
   await page.evaluate(()=>toMenu());await page.waitForFunction(()=>!DESKTOPMODE&&!WM);assert.equal(await page.evaluate(()=>S),'title');
   assert.deepEqual(errors,[]);results.push({width,height,dpr,...checks});await context.close();
  }
  console.log(JSON.stringify(results,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
