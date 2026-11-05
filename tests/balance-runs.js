// Invulnerable aim/movement bot: measures encounter pacing, not human difficulty.
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{const page=await browser.newPage();await page.addInitScript(()=>{requestAnimationFrame=()=>0;localStorage.clear();window.testSeed=1;Math.random=()=>((window.testSeed=(Math.imul(window.testSeed,1664525)+1013904223)>>>0)/4294967296)});await page.goto(pathToFileURL(path.resolve(process.argv[2]||'index.html')).href);
 const results=await page.evaluate(()=>{const rows=[];CFG.mus=CFG.vol=0;CFG.wm=0;
  for(const seed of [183,927])for(const style of ['offense','mixed','defense']){
   window.testSeed=seed;newGame();let frames=0,bossTime=0,lastBoss='',maxBoss=0;const times={},taken=[];
   while(frames++<60*60*30){dt=1/60;t+=dt;lk-=dt;
    if(S==='play'){P.inv=1;const target=boss&&boss.intro<=0?boss:E.find(e=>e.w<=0);if(target){M.x=target.x;M.y=target.y}M.d=1;K.KeyQ=P.pc>=100;K.KeyD=Math.sin(t*.7)>0;K.KeyA=!K.KeyD;}
    simulationStep();fx();
    if(boss){if(lastBoss!==boss.name){lastBoss=boss.name;bossTime=0}bossTime+=dt;times[lastBoss]=Math.round(bossTime);maxBoss=Math.max(maxBoss,bossTime)}
    if(S==='pick'&&lk<=0&&PICK.scale===0){
     const scores=cards.map(c=>{const before=snap(),pc=P.pc,base=dps();if(c[0]==='Total Gamble')return .4;if(c[0]==='Supply Cache')return 0;c[2]();const attack=Math.log(Math.max(.01,dps()/base)),defense=(P.mhp-before.mhp)*.15+(U.orbs-before.orbs)*.2+(U.rev-before.rev)*.35+(before.dashCd-U.dashCd)*.3;Object.assign(U,Object.fromEntries(Object.keys(U0()).map(k=>[k,before[k]])));Object.assign(P,{hp:before.hp,mhp:before.mhp,r:before.r,pc});return attack*(style==='offense'?3:style==='defense'?1:2)+defense*(style==='defense'?3:1)+(c[4]?-.15:.03)});
     const i=scores.indexOf(Math.max(...scores));taken.push(cards[i][0]);choose(i);
    }
    if(S==='end'||S==='over'||S==='win')break;
   }
   rows.push({seed,style,state:S,minutes:+(frames/3600).toFixed(2),maxBoss:Math.round(maxBoss),bossSeconds:times,dps:+dps().toFixed(2),taken});toMenu();
  }return rows;
 });
 for(const r of results)assert.equal(r.state,'end',JSON.stringify(r));const out=process.argv[3]?path.resolve(process.argv[3]):path.resolve(__dirname,'../../../backups/balance-runs-v0.4.8.json');fs.writeFileSync(out,JSON.stringify(results,null,2));console.log(results.map(({taken,bossSeconds,...r})=>r));console.log('PASS: six seeded full campaigns across offense/mixed/defense selection; invulnerable pacing bot only');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
