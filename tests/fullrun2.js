const assert=require('node:assert/strict'),path=require('node:path');const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:960,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.requestAnimationFrame=()=>0;localStorage.clear()});
await p.goto(pathToFileURL(path.resolve(process.argv[2]||'index.html')).href);
const mus=await p.evaluate(()=>{actx();S='play';P={x:0,y:0};boss=null;E=[];for(let i=0;i<64;i++)mTick();return [MS.k,MS.st,AC.state]});console.log('music',mus);
await p.evaluate(()=>{P=null;S='title'});const r=await p.evaluate(()=>{const log=[];go();let frames=0,bossT=0;const bossTimes={};let sac=0;
 while(frames<60*60*40){frames++;dt=1/60;t+=dt;lk-=dt;
  if(S=='play'){RT+=dt;P.hp=P.mhp=Math.max(P.mhp,3);P.inv=1;const tg=boss&&boss.intro<=0?boss:E.find(e=>e.w<=0);if(tg){M.x=tg.x;M.y=tg.y}M.d=1;K.KeyQ=P.pc>=100?1:0;
   K.KeyD=Math.sin(t*.7)>0?1:0;K.KeyA=Math.sin(t*.7)<0?1:0;if(HS>0)HS-=dt;else upd()}
  if(S!='pause'&&!(HS>0))fx();
  if(boss){bossT+=dt;bossTimes[boss.name]=bossT}else bossT=0;
  if(S==='play'&&pendingPicks)openPicks();
  if(S=='pick'&&lk<=0){let i=cards.findIndex(c=>c[4]);if(i<0||sac>=4)i=cards.findIndex(c=>!c[4]);if(cards[i][4])sac++;choose(i)}
  if(S=='end'){log.push('END at frame '+frames);break}
  if(S=='over'||S=='win'){log.push('ended '+S);break}
  if(frames%300==0){TIP=null;BT=[];render()}}
 TIP=null;BT=[];render();
 const o={adv:Object.keys(ADVS),seenNew:['e7','e8','e9'].map(k=>SEEN[k]),minutes:(frames/3600).toFixed(1),S,THR,DEBT,score,RT:fmtT(RT),win:SEEN.win,bossSeconds:Object.fromEntries(Object.entries(bossTimes).map(([k,v])=>[k,+v.toFixed(0)])),log};
 return o});
assert.equal(r.S,'end');assert.equal(errs.length,0);
await p.screenshot({path:path.resolve(__dirname,'../../../backups/coop-qa-v0.4.2/end.png')});
// endless continues into loop 2
const e2=await p.evaluate(()=>{lk=0;endless();const a=[S,stage,wave,THR];openPicks();lk=0;choose(0);return a.concat([S,stage,wave,!!boss])});
// practice the final boss
const pr=await p.evaluate(()=>{toMenu();PL=1;startPrac(NB);return [S,THR,DEBT,boss&&boss.name,boss&&boss.mhp]});
console.log(r,'endless',e2,'practice',pr,errs.slice(0,5));await b.close()})();
