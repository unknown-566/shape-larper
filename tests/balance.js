const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{requestAnimationFrame=()=>0;localStorage.clear();let seed=718;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)});await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 const r=await page.evaluate(()=>{
  CFG.mus=CFG.vol=0;const card=name=>[...UP,...SAC].find(c=>c[0]===name),apply=name=>card(name)[2]();
  const health=()=>{E=[];spawn(1,100,100);startBoss();return[E[0].hp,boss.mhp,boss.pc]};
  newGame();stage=4;wave=2;const baseline=health();for(let i=0;i<12;i++){apply('Armor Plating');NP++}const defensive=health();for(let i=0;i<10;i++){apply('Overcharge');NP++}const offensive=health();NET.connected=true;const coop=health();NET.connected=false;
  const builds=[];for(const name of ['Overcharge','Heavy Barrel','Hair Trigger','Split Shot','Critical Strike','Titan Rounds']){newGame();for(let i=0;i<6;i++)apply(name);builds.push({name,dps:+dps().toFixed(2),dmg:U.dmg,rate:U.rate,multi:U.multi})}
  newGame();for(let j=0;j<30;j++)for(const c of [...UP,...SAC])if(c[0]!=='Supply Cache')c[2]();const capped=Object.entries(STAT_LIMITS).every(([k,[lo,hi]])=>U[k]>=lo&&U[k]<=hi),dashSafe=1.1*U.dashCd>.5;
  const saved=JSON.stringify({U,P,WALLET,runCoins});for(const c of [...UP,...SAC]){preview(c);canOffer(c)}const pure=saved===JSON.stringify({U,P,WALLET,runCoins});
  Object.assign(U,U0());for(const [k,[,hi]] of Object.entries(STAT_LIMITS))U[k]=hi;U.dashCd=.65;Object.assign(U,{refl:1,hyper:1,vamp:1,adr:1,insurance:1,capital:1});P.hp=P.mhp=12;P.pc=100;deal();const fallback=cards.length===1&&cards[0]===SUPPLY_CARD;
  newGame();apply('Mirror Pulse');const noDuplicate=!canOffer(card('Mirror Pulse'));P.hp=P.mhp;const noWastedHeal=!canOffer(card('Medkit'));U.multi=4;const noBadPact=!canOffer(card('Hungry Pact'));
  newGame();apply('Capital Rounds');WALLET.coins=100000;runCoins=0;B=[];pb(0,0,0);const rich=B[0].d;WALLET.coins=0;B=[];pb(0,0,0);const poor=B[0].d;runCoins=100000;B=[];pb(0,0,0);const capital=B[0].d;
  newGame();stage=35;spawnQ=[{at:99999,k:0}];E=[];spawn(1,100,100);E[0].w=0;E[0].cd=0;P.inv=999;dt=1/60;upd();const endlessInterval=E[0].cd;eb(0,0,0,100);const endlessSpeed=Math.hypot(B.at(-1).vx,B.at(-1).vy);
  newGame();P.mhp=1;P.hp=1;U.rev=1;hurt();const validRevive=P.hp===1;
  newGame();NET.connected=true;NET.other={...P,x:100,y:100};U.orbs=2;const bothOrbs=orbs().length===4;NET.connected=false;
  newGame();P.x=800;P.y=500;NET.connected=true;NET.role='host';NET.other={...P,x:100,y:100,inv:1};NET.input={};U.aura=1;spawnQ=[{at:99999,k:0}];E=[];spawn(1,110,110);E[0].w=0;E[0].hp=100;dt=.26;upd();const guestAura=E[0].hp<100;
  E=[];startBoss();boss.intro=0;boss.x=NET.other.x;boss.y=NET.other.y;P.inv=0;NET.other.inv=0;const hp=P.hp;netPlayerStep();const guestContact=P.hp===hp-1;NET.connected=false;NET.role='';
  return{guestAura,guestContact,baseline,defensive,offensive,coop,builds,capped,dashSafe,pure,fallback,noDuplicate,noWastedHeal,noBadPact,rich,poor,capital,endlessInterval,endlessSpeed,validRevive,bothOrbs};
 });
 assert.deepEqual(r.baseline,r.defensive);assert.deepEqual(r.baseline,r.offensive);assert.ok(r.coop[1]/r.baseline[1]>1.6&&r.coop[1]/r.baseline[1]<1.7);for(const k of ['capped','dashSafe','pure','fallback','noDuplicate','noWastedHeal','noBadPact','validRevive','bothOrbs','guestAura','guestContact'])assert.ok(r[k],k);assert.equal(r.rich,r.poor);assert.equal(r.capital,1.25);assert.ok(r.endlessInterval>=.85&&r.endlessSpeed<=150);assert.deepEqual(errors,[]);
 const out=path.resolve(__dirname,'../../../backups/balance-v0.4.8.json');fs.writeFileSync(out,JSON.stringify(r,null,2));console.log(r);console.log('PASS: encounter independence, co-op scaling, useful draft/fallback, side-effect-free previews, all stat limits, bounded Endless, run-only capital and shared orbs');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
