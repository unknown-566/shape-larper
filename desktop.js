// Desktop compositor: one world transform, one clip mask, one world draw.
// Panels are just rectangles; bullets keep their world coordinates in the gaps.
let desktopPending=false,desktopTransition=0,desktopNeedsPresent=false;
let desktopRects=[],desktopPointer={x:0,y:0,seen:false};
const desktopBar={hf:0};
const playerFollow={x:null,y:null,stamp:-1},bossFollow={x:null,y:null,vx:0,vy:0,stamp:-1,id:null,side:'above'};
function resetDesktopMotion(){Object.assign(playerFollow,{x:null,y:null,stamp:-1});Object.assign(bossFollow,{x:null,y:null,vx:0,vy:0,stamp:-1,id:null,side:'above'})}
function desktopLayout(){
 const width=innerWidth,height=innerHeight;
 const panelScale=cl(Math.min(width/1440,height/900),.35,2)*(CFG.panelScale||1);
 const playerWidth=Math.min(width-24,768*panelScale),playerHeight=Math.min(height-110,512*panelScale);
 const player={kind:'p',x:(width-playerWidth)/2,y:cl(height*.56-playerHeight/2,78,height-playerHeight-16),w:playerWidth,h:playerHeight};
 if(NET.connected&&P){const z=cl(Math.min(width/W,height/H)*.9,.3,4);player.x=cl(width/2+(P.x-W/2)*z-playerWidth/2,12,width-playerWidth-12);player.y=cl(height/2+(P.y-H/2)*z-playerHeight/2,78,height-playerHeight-16)}
 if(P&&!NET.connected){
  const mx=Number.isFinite(P.mvx)?P.mvx:0,my=Number.isFinite(P.mvy)?P.mvy:0;
  const tx=cl(player.x+mx*Math.min(85,width*.08),12,width-playerWidth-12),ty=cl(player.y+my*Math.min(58,height*.07),78,height-playerHeight-16);
  if(playerFollow.x===null){playerFollow.x=tx;playerFollow.y=ty}
  if(playerFollow.stamp!==t){const k=1-Math.exp(-6*Math.min(.05,dt)*(S==='play'?1:PICK.active?PICK.scale:0));playerFollow.x+=(tx-playerFollow.x)*k;playerFollow.y+=(ty-playerFollow.y)*k;playerFollow.stamp=t}
  player.x=cl(playerFollow.x,12,width-playerWidth-12);player.y=cl(playerFollow.y,78,height-playerHeight-16);
 }
 const uiScale=Math.min(width/1008,height/688)*(CFG.uiScale||1);
 // A larger interface still fits: crop-free menus take precedence over magnification.
 const ui=Math.min(uiScale,(width-24)/W,(height-24)/H);
 return{width,height,panelScale,player,ui,ux:(width-W*ui)/2,uy:(height-H*ui)/2};
}
async function desktopStart(cb){
 if(desktopPending)return;
 desktopPending=true;const transition=++desktopTransition;
 try{
  await SL.desktop(true);if(transition!==desktopTransition)return;
  document.documentElement.classList.add('desktop-mode');DESKTOPMODE=1;WM=1;WP=null;WOX=WOY=0;desktopPointer.seen=false;
  fit();desktopPre();cb();desktopPre();desktopNeedsPresent=true;
  last=performance.now();frameDue=0;sched(window);
 }catch(error){DESKTOPMODE=WM=0;P=null;S='title';console.error('Desktop mode failed',error);await SL.desktop(false);fit();desktopNeedsPresent=true;sched(window)}
 finally{desktopPending=false}
}
function desktopStop(){
 ++desktopTransition;DESKTOPMODE=0;WM=0;desktopRects=[];desktopPointer.seen=false;
 document.documentElement.classList.remove('desktop-playing','desktop-mode');
 SL.desktop(false).then(()=>{fit();desktopNeedsPresent=true;sched(window)}).catch(console.error);
 wmBounds();
}
function desktopCamera(){return NET.connected?{x:W/2,y:H/2}:P}
function desktopPre(){
 const layout=desktopLayout();CX=layout.player.x+layout.player.w/2;CY=layout.player.y+layout.player.h/2;if(NET.connected){CX=innerWidth/2;CY=innerHeight/2}
 // Scale the world with available height, preserving the same combat distances.
 WSC=cl(Math.min(innerWidth/W,innerHeight/H)*.9,.3,4);
 if(desktopPointer.seen&&P){const j=desktopShake();M.x=desktopCamera().x+(desktopPointer.x-CX-j.x)/WSC;M.y=desktopCamera().y+(desktopPointer.y-CY-j.y)/WSC}
}
// A clamped panel must never conceal its own enemy. Clamp the simulation too,
// using world coordinates derived from this monitor's actual canvas transform.
function desktopContain(){
 if(!DESKTOPMODE||!P||NET.role==='guest')return;
 desktopPre();
 for(const e of [...E,...(boss?[boss]:[])]){
  const margin=(e.r||16)+8+12/WSC;if(NET.connected){e.x=cl(e.x,margin,W-margin);e.y=cl(e.y,margin,H-margin);continue}
  const minX=P.x+(8-CX)/WSC+margin,maxX=P.x+(innerWidth-8-CX)/WSC-margin;
  const minY=P.y+((e===boss?80:8)-CY)/WSC+margin,maxY=P.y+(innerHeight-8-CY)/WSC-margin;
  if(minX<=maxX)e.x=cl(e.x,minX,maxX);
  if(minY<=maxY)e.y=cl(e.y,minY,maxY);
 }
}
function desktopMouse(e){
 const layout=desktopLayout();desktopPointer={x:e.clientX,y:e.clientY,seen:true};
 MU.x=(e.clientX-layout.ux)/layout.ui;MU.y=(e.clientY-layout.uy)/layout.ui;CL=1;
 desktopPre();
}
function desktopPanels(layout){
 const {width,height,panelScale,player}=layout,panels=[];
 const screenPoint=e=>({x:CX+(e.x-desktopCamera().x)*WSC,y:CY+(e.y-desktopCamera().y)*WSC});
 const insidePlayer=c=>c.x>player.x+12&&c.x<player.x+player.w-12&&c.y>player.y+12&&c.y<player.y+player.h-12;
 const size=200*panelScale;
 // Cluster only nearby screen positions. Stable world positions never get
 // recentered to a clamped panel: that was the source of false bullet locations.
 const clusters=[];
 for(const e of [...E,...(NET.connected&&NET.other?[{...NET.other,k:0,c:SKINS.find(s=>s[0]===NET.skin)?.[2]||'#8feaff',r:15,hp:P.hp,mhp:P.mhp,friend:true}]:[])]){if(e.dead)continue;const c=screenPoint(e);if(insidePlayer(c))continue;
  if(c.x<-size/2||c.y<-size/2||c.x>width+size/2||c.y>height+size/2)continue;
  const q=clusters.find(q=>q.es.length<5&&Math.abs(q.x-c.x)<size*.32&&Math.abs(q.y-c.y)<size*.32);
  if(q){q.es.push(e);q.x+=(c.x-q.x)/q.es.length;q.y+=(c.y-q.y)/q.es.length}else clusters.push({x:c.x,y:c.y,es:[e]});
 }
 for(const q of clusters)panels.push({kind:'e',x:cl(q.x-size/2,4,width-size-4),y:cl(q.y-size/2,4,height-size-4),w:size,h:size,es:q.es,e:q.es[0]});
 if(boss){const c=screenPoint(boss),size=Math.min(420*panelScale,width-16,height-92);
  panels.push({kind:'b',x:cl(c.x-size/2,4,width-size-4),y:cl(c.y-size/2,78,height-size-4),w:size,h:size,e:boss,es:[boss],far:c.x<0||c.y<0||c.x>width||c.y>height});
 }
 panels.push(player);return panels;
}
function desktopHud(panel,layout){
 const ui=cl(Math.min(layout.width/1280,layout.height/800),.7,1.4)*(CFG.uiScale||1);
 g.save();g.translate(panel.x,panel.y);g.scale(ui,ui);const width=panel.w/ui,height=panel.h/ui;
 g.fillStyle='#090817dd';g.fillRect(2,2,width-4,40);g.fillRect(2,height-40,width-4,38);
 const hpStep=Math.min(18,(width*.55-20)/Math.max(1,P.mhp));
 for(let i=0;i<P.mhp;i++){g.strokeStyle='#ff4fa3';g.lineWidth=1.5;poly(14+i*hpStep,18,5,4,PI/4);if(i<P.hp){g.fillStyle='#ff4fa3';g.fill()}g.stroke()}
 T(String(score),width-12,20,20,'#fff','right');
 const dash=1-Math.max(0,P.dash)/(1.1*U.dashCd),pulse=P.pc/100;
 g.fillStyle='#25213d';g.fillRect(12,height-28,76,5);g.fillRect(104,height-28,76,5);
 g.fillStyle='#5ef2ff';g.fillRect(12,height-28,76*cl(dash,0,1),5);
 g.fillStyle='#b06cff';g.fillRect(104,height-28,76*cl(pulse,0,1),5);
 T('DASH',12,height-12,10,'#a5b0d1','left');T(P.pc>=100?'PULSE · Q':'PULSE',104,height-12,10,'#a5b0d1','left');
 const items=Object.values(own).slice(-4),space=width-306;
 if(space>32){const step=Math.min(25,space/Math.max(1,items.length));items.forEach((o,i)=>icon(o.i,200+i*step,height-20,9,'#e6ddff'))}
 T('ESC · PAUSE',width-12,height-16,10,'#9d96bb','right');
 g.restore();
}
function desktopBossAnchor(layout){
 if(!boss){bossFollow.id=null;return null}
 const panel=desktopRects.find(r=>r.kind==='b');if(!panel)return null;
 const scale=cl(layout.panelScale,.58,1.15),w=Math.min(layout.width-24,480*scale),h=64*scale;
 const center=CX+(boss.x-desktopCamera().x)*WSC;
 if(P.y<boss.y-24)bossFollow.side='below';else if(P.y>boss.y+24)bossFollow.side='above';
 const cy=CY+(boss.y-desktopCamera().y)*WSC,radius=boss.r*WSC;
 let targetY=bossFollow.side==='below'?cy+radius+14:cy-radius-h-14;
 const tx=cl(center-w/2,8,layout.width-w-8),ty=cl(targetY,8,layout.height-h-8),id=stage+':'+boss.n;
 if(bossFollow.id!==id||bossFollow.x===null){Object.assign(bossFollow,{id,x:tx,y:ty,vx:0,vy:0,stamp:t})}
 if(bossFollow.stamp!==t){const elapsed=Math.min(.05,dt),steps=3,d=elapsed/steps;for(let i=0;i<steps;i++){bossFollow.vx+=(100*(tx-bossFollow.x)-20*bossFollow.vx)*d;bossFollow.vy+=(100*(ty-bossFollow.y)-20*bossFollow.vy)*d;bossFollow.x+=bossFollow.vx*d;bossFollow.y+=bossFollow.vy*d}bossFollow.stamp=t}
 bossFollow.x=cl(bossFollow.x,8,layout.width-w-8);bossFollow.y=cl(bossFollow.y,8,layout.height-h-8);
 return{x:bossFollow.x,y:bossFollow.y,w,h,targetX:tx,targetY:ty,side:bossFollow.side};
}
function desktopRender(){
 const layout=desktopLayout();g=g0;CW=1;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(DK,0,0,DK,0,0);
 desktopPre();desktopContain();desktopRects=desktopPanels(layout);const j=desktopShake();g.save();g.translate(j.x,j.y);
 // All panels share this single world draw. The transparent gaps are outside
 // the clipping region, so neither background nor bullets are painted there.
 g.save();g.beginPath();for(const r of desktopRects)g.rect(r.x,r.y,r.w,r.h);g.clip();
 g.translate(CX-desktopCamera().x*WSC,CY-desktopCamera().y*WSC);g.scale(WSC,WSC);
 VW={x0:desktopCamera().x-CX/WSC,y0:desktopCamera().y-CY/WSC,x1:desktopCamera().x+(layout.width-CX)/WSC,y1:desktopCamera().y+(layout.height-CY)/WSC};
 drawWorld();xhair();VW=null;g.restore();
 for(const r of desktopRects){
  if(r.kind=='p')continue;
  g.save();g.beginPath();g.rect(r.x,r.y,r.w,r.h);g.clip();g.translate(r.x,r.y);g.scale(layout.panelScale,layout.panelScale);
  if(r.e?.friend){g.strokeStyle=r.e.c;g.lineWidth=2;g.strokeRect(1,1,r.w/layout.panelScale-2,r.h/layout.panelScale-2);T('CO-PILOT',12,18,12,r.e.c,'left')}else wmFrame(r,r.w/layout.panelScale,r.h/layout.panelScale);g.restore();
 }
 const player=layout.player;
 g.strokeStyle='#5ef2ff88';g.lineWidth=2;g.strokeRect(player.x+1,player.y+1,player.w-2,player.h-2);
 desktopHud(player,layout);
 if(flash>0&&CFG.fl){g.save();g.beginPath();for(const r of desktopRects)g.rect(r.x,r.y,r.w,r.h);g.clip();g.fillStyle=`rgba(${FLC},${flash*.35})`;g.fillRect(0,0,layout.width,layout.height);g.restore()}
 for(const r of desktopRects)impactFrame(r.x,r.y,r.w,r.h,r.kind==='p'?(P.ih>0?'#ff387b':'#7befff'):r.e?.c||'#bd8cff');
 if(S==='play'&&ban){g.save();const bw=Math.min(680,layout.width-32),bx=(layout.width-bw)/2;g.globalAlpha=Math.min(1,ban.t);g.fillStyle='#090817e8';g.fillRect(bx,8,bw,62);cardText(ban.a,layout.width/2,26,bw-24,14,'#b6a4d2');cardText(ban.b,layout.width/2,50,bw-24,24,'#fff');g.restore()}
 const anchor=desktopBossAnchor(layout);if(anchor){g.save();g.translate(anchor.x,anchor.y);g.scale(anchor.w/520,anchor.h/64);bossBar(desktopBar,520,64);g.restore()}g.restore();
 if(S!='play'){g.fillStyle='#04030ab8';g.fillRect(0,0,layout.width,layout.height)}
 g.save();g.translate(layout.ux,layout.uy);g.scale(layout.ui,layout.ui);
 if(S=='play'){toastDraw();progressHud()}else{overlays();toastDraw();tipDraw()}
 g.restore();document.documentElement.classList.toggle('desktop-playing',S=='play');
 if(desktopNeedsPresent){desktopNeedsPresent=false;SL.present()}
}
// After restoring the menu, present only once its correctly sized canvas is drawn.
function desktopPresentMenu(){if(desktopNeedsPresent&&!DESKTOPMODE){desktopNeedsPresent=false;SL.present()}}
