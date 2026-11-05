// Persistent cosmetics are separate from run stats and existing save keys.
const RUN_ACH=new Set();
let WALLET={coins:0,earned:0,skins:['signal'],skin:'signal'},pendingPicks=0,pickOpened=0,runCoins=0;
try{const q=JSON.parse(localStorage.getItem('ng_wallet')||'null');if(q&&Number.isSafeInteger(q.coins)&&q.coins>=0)WALLET={...WALLET,...q,skins:Array.isArray(q.skins)?q.skins:['signal']}}catch{}
const SKINS=[['signal','Signal','#5ef2ff',3,0,null],['ember','Ember','#ff9856',3,150,'first'],['prism','Prism','#c49aff',4,450,'clean'],['crown','Crown','#ffe38a',5,900,'seal3'],['phantom','Phantom','#a0ffdc',6,1500,'noHitBoss'],['sovereign','Sovereign','#ff6fa5',8,2500,'throne']];
function walletSave(){try{localStorage.setItem('ng_wallet',JSON.stringify(WALLET))}catch{}}
function earn(amount){if(prac||NET.role==='guest')return;amount=Math.max(0,Math.floor(amount));WALLET.coins+=amount;WALLET.earned+=amount;runCoins+=amount;walletSave()}
function activeSkin(){return SKINS.find(s=>s[0]===WALLET.skin&&WALLET.skins.includes(s[0]))||SKINS[0]}
function buySkin(id){const s=SKINS.find(s=>s[0]===id);if(!s)return false;if(!WALLET.skins.includes(id)){if((s[5]&&!ADVS[s[5]])||WALLET.coins<s[4])return false;WALLET.coins-=s[4];WALLET.skins.push(id)}WALLET.skin=id;walletSave();return true}
function skinDraw(){menuBG();dim(.65);T('HANGAR',60,56,32,'#fff','left');T(WALLET.coins+' CREDITS',900,56,21,'#ffe38a','right');btn('Back',60,94,100,34,()=>S='title');
 SKINS.forEach((s,i)=>{const x=60+i%3*300,y=158+Math.floor(i/3)*213;menuPanel(x,y,280,196);g.strokeStyle=s[2];g.fillStyle=s[2]+'22';g.lineWidth=2.5;poly(x+140,y+48,24,s[3],-PI/2);g.fill();g.stroke();T(s[1],x+140,y+92,22,s[2]);const owned=WALLET.skins.includes(s[0]),locked=s[5]&&!ADVS[s[5]];const a=ADV.find(a=>a[0]===s[5]);T(locked?'Requires: '+(a?a[1]:s[5]):owned?'Unlocked':s[4]+' credits',x+140,y+123,13,'#a69abb');btn(WALLET.skin===s[0]?'Equipped':locked?'Locked':owned?'Equip':'Unlock',x+24,y+145,232,34,()=>buySkin(s[0]),{sz:15,c:s[2]})});
 T('Cosmetics only. Credits are kept after each run.',W/2,616,14,'#a69abb')}
const PICK={active:false,id:0,arrived:[true,true],ready:[false,false],scale:1,chosen:false,choice:-1};
const CARD_HOVER=[0,0,0];let upgradeButton=null;
function pickSide(){return NET.role==='guest'?1:0}
function pickReset(){Object.assign(PICK,{active:false,id:0,arrived:[true,true],ready:[false,false],scale:1,chosen:false,choice:-1})}
function openPicks(){
 if(NET.role==='guest'){netSend({type:'action',action:'picks'});return}
 if(PICK.active){S='pick';return}if(!pendingPicks||!['play','pause'].includes(S))return;
 if(!cards.length)deal();PV=cards.map(preview);Object.assign(PICK,{active:true,id:PICK.id+1,arrived:[true,!NET.connected],ready:[false,!NET.connected],scale:1,chosen:false,choice:-1});S='pick';pickOpened=t;lk=.45;M.d=M.r=0;
}
function pickCanChoose(){return lk<=0&&PICK.active&&!PICK.chosen&&PICK.arrived.every(Boolean)&&PICK.scale===0&&!PICK.ready[pickSide()]}
function pickFinish(){if(!PICK.ready.every(Boolean))return;PICK.active=false;PICK.scale=1;S='play';M.d=M.r=0;for(const k in K)K[k]=0;if(PICK.chosen)cards=[]}
function deferPicks(){if(!PICK.active)return;if(NET.role==='guest'){netSend({type:'action',action:'pick-ready',id:PICK.id});return}PICK.ready[0]=true;pickFinish()}
function pickChosen(i,side=0){PICK.chosen=true;PICK.choice=i;PICK.ready[side]=true;pickFinish()}
function pickSnapshot(){return{...PICK,arrived:[...PICK.arrived],ready:[...PICK.ready],names:cards.map(c=>c[0]),previews:PV}}
function receivePicks(snapshot){if(!snapshot||!Array.isArray(snapshot.arrived)||!Array.isArray(snapshot.ready))return;const first=snapshot.active&&(!PICK.active||PICK.id!==snapshot.id);Object.assign(PICK,{active:!!snapshot.active,id:snapshot.id,arrived:snapshot.arrived.slice(0,2),ready:snapshot.ready.slice(0,2),scale:cl(Number(snapshot.scale)||0,0,1),chosen:!!snapshot.chosen,choice:snapshot.choice});
 if(PICK.active){const catalog=[...UP,...SAC,...Object.values(EV).map(e=>e[0])];cards=(snapshot.names||[]).slice(0,3).map(name=>catalog.find(c=>c[0]===name)).filter(Boolean);PV=Array.isArray(snapshot.previews)?snapshot.previews:[];S='pick';if(first){pickOpened=t;lk=.45;M.d=M.r=0}netSend({type:'action',action:'pick-arrived',id:PICK.id})}
}
function simulationStep(){
 const real=dt;if(PICK.active&&NET.role!=='guest'){const floor=PICK.arrived.every(Boolean)?0:.12;PICK.scale=Math.max(floor,PICK.scale-real*2.2)}
 if(NET.role==='guest')return;
 if(S==='play'||(S==='pick'&&PICK.active&&PICK.scale>0)){
  const selecting=PICK.active,keys=selecting?{...K}:null,mouse=selecting?{d:M.d,r:M.r,jx:JX,jy:JY}:null;
  if(selecting){for(const k in K)K[k]=0;M.d=M.r=0;JX=JY=0;dt*=PICK.scale;S='play'}
  RT+=dt;if(HS>0)HS-=dt;else upd();
  if(selecting){Object.assign(K,keys);M.d=mouse.d;M.r=mouse.r;JX=mouse.jx;JY=mouse.jy;if(S==='play')S='pick';else if(['end','over','win'].includes(S))PICK.active=false}
 }dt=real;
}
function upgradeHit(){return upgradeButton&&MU.x>=upgradeButton.x&&MU.x<=upgradeButton.x+upgradeButton.w&&MU.y>=upgradeButton.y&&MU.y<=upgradeButton.y+upgradeButton.h}
function progressHud(){if(S!=='play'){upgradeButton=null;return}let x=686,y=H-76,w=244;
 if(DESKTOPMODE){const l=desktopLayout(),j=desktopShake();w=Math.min(244,(l.player.w-24)/l.ui);x=(l.player.x+l.player.w-12+j.x-l.ux)/l.ui-w;y=(l.player.y+48+j.y-l.uy)/l.ui}
 upgradeButton={x,y,w,h:36};const glow=pendingPicks?.5+.5*Math.sin(t*3):0;
 btn(pendingPicks?'UPGRADE · '+pendingPicks+'  [U]':'BUILD · '+NP,x,y,w,36,()=>{if(pendingPicks)openPicks()},{sz:14,c:pendingPicks?'#8feaf5':'#9b91ae'});
 T(WALLET.coins+' CR',x+w,y+50,12,'#ffe38a','right');if(glow){g.strokeStyle='rgba(100,240,255,'+glow*.55+')';g.lineWidth=1.5;g.strokeRect(x-2,y-2,w+4,40)}
}
function cardHit(i){return MU.x>45+i*300&&MU.x<315+i*300&&MU.y>148&&MU.y<524}
function cardText(text,x,y,maxWidth,size,color){g.font=size+'px '+F;while(size>10&&g.measureText(text).width>maxWidth){size--;g.font=size+'px '+F}T(text,x,y,size,color)}
function pickDraw(){dim(.84);T('CHOOSE YOUR EDGE',W/2,56,30);const status=NET.connected&&!PICK.arrived.every(Boolean)?'Waiting for second pilot · slow motion':PICK.scale>0?'Slowing down…':NET.connected?'Both pilots in menu · world paused':'World paused';T(status,W/2,94,15,'#a8dbe5');T(pendingPicks+' picks · '+WALLET.coins+' credits',W/2,122,14,'#b6a4d2');
 cards.forEach((c,i)=>{const age=cl((t-pickOpened-i*.075)/.32,0,1),ease=1-Math.pow(1-age,3),x=45+i*300,hover=cardHit(i)&&!PICK.chosen;CARD_HOVER[i]+=(Number(hover)-CARD_HOVER[i])*(1-Math.exp(-14*dt));const hv=CARD_HOVER[i];g.save();g.globalAlpha=age*(PICK.chosen&&PICK.choice!==i?.45:1);g.translate(x+135,156+(1-ease)*130-hv*8);g.rotate((1-ease)*(i-1)*.13+hv*cl((MU.x-x-135)/135,-1,1)*.015);g.scale(.88+.12*ease+hv*.015,1+hv*.015);const color=c[4]?'#ff6c98':c[5]?'#ffe38a':'#68e8f5';menuPanel(-135,0,270,364);g.strokeStyle=color;g.lineWidth=1.5+hv*1.5;g.globalAlpha*=.35+hv*.65;g.beginPath();g.roundRect(-134,1,268,362,16);g.stroke();g.globalAlpha=age*(PICK.chosen&&PICK.choice!==i?.45:1);icon(c[3],0,53,31+hv*3,color);cardText(c[0],0,108,240,22,color);
 let yy=144;for(const line of c[1].split('|'))yy=wr(line,-115,yy,230,18,'#c3b6da',14)+5;
 (PV[i]?.[0]||[]).slice(0,3).forEach((line,j)=>cardText(line,0,248+j*17,236,12,'#92cddd'));
 g.strokeStyle='#393052';g.lineWidth=1;g.beginPath();g.moveTo(-115,305);g.lineTo(115,305);g.stroke();
 T(PICK.chosen?(PICK.choice===i?'SELECTED':'TEAM CHOICE LOCKED'):c[4]?(c[4]==='hp'?'COST: 1 HP':'COST: 1 MAX HP'):'SELECT '+(i+1),0,331,13,color);g.restore()});
 const ready=PICK.ready[pickSide()];btn(ready?'Waiting for other pilot…':PICK.chosen?'Continue':'Keep for later · U',300,550,360,42,deferPicks,{sz:16});T(NET.connected?'One team upgrade · either pilot can choose · both confirm to resume':'Right-click to banish · '+P.bn+' remaining',W/2,616,12,'#a69abb');cv.style.cursor=cards.some((_,i)=>cardHit(i))&&pickCanChoose()?'pointer':'default';
}
// Small geometric insignia, rendered identically on every OS (no emoji fonts).
const ICONS=new Map();[...UP,...SAC,...Object.values(EV).map(e=>e[0])].forEach((c,i)=>ICONS.set(c[3],i%8));
function icon(id,x,y,r=16,color='#8ceaf5'){const n=ICONS.has(id)?ICONS.get(id):Math.abs([...String(id)].reduce((a,c)=>a+c.codePointAt(0),0))%8;g.save();g.translate(x,y);g.scale(r/20,r/20);g.strokeStyle=color;g.fillStyle=color+'22';g.lineWidth=1.8;g.lineJoin='round';g.beginPath();
 if(n===0){poly(0,0,16,6,PI/6);g.fill();g.stroke();g.beginPath();g.moveTo(0,-10);g.lineTo(0,10);g.moveTo(-10,0);g.lineTo(10,0)}
 if(n===1){g.moveTo(5,-18);g.lineTo(-11,2);g.lineTo(0,2);g.lineTo(-5,18);g.lineTo(12,-4);g.lineTo(1,-4);g.closePath()}
 if(n===2){for(let i=-1;i<=1;i++){g.moveTo(i*11,14);g.lineTo(i*11,-13+Math.abs(i)*6);g.lineTo(i*11-4,-7+Math.abs(i)*6);g.moveTo(i*11,-13+Math.abs(i)*6);g.lineTo(i*11+4,-7+Math.abs(i)*6)}}
 if(n===3){g.arc(0,0,13,0,7);g.moveTo(-20,0);g.lineTo(20,0);g.moveTo(0,-20);g.lineTo(0,20)}
 if(n===4){for(let i=0;i<2;i++){g.moveTo(-14+i*12,-14);g.lineTo(-3+i*12,0);g.lineTo(-14+i*12,14)}}
 if(n===5){g.moveTo(0,-18);g.lineTo(14,-12);g.lineTo(12,7);g.lineTo(0,18);g.lineTo(-12,7);g.lineTo(-14,-12);g.closePath();g.fill()}
 if(n===6){g.ellipse(0,0,19,8,-.6,0,7);g.moveTo(7,0);g.arc(0,0,7,0,7)}
 if(n===7){g.rect(-13,-13,26,26);g.moveTo(-7,0);g.lineTo(7,0);g.moveTo(0,-7);g.lineTo(0,7)}g.stroke();g.restore()}
const textOriginal=T;T=function(s,x,y,sz,c,al,w){if(ICONS.has(s)||/[\p{Extended_Pictographic}]/u.test(String(s))){icon(s,x,y,sz*.48,c||'#8ceaf5');return}textOriginal(s,x,y,sz,c,al,w)};
UP.push(['Bounty Hunter','Kills grant 50% more credits',()=>U.bounty+=.5,'bounty'],['Compound Interest','Wave clears grant +20 credits',()=>U.interest+=20,'interest'],['Liquid Armor','Spend 15 credits to block a hit|One block every 5 seconds',()=>U.insurance=1,'insurance'],['Capital Rounds','+1% damage per 100 credits|Up to +30% damage',()=>U.capital=1,'capital']);
for(const key of ['bounty','interest','insurance','capital'])ICONS.set(key,{bounty:3,interest:1,insurance:5,capital:2}[key]);
