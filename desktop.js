// Desktop compositor: one world transform, one clip mask, one world draw.
// Panels are just rectangles; bullets keep their world coordinates in the gaps.
let desktopPending=false,desktopTransition=0,desktopNeedsPresent=false;
let desktopRects=[],desktopPointer={x:0,y:0,seen:false};
const desktopBar={hf:0};
function desktopLayout(){
 const width=innerWidth,height=innerHeight;
 const panelScale=cl(Math.min(width/1440,height/900),.35,2)*(CFG.panelScale||1);
 const playerWidth=Math.min(width-24,768*panelScale),playerHeight=Math.min(height-110,512*panelScale);
 const player={kind:'p',x:(width-playerWidth)/2,y:cl(height*.56-playerHeight/2,78,height-playerHeight-16),w:playerWidth,h:playerHeight};
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
function desktopPre(){
 const layout=desktopLayout();CX=layout.player.x+layout.player.w/2;CY=layout.player.y+layout.player.h/2;
 // Scale the world with available height, preserving the same combat distances.
 WSC=cl(Math.min(innerWidth/W,innerHeight/H)*.9,.3,4);
 if(desktopPointer.seen&&P){M.x=P.x+(desktopPointer.x-CX)/WSC;M.y=P.y+(desktopPointer.y-CY)/WSC}
}
function desktopMouse(e){
 const layout=desktopLayout();desktopPointer={x:e.clientX,y:e.clientY,seen:true};
 MU.x=(e.clientX-layout.ux)/layout.ui;MU.y=(e.clientY-layout.uy)/layout.ui;CL=1;
 desktopPre();
}
function desktopPanels(layout){
 const {width,height,panelScale,player}=layout,panels=[];
 const screenPoint=e=>({x:CX+(e.x-P.x)*WSC,y:CY+(e.y-P.y)*WSC});
 const insidePlayer=c=>c.x>player.x+12&&c.x<player.x+player.w-12&&c.y>player.y+12&&c.y<player.y+player.h-12;
 const size=200*panelScale;
 // Cluster only nearby screen positions. Stable world positions never get
 // recentered to a clamped panel: that was the source of false bullet locations.
 const clusters=[];
 for(const e of E){if(e.dead)continue;const c=screenPoint(e);if(insidePlayer(c))continue;
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
 if(space>32){const step=Math.min(25,space/Math.max(1,items.length));items.forEach((o,i)=>T(o.i+(o.n>1?'×'+o.n:''),200+i*step,height-20,14,'#e6ddff'))}
 T('ESC · PAUSE',width-12,height-16,10,'#9d96bb','right');
 g.restore();
}
function desktopRender(){
 const layout=desktopLayout();g=g0;CW=1;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(DK,0,0,DK,0,0);
 desktopPre();desktopRects=desktopPanels(layout);
 // All panels share this single world draw. The transparent gaps are outside
 // the clipping region, so neither background nor bullets are painted there.
 g.save();g.beginPath();for(const r of desktopRects)g.rect(r.x,r.y,r.w,r.h);g.clip();
 g.translate(CX-P.x*WSC,CY-P.y*WSC);g.scale(WSC,WSC);
 VW={x0:P.x-CX/WSC,y0:P.y-CY/WSC,x1:P.x+(layout.width-CX)/WSC,y1:P.y+(layout.height-CY)/WSC};
 drawWorld();xhair();VW=null;g.restore();
 for(const r of desktopRects){
  if(r.kind=='p')continue;
  g.save();g.beginPath();g.rect(r.x,r.y,r.w,r.h);g.clip();g.translate(r.x,r.y);g.scale(layout.panelScale,layout.panelScale);
  wmFrame(r,r.w/layout.panelScale,r.h/layout.panelScale);g.restore();
 }
 const player=layout.player;
 g.strokeStyle='#5ef2ff88';g.lineWidth=2;g.strokeRect(player.x+1,player.y+1,player.w-2,player.h-2);
 desktopHud(player,layout);
 if(boss){const scale=cl(layout.panelScale,.65,1.4),w=Math.min(layout.width-32,520*scale),h=64*scale;g.save();g.translate((layout.width-w)/2,12);g.scale(w/520,h/64);bossBar(desktopBar,520,64);g.restore()}
 if(flash>0&&CFG.fl){g.save();g.beginPath();for(const r of desktopRects)g.rect(r.x,r.y,r.w,r.h);g.clip();g.fillStyle=`rgba(${FLC},${flash*.35})`;g.fillRect(0,0,layout.width,layout.height);g.restore()}
 if(S!='play'){g.fillStyle='#04030ab8';g.fillRect(0,0,layout.width,layout.height)}
 g.save();g.translate(layout.ux,layout.uy);g.scale(layout.ui,layout.ui);
 if(S=='play'){banDraw();toastDraw()}else{overlays();toastDraw();tipDraw()}
 g.restore();document.documentElement.classList.toggle('desktop-playing',S=='play');
 if(desktopNeedsPresent){desktopNeedsPresent=false;SL.present()}
}
// After restoring the menu, present only once its correctly sized canvas is drawn.
function desktopPresentMenu(){if(desktopNeedsPresent&&!DESKTOPMODE){desktopNeedsPresent=false;SL.present()}}
