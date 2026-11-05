// NODE_PATH may point to an external Playwright installation; uses installed Chrome.
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const context=await browser.newContext({viewport:{width:960,height:640},screen:{width:1920,height:1080},deviceScaleFactor:2});
  const errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
  const page=await context.newPage();
  await page.addInitScript(()=>{localStorage.clear();window.requestAnimationFrame=()=>0;Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(screen,'availWidth',{get:()=>1920});Object.defineProperty(screen,'availHeight',{get:()=>1080})});
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  const result=await page.evaluate(()=>{
   CFG.vol=0;CFG.mus=0;go();dt=1/60;P.inv=999;
   const initial=DK;for(let i=0;i<45;i++)qualitySample(33);
   const auto={low:lowFX(),scale:DK};
   CFG.quality='high';fit();const forcedHigh=!lowFX();
   CFG.quality='low';cycleQuality();const cycle={quality:CFG.quality,scale:DK};
   CFG.quality='low';PIXELCAP=1;fit();PT=[];for(let i=0;i<100;i++)burst(400,300,'#fff',90);
   const particles=PT.length;
   // A late-wave scene exercises actual drawing, collisions and boss logic.
   stage=5;spawnQ=[];for(let i=0;i<30;i++)spawn(i%10,80+(i%10)*80,80+Math.floor(i/10)*100);
   for(let i=0;i<300;i++)eb(480,320,i*.31,150);
   for(let i=0;i<120;i++){t+=dt;P.inv=999;upd();fx();render()}
   CFG.quality='high';drawWorld();const cache=NEBULA.size;drawWorld();const cacheStable=cache===NEBULA.size;
   CFG.quality='low';S='set';BT=[];render();const graphicsButton=BT.find(b=>b.y===198&&b.x===508);graphicsButton.f();
   return {initial,auto,forcedHigh,cycle,particles,finite:Number.isFinite(P.x)&&Number.isFinite(P.y),cache,cacheStable,setting:CFG.quality};
  });
  assert.equal(result.initial,2);assert.deepEqual(result.auto,{low:true,scale:1});
  assert.equal(result.forcedHigh,true);assert.deepEqual(result.cycle,{quality:'high',scale:2});
  assert.ok(result.particles<=160);assert.ok(result.finite);assert.ok(result.cache>0);assert.ok(result.cacheStable);assert.equal(result.setting,'high');
  const windows=await page.evaluate(()=>{
   CFG.quality='low';CFG.wm=1;toMenu();go();dt=1/60;wmPre();wmSync();
   const first=[WP.lx,WP.ly];P.mvx=1;shake=30;RCL.x=30;wmSync();
   const stable=WP.lx===first[0]&&WP.ly===first[1];
   stage=5;spawnQ=[];for(let i=0;i<10;i++)spawn(i,900,180+i*40);
   wmRender();const count=WE.size,scale=WP.cv.width/WP.w.innerWidth;
   WP.w.close();wmPre();const closed=S==='pause'&&!WP;
   wmReopen();wmPre();wmRender();const reopened=!!WP&&!WP.w.closed;
   toMenu();return{stable,count,scale,closed,reopened,remaining:WE.size};
  });
  assert.ok(windows.stable);assert.ok(windows.count>0);assert.equal(windows.scale,1);assert.ok(windows.closed);assert.ok(windows.reopened);assert.equal(windows.remaining,0);
  const cadence=await page.evaluate(()=>{
   const counts={};let now=0,frames=0;performance.now=()=>now;
   sched=()=>{};render=()=>frames++;fx=()=>{};WM=0;S='title';
   for(const hz of [60,75,120,144]){frames=0;last=frameDue=0;for(let i=0;i<hz;i++){now=1000+i*1000/hz;loop()}counts[hz]=frames}
   return counts;
  });
  for(const count of Object.values(cadence))assert.ok(count>=59&&count<=61);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({result,windows,cadence,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
