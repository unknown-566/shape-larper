// Original score: the same eight-bar melodic identity grows from menu to finale.
// Cached plucked strings add texture without banks of live oscillators.
const STRING_CACHE=new Map();
function stringNote(t,n,d,v=1,pan=0){
 const key=AC.sampleRate+':'+n;let buffer=STRING_CACHE.get(key);
 if(!buffer){const rate=AC.sampleRate,period=Math.max(2,Math.round(rate/mf(n))),ring=new Float32Array(period);let seed=n*7919;
  for(let i=0;i<period;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;ring[i]=seed/2147483648}
  buffer=AC.createBuffer(1,Math.ceil(rate*2),rate);const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){const k=i%period;data[i]=ring[k];ring[k]=.497*(ring[k]+ring[(k+1)%period])}
  if(STRING_CACHE.size>=96)STRING_CACHE.delete(STRING_CACHE.keys().next().value);STRING_CACHE.set(key,buffer);
 }
 const src=AC.createBufferSource();src.buffer=buffer;const g=vca(t,.003,v*.32,Math.min(1.8,d+.22));chain(src,g,pnr(pan),MX.syn);send(g,MX.dIn,.18);send(g,MX.mrev,.2);src.start(t);src.stop(t+Math.min(2,d+.3));
}
function electricKeys(t,n,d,v=1,pan=0){
 const f=mf(n),end=t+d+.5,carrier=osc('sine',f,t,end),mod=osc('sine',f*2,t,end),depth=vca(t,.002,f*.9,.22);
 mod.connect(depth);depth.connect(carrier.frequency);const g=vca(t,.004,v*.13,d+.35);chain(carrier,g,pnr(pan),MX.syn);send(g,MX.mrev,.25);send(g,MX.dIn,.12);
}
function shaker(t,v=.5,pan=0){chain(nzs(t,t+.065),flt('highpass',6500),vca(t,.003,.12*v,.045),pnr(pan),MX.drum)}
const SCORE_HOOK=hk([
 '7 - 7 10 12 - - 10 7 - 3 - 5 - 7 -',
 '3 - 3 7 10 - 7 - 3 - - - 2 - 0 -',
 '7 - 7 10 14 - - 12 10 - 7 - 3 - 7 -',
 '5 - - 7 2 - - - 5 - 7 - 2 - - -',
 '7 - 7 10 12 - - 14 15 - 14 - 12 - 7 -',
 '3 - 3 7 10 - 7 - 3 - 2 - 0 - - -',
 '7 - 10 - 14 - 12 - 10 - 7 - 3 - - -',
 '5 - 7 - 2 - - - 5 - 2 - 0 - - -'
]);
const SCORE_BOSS=hk([
 '7 - 7 10 12 - - 10 7 - 3 - 5 - 7 -',
 '3 - 3 7 10 - 7 - 3 - - - 2 - 0 -',
 '8 - 8 12 15 - - 12 8 - 5 - 7 - 8 -',
 '11 - 11 14 19 - 14 - 11 - 7 - 2 - - -',
 '12 - 12 10 7 - 10 - 12 - 14 - 15 - 14 -',
 '10 - 7 - 3 - 7 - 10 - 7 - 3 - - -',
 '8 - 12 - 15 - 12 - 8 - 7 - 5 - - -',
 '11 - 14 - 19 - 14 - 11 - 7 - 12 - - -'
]);
function scorePlay(b,s,t,sb,L,c){
 const menu=this.kind==='menu',heavy=this.kind==='boss'||this.kind==='final',final=this.kind==='final';
 const phrase=b%32,chorus=phrase>=8&&phrase<16||phrase>=28,breakdown=phrase>=24&&phrase<28;
 const soft=L===0,drive=soft?.3:menu?.52:1,hookV=soft?.55:menu?.85:chorus?1.05:.85;
 // Harmony has space: sustained voicings, offbeat keys, then a bass pickup.
 if(s===0)pad(t,[c.tn[0]+12,c.tn[1]+12,c.tn[2]+12],sb*15,breakdown?.65:.42);
 if([0,6,10].includes(s))for(let i=0;i<3;i++)electricKeys(t+i*.012,c.tn[i]+12,sb*(s===0?3:2),menu?.48:.32,(i-1)*.3);
 if(s%2===0&&!breakdown){const pattern=[0,0,2,0,0,1,2,2],k=pattern[s/2];bass(t,mf(c.tn[k]-12+(s===14?12:0)),sb*1.35,drive*.7,heavy?900:480)}
 if(breakdown&&s===0)bass(t,mf(c.r-12),sb*8,.45,350);
 // Recognizable melody is always present, never gated on enemy count.
 const hook=this.hook,bar=hook[b%hook.length],note=bar.find(q=>q[0]===s);
 if(note){const n=this.root+12+note[1],dur=note[2]*sb*.88;
  if(menu||breakdown){electricKeys(t,n,dur,hookV);stringNote(t+.006,n,dur,hookV*.6,-.15)}
  else{stringNote(t,n,dur,hookV*.9);lead(t,n,dur,hookV*(chorus||heavy?.8:.48));}
 }
 // A small answering figure fills phrase endings instead of competing with the hook.
 if(b%4===3&&s>=12&&s%2===0)stringNote(t,c.tn[s===12?2:1]+24,sb*1.6,.38,.45);
 if(soft)return;
 if(breakdown){if(s===0)kick(t,.48);if(s===10)shaker(t,.3);if(phrase===27&&s>=8&&s%2===0)snare(t,.18+(s-8)*.055);if(phrase===27&&s===0)riser(t,sb*15,.6);return}
 // Syncopated groove, accented backbeat and occasional short tom turnaround.
 if((menu?[0,10]:heavy?[0,6,8,10]:[0,6,8]).includes(s)||chorus&&s===14)kick(t,drive*(s===6?.72:.9));
 if(s===4||s===12){snare(t,drive*.7);if(chorus||heavy)clap(t,drive*.28)}
 if(s%2===0)shaker(t,drive*(s%4===0?.42:.7),s%4===0?-.3:.3);
 if((chorus||heavy)&&s%4===3)shaker(t,drive*.25,.4);
 if(!menu&&s===14)hat(t,.3,1,-.25);
 if(!menu&&b%8===7&&s>=13)tom(t,[180,145,110][s-13],.45);
 if(s===0&&phrase%8===0&&b>0)crash(t,menu?.25:.55);
 if(final&&chorus&&s%4===2)stringNote(t,c.tn[(s>>2)%3]+24,sb*1.4,.32,s%8<4?-.5:.5);
}
Object.assign(SONGS,{
 menu:{kind:'menu',title:'Afterglow',bpm:96,root:52,swing:.08,prog:[[0,'m'],[-4,'M'],[3,'M'],[-2,'M']],hook:SCORE_HOOK,play:scorePlay},
 wave:{kind:'wave',title:'Neon Run',bpm:124,root:52,swing:.045,prog:[[0,'m'],[-4,'M'],[3,'M'],[-2,'M']],hook:SCORE_HOOK,play:scorePlay},
 boss:{kind:'boss',title:'No Way Back',bpm:144,root:50,swing:.02,prog:[[0,'m'],[-4,'M'],[5,'m'],[7,'M']],hook:SCORE_BOSS,play:scorePlay},
 final:{kind:'final',title:'Last Light',bpm:156,root:49,swing:0,prog:[[0,'m'],[-4,'M'],[5,'m'],[7,'M']],hook:SCORE_BOSS,play:scorePlay}
});
