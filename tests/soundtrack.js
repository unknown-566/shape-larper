const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{requestAnimationFrame=()=>0;localStorage.clear()});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 for(const kind of ['menu','wave','boss','final']){
  const result=await page.evaluate(async kind=>{
   const sg=SONGS[kind],rate=22050,duration=32*16*60/sg.bpm/4+3;
   AC=new OfflineAudioContext(2,Math.ceil(rate*duration),rate);mkMix(AC);MX.mus.gain.value=.6;
   MX.dL.delayTime.value=MX.dR.delayTime.value=60/sg.bpm*.75;
   let count=0;const original=stringNote;stringNote=(...args)=>{count++;return original(...args)};
   for(let i=0;i<512;i++)songStep(sg,i,.05+i*60/sg.bpm/4,1);
   stringNote=original;const rendered=await AC.startRendering(),data=rendered.getChannelData(0);let peak=0,sum=0,finite=true;
   for(const x of data){finite&&=Number.isFinite(x);peak=Math.max(peak,Math.abs(x));sum+=x*x}
   let preview=null;if(kind==='wave'){const length=Math.floor(rate*32),bytes=new Uint8Array(length*4),view=new DataView(bytes.buffer);for(let i=0;i<length;i++)for(let c=0;c<2;c++)view.setInt16(i*4+c*2,Math.max(-1,Math.min(1,rendered.getChannelData(c)[i]))*32767,true);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));preview=btoa(binary)}
   return{kind,peak,rms:Math.sqrt(sum/data.length),finite,count,cache:STRING_CACHE.size,preview};
  },kind);
  assert.ok(result.finite&&result.peak<1&&result.rms>.01,JSON.stringify({...result,preview:null}));assert.ok(result.count>100&&result.cache<=96);
  if(result.preview){const pcm=Buffer.from(result.preview,'base64'),header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(pcm.length+36,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(22050,24);header.writeUInt32LE(88200,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);const out=path.resolve(__dirname,'../../../exports/v0.4.6');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'Neon-Run-preview.wav'),Buffer.concat([header,pcm]))}
  delete result.preview;console.log(result);
 }
 const muted=await page.evaluate(()=>{CFG.mus=0;const before=MS.st;mTick();return MS.st===before});assert.ok(muted);assert.deepEqual(errors,[]);
 console.log('PASS: four complete 32-bar arrangements rendered, finite unclipped mix, bounded string cache, melody at low intensity, mute schedules no notes');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
