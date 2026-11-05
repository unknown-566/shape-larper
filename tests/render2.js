const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error')errs.push(m.text())});
await p.addInitScript(()=>{window.requestAnimationFrame=()=>0});
await p.goto('file://'+process.argv[2]);
const jobs={menu:[[8,1]],wave:[[4,1],[4,2],[8,3]],boss:[[16,3]],final:[[16,3]],sfx:null};
const out=await p.evaluate(async(jobs)=>{const res={};const sr=44100;
 const wav=(buf)=>{const L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length,ab=new ArrayBuffer(44+n*4),dv=new DataView(ab),w=(o,s)=>{for(let j=0;j<s.length;j++)dv.setUint8(o+j,s.charCodeAt(j))};
  w(0,'RIFF');dv.setUint32(4,36+n*4,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*4,true);
  let pk=0;for(let j=0;j<n;j++){pk=Math.max(pk,Math.abs(L[j]),Math.abs(R[j]));dv.setInt16(44+j*4,Math.max(-1,Math.min(1,L[j]))*32767,true);dv.setInt16(46+j*4,Math.max(-1,Math.min(1,R[j]))*32767,true)}
  let bin='';const u=new Uint8Array(ab);for(let j=0;j<u.length;j+=8192)bin+=String.fromCharCode.apply(null,u.subarray(j,j+8192));return{b64:btoa(bin),peak:+pk.toFixed(3)}};
 for(const k in jobs){let secs;
  if(k=='sfx')secs=26;else{const sg=SONGS[k];secs=jobs[k].reduce((a,[bars])=>a+bars,0)*16*60/sg.bpm/4+2.5}
  const off=new OfflineAudioContext(2,Math.ceil(sr*secs),sr);AC=off;mkMix(off);MX.mus.gain.value=.8;MX.sfx.gain.value=1;
  if(k=='sfx'){const list=[['shot',0],['shot',.07],['shot',.14],['shot',.21],['shot',.28],['hit',.9],['hit',1.0],['kill',1.6,{r:12}],['kill',2.4,{r:19}],['bossHit',3.2],['bossHit',3.3],['hurt',4],['dash',5],['pulse',6],['boom',7.4],['bossWarn',9],['big',11],['pick',12],['sacrifice',13],['banish',15],['ui',16],['snipeCharge',16.6],['snipe',17.5],['blink',18.3],['alarm',19],['laserCharge',20],['laser',20.9],['pop',21.8],['chime',22.4],['ach',23.3],['bossDie',24.2]];
   for(const [n,t,a] of list)sfx(n,{...(a||{}),t:t+.05})}
  else{const sg=SONGS[k];let st=0,t=.05;for(const [bars,L] of jobs[k])for(let i=0;i<bars*16;i++){songStep(sg,st,t,L);st++;t+=60/sg.bpm/4}}
  res[k]=wav(await off.startRendering())}
 return res},jobs);
for(const k in out){fs.writeFileSync(`a2_${k}.wav`,Buffer.from(out[k].b64,'base64'));console.log(k,'peak',out[k].peak)}
console.log('errors',errs.slice(0,5));await b.close()})();
