const {_electron}=require('playwright');const {execSync}=require('child_process');
(async()=>{const app=await _electron.launch({executablePath:'require('path').join(__dirname,'..','node_modules','electron','dist','electron')',args:['--no-sandbox',require('path').join(__dirname,'..')]});
const errs=[];app.on('window',pg=>pg.on('pageerror',e=>errs.push(e.message)));
const p=await app.firstWindow();p.on('pageerror',e=>errs.push(e.message));await p.waitForTimeout(1500);
await p.mouse.click(200,229);await p.waitForTimeout(1200);
const st=await p.evaluate(()=>[S,WM,document.title]);
// two tight groups away from the player plus a loner
await p.evaluate(()=>{P.hp=P.mhp=999;spawnQ=[];E=[];for(const [k,x,y] of [[1,150,120],[1,175,135],[5,160,95],[2,820,520],[6,850,540],[0,820,130]])spawn(k,x,y)});
await p.waitForTimeout(700);
const cl=await p.evaluate(()=>[...WE.values()].map(r=>[r.key,r.ttl,(r.es||[]).length]));
await p.evaluate(()=>{window.__S=S;S='frz'});await p.waitForTimeout(250);execSync('import -window root el_merge.png');await p.evaluate(()=>{S=__S});
// player window follows movement
console.log('A',JSON.stringify(cl));const p0=await p.evaluate(()=>[WP.lx,WP.ly]);await p.evaluate(()=>{K.KeyD=1});await p.waitForTimeout(900);const p1=await p.evaluate(()=>[WP.lx,WP.ly]);await p.evaluate(()=>{K.KeyD=0});
// boss with its own health window, hit it so it shakes
console.log('B',p0,p1);await p.evaluate(()=>{E=[];spawnQ=[];stage=4;wave=2;begin();P.hp=P.mhp=999});await p.waitForTimeout(2600);
console.log('C');await p.evaluate(()=>{boss.hp=boss.mhp*.55;boss.hit=.1});await p.waitForTimeout(100);
const bw=await p.evaluate(()=>[...WE.values()].map(r=>[r.key,r.kind,r.lx,r.ly]));
await p.evaluate(()=>{S='frz';boss.hit=.1});await p.waitForTimeout(250);execSync('import -window root el_bossbar.png');
console.log('start',st,'clusters',JSON.stringify(cl),'player window x before/after moving right',p0,p1,'boss windows',JSON.stringify(bw),'errors',errs.slice(0,5));await app.close()})();
