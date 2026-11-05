// A locked, telegraphed interception punishes sustained straight-line kiting.
// Reuse laser simulation/snapshots/rebasing so both pilots see identical warnings.
function bossPressure(b){
 if(b.intro>0||b.sh>0)return;
 b.cutoffCd=Math.max(0,(b.cutoffCd??2.6)-dt);
 const pilots=NET.connected&&NET.other?[P,NET.other]:[P];
 const memory=b.kite||(b.kite=[{hold:0},{hold:0}]);
 for(let i=0;i<pilots.length;i++){
  const q=pilots[i],m=memory[i],x=q.mvx||0,y=q.mvy||0,len=Math.hypot(x,y);
  if(q.dt>0||len<.6){m.hold=0;m.x=m.y=0;continue}
  const nx=x/len,ny=y/len;
  m.hold=(nx*(m.x||0)+ny*(m.y||0)>.96?m.hold:0)+dt;m.x=nx;m.y=ny;
 }
 if(b.cutoffCd>0||LZ.length||b.m==='tele'||b.m==='dash'||b.m==='ab')return;
 // Alternate eligible pilots instead of always preferring the host.
 for(let k=0;k<pilots.length;k++){
  const i=((b.cutoffNext||0)+k)%pilots.length,q=pilots[i],m=memory[i];if(m.hold<1.15)continue;
  const h=Math.abs(q.mvy||0)>Math.abs(q.mvx||0)?1:0;
  let p=(h?q.y:q.x)+(h?q.mvy:q.mvx)*255*U.speed*1.04;
  if(!WM||NET.connected)p=cl(p,q.r||12,(h?H:W)-(q.r||12));
  las(p,h);LZ[LZ.length-1].cutoff=true;
  b.cutoffCd=4.8-Math.min(2,b.ph||0)*.4;b.cutoffNext=(i+1)%pilots.length;
  for(const m of memory)m.hold=0;
  break;
 }
}
