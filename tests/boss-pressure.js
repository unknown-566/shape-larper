const assert=require('node:assert/strict'),path=require('node:path');const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{const p=await browser.newPage();await p.addInitScript(()=>{requestAnimationFrame=()=>0;localStorage.clear()});await p.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 const result=await p.evaluate(()=>{
  CFG.vol=CFG.mus=0;const runs=[];
  for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1],[Math.SQRT1_2,Math.SQRT1_2]])for(const evade of [false,true]){
   newGame();WM=1;DESKTOPMODE=0;NET.connected=false;P.hp=P.mhp=20;P.inv=0;P.x=480;P.y=320;P.dt=0;dt=1/60;startBoss();boss.intro=0;boss.sh=0;let armed=-1,early=false;
   for(let frame=0;frame<270;frame++){
    const dir=evade&&armed>=0?-1:1;P.mvx=x*dir;P.mvy=y*dir;P.x+=P.mvx*255*dt;P.y+=P.mvy*255*dt;wmShift();P.inv-=dt;bossPressure(boss);
    if(armed<0&&LZ.some(z=>z.cutoff))armed=frame;
    lzUpd();if(armed>=0&&frame-armed<52&&P.hp<20)early=true;
   }
   runs.push({x,y,evade,armed,early,hits:20-P.hp});
  }
  // All guardian implementations invoke the same counter, preserving their attacks.
  const guardians=[];for(let n=0;n<=NB;n++){newGame();WM=1;THR=n===NB?1:0;stage=n;startBoss();boss.intro=0;P.inv=999;P.mvx=1;P.mvy=0;let found=false;for(let i=0;i<600;i++){bossUpd();found||=LZ.some(z=>z.cutoff);lzUpd();B=[];E=[]}guardians.push(found)}
  newGame();WM=0;NET.connected=true;NET.role='host';NET.other={...P,mvx:1,mvy:0,dt:0};P.mvx=P.mvy=0;startBoss();boss.intro=0;boss.sh=0;for(let i=0;i<180;i++)bossPressure(boss);const guestTarget=LZ.some(z=>z.cutoff&&z.h===0);const wire=JSON.parse(JSON.stringify({boss,LZ}));
  const fixed=wire.LZ[0]?.p;NET.other.mvx=-1;bossPressure(boss);const locked=LZ[0]?.p===fixed;
  LZ=[];boss.cutoffCd=0;boss.sh=2;for(let i=0;i<120;i++)bossPressure(boss);const shieldSafe=LZ.length===0;
  NET.connected=false;P.mvx=P.mvy=0;boss.sh=0;for(let i=0;i<240;i++)bossPressure(boss);const stationarySafe=LZ.length===0;
  NET.connected=false;NET.role='';newGame();WM=1;DESKTOPMODE=1;P.hp=P.mhp=100;P.inv=0;spawnQ=[];E=[];startBoss();boss.intro=0;boss.hp=boss.mhp=10000;K.KeyD=1;M.d=1;let liveWarning=false;for(let i=0;i<600;i++){t+=dt;M.x=boss.x;M.y=boss.y;upd();liveWarning||=LZ.some(z=>z.cutoff)}K.KeyD=0;M.d=0;const liveHit=P.hp<100;
  return{runs,guardians,guestTarget,locked,shieldSafe,stationarySafe,liveWarning,liveHit};
 });
 for(const r of result.runs){assert.ok(r.armed>=60&&!r.early,JSON.stringify(r));assert.equal(r.hits>0,!r.evade,JSON.stringify(r))}assert.ok(result.guardians.every(Boolean));for(const k of ['guestTarget','locked','shieldSafe','stationarySafe','liveWarning','liveHit'])assert.ok(result[k],k);
 console.log('PASS: straight kiting intercepted in all directions including diagonal, warning harmless, reversal avoids hit; all eight bosses, guest targeting, locked network warning, shield/stationary guards');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
