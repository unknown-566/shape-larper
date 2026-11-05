const NET={role:'',connected:false,rooms:[],status:'Searching your local network…',other:null,input:{},sent:0,reward:0,skin:'signal',started:false};
function netSend(m){m={...m,runId:NET.runId};if(RELAY.active)relaySend(m);else window.SL?.lanSend?.(m)}
async function lanAction(action,value){const r=await window.SL?.lan?.(action,value);if(r?.error)NET.status=r.error;return r}
function openLan(){if(!window.SL?.lan){NET.status='LAN requires the desktop app.'}else{NET.status='Searching your local network…';lanAction('discover')}S='lan'}
function leaveLan(){relayLeave();lanAction('leave');Object.assign(NET,{role:'',connected:false,other:null,started:false});}
function lanDraw(){menuBG();dim(.7);menuPanel(60,110,840,470);T('CO-OP',60,56,32,'#fff','left');btn('Back',60,590,110,34,()=>{leaveLan();S='title'});wr(NET.status,90,140,770,19,'#8fe5f3',15);
 T('Two pilots · shared hull & upgrades · your own cosmetics',90,182,16,'#c2b4d8','left');btn('Host LAN',90,218,240,44,async()=>{if(NET.connected)return;relayLeave();NET.role='host';NET.status='Opening lobby…';await lanAction('host')});
 btn('Join by IP',350,218,240,44,()=>{document.getElementById('lan-ip').style.display='flex'});
 if(NET.connected&&NET.role==='host')btn('Launch co-op',610,218,250,44,()=>{NET.started=true;go()},{c:'#8ff5b0'});
 btn('Online · room code',90,278,310,40,openRelayForm,{sz:16,c:'#8fe5f3'});if(RELAY.code)btn('Copy room '+RELAY.code,430,278,430,40,()=>navigator.clipboard?.writeText(RELAY.code).catch(()=>{NET.status='Room '+RELAY.code}),{sz:14});else T('Relay requires a deployed server',430,298,14,'#b6a4d2','left');
 T('DISCOVERED LAN GAMES',90,346,13,'#a99ac0','left');NET.rooms.filter(r=>!NET.connected).slice(0,3).forEach((r,i)=>btn(r.name+' · '+r.address,90,366+i*49,770,40,()=>{NET.role='guest';NET.status='Connecting…';lanAction('join',r.address)},{sz:16}));
 if(!NET.rooms.length&&!NET.connected)T('Waiting for hosts… Refreshes automatically.',90,394,16,'#aa9cbb','left');
 T('LAN: same network. Online: both pilots use the same relay address and room code.',90,548,13,'#aa9cbb','left')}
const ipForm=document.createElement('form');ipForm.id='lan-ip';ipForm.style.cssText='display:none;position:fixed;inset:35% 10% auto;background:#151028;padding:24px;gap:12px;border:1px solid #68e8f5;z-index:40;flex-wrap:wrap';ipForm.innerHTML='<label>Host IPv4 <input aria-label="Host IPv4" placeholder="192.168.1.20" maxlength="15" required pattern="[0-9.]+"></label><button>Connect</button><button type="button">Cancel</button>';document.body.append(ipForm);ipForm.lastChild.onclick=()=>ipForm.style.display='none';ipForm.onsubmit=e=>{e.preventDefault();NET.role='guest';NET.status='Connecting…';lanAction('join',ipForm.querySelector('input').value.trim());ipForm.style.display='none'};
function validSnapshot(s){return s&&['play','pause','pick','over','end','win','set'].includes(s.S)&&s.P&&s.Q&&[s.P.x,s.P.y,s.Q.x,s.Q.y,s.P.hp].every(Number.isFinite)&&['E','B','LZ','BR'].every(k=>Array.isArray(s[k])&&s[k].length<4000)&&s.E.every(e=>e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&e.k>=0&&e.k<=9)&&s.B.every(b=>b&&Number.isFinite(b.x)&&Number.isFinite(b.y))}
async function handleNetEvent(e){
 if(e.type==='rooms')NET.rooms=e.rooms;
 if(e.type==='hosting')NET.status='Hosting · '+(e.addresses.join(' / ')||'local network')+' · waiting for a pilot';
 if(e.type==='error')NET.status=e.error;
 if(e.type==='disconnected'){NET.status='Connection closed. Host a new game or reconnect.';if(NET.started){toMenu();S='lan'}NET.connected=false;NET.other=null;NET.started=false;}
 if(e.type==='connected'){NET.role=e.role;NET.runId=0;NET.connected=true;NET.status=e.role==='host'?'Pilot joined. Ready to launch.':'Connected. Waiting for host to launch…';netSend({type:'skin',skin:WALLET.skin})}
 const m=e.message;if(!m)return;if(NET.role==='guest'&&m.type==='impact'&&['dash','kill','hurt','pulse','phase','boss'].includes(m.kind)&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&/^#[0-9a-f]{6}$/i.test(m.color)){impact(m.kind,m.x,m.y,m.color,true);return}
 if(m.type==='skin'&&SKINS.some(s=>s[0]===m.skin))NET.skin=m.skin;
 if(NET.role==='host'){
  if(m.type==='input'&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&Number.isFinite(m.ax)&&Number.isFinite(m.ay))NET.input={x:cl(m.x,-1,1),y:cl(m.y,-1,1),ax:cl(m.ax,-2000,3000),ay:cl(m.ay,-2000,3000),fire:!!m.fire,dash:!!m.dash,pulse:!!m.pulse,at:t};
  if(m.type==='action'&&m.action==='pause'&&S==='play')S='pause';
  if(m.type==='action'&&m.action==='picks')openPicks();
  if(m.type==='action'&&PICK.active&&m.id===PICK.id&&m.runId===NET.runId){if(m.action==='pick-arrived')PICK.arrived[1]=true;if(m.action==='pick-ready'){PICK.ready[1]=true;pickFinish()}if(m.action==='pick-choose'&&Number.isInteger(m.i)&&m.i>=0&&m.i<3)choose(m.i,1);if(m.action==='pick-banish'&&Number.isInteger(m.i)&&m.i>=0&&m.i<3)banish(m.i,1)}
 }else if(NET.role==='guest'){
  if(m.type==='start'&&Number.isSafeInteger(m.runId)&&m.runId!==NET.runId){NET.runId=m.runId;NET.reward=0;NET.started=true;if(NAT&&CFG.clearDesktop!==false)await SL.clearDesktop?.();if(CFG.wm&&NAT)await desktopStart(newGame);else newGame();}
  if(m.type==='state'&&NET.started&&validSnapshot(m.state)){const s=m.state;P={...s.Q,hp:s.P.hp,mhp:s.P.mhp,pc:s.P.pc};NET.other=s.P;E=s.E;B=s.B;LZ=s.LZ;BR=s.BR;boss=s.boss;stage=s.stage;wave=s.wave;score=s.score;THR=s.THR;RT=s.RT;Object.assign(U,s.U);own=s.own;pendingPicks=s.pending;S=S==='set'&&SETTINGS_RETURN==='pause'&&s.S==='pause'?'set':s.S==='set'?'pause':s.S;receivePicks(s.pick);NET.status=s.S==='pick'?'Team upgrade selection':s.S==='set'?'Host is in settings':'Connected';
   const reward=Math.max(NET.reward,Math.min(1e8,Number(s.reward)||0));if(reward>NET.reward){WALLET.coins+=reward-NET.reward;WALLET.earned+=reward-NET.reward;NET.reward=reward;walletSave();}for(const id of s.achievements||[])if(ADV.some(a=>a[0]===id))ach(id);
  }
 }
}
if(window.SL?.onLan)SL.onLan(handleNetEvent);
function netPlayerStep(){const q=NET.other;if(!NET.connected||NET.role!=='host'||!q)return;const i=!PICK.active&&t-(NET.input.at||0)<.3?NET.input:{};const ml=Math.max(1,Math.hypot(i.x||0,i.y||0)),mx=(i.x||0)/ml,my=(i.y||0)/ml;q.dash-=dt;q.cd-=dt;q.inv-=dt;
 if(i.dash&&q.dash<=0){q.dash=1.1*U.dashCd;q.dt=.17+(U.hyper?.06:0);q.dx=mx||my?mx:Math.cos(Math.atan2(i.ay-q.y,i.ax-q.x));q.dy=mx||my?my:Math.sin(Math.atan2(i.ay-q.y,i.ax-q.x));impact('dash',q.x,q.y,SKINS.find(s=>s[0]===NET.skin)?.[2]||'#5ef2ff');q.inv=U.hyper?.5:.3;if(U.shock)for(let j=0;j<8+U.shock*4;j++)pb(q.x,q.y,j*2*PI/(8+U.shock*4))}
 const speed=q.dt>0?820:255*U.speed;q.x=cl(q.x+(q.dt>0?q.dx:mx)*speed*dt,12,W-12);q.y=cl(q.y+(q.dt>0?q.dy:my)*speed*dt,12,H-12);q.dt-=dt;q.a=Math.atan2((i.ay||0)-q.y,(i.ax||0)-q.x);
 if(i.fire&&q.cd<=0){q.cd=.19/U.rate;for(let j=0;j<U.multi;j++)pb(q.x,q.y,q.a+(j-(U.multi-1)/2)*.13);for(let j=0;j<U.rear;j++)pb(q.x,q.y,q.a+PI+(j%2?1:-1)*Math.ceil(j/2)*.2)}
 if(i.pulse&&P.pc>=100){const x=P.x,y=P.y;P.x=q.x;P.y=q.y;pulse();P.x=x;P.y=y}
 if(q.inv<=0&&P.inv<=0){const b=B.find(b=>b.h&&b.l>0&&dist(q,b)<b.r+6);const hit=b||E.some(e=>!e.dead&&e.w<=0&&dist(q,e)<e.r+7)||LZ.some(z=>z.t>.9&&z.t<1.25&&Math.abs((z.h?q.y:q.x)-z.p)<28)||BR.some(z=>z.t>=.7&&q.y>z.y-7&&q.y<z.y+z.h+7);if(hit){if(b)b.l=0;hurt();q.inv=1.3}}
}
function netFrame(){if(!NET.connected||!NET.started)return;if(t-NET.sent<1/30)return;NET.sent=t;
 if(NET.role==='guest'){netSend({type:'input',x:(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0)+JX,y:(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0)+JY,ax:M.x,ay:M.y,fire:S==='play'&&!!M.d,dash:S==='play'&&!!(K.Space||K.ShiftLeft||K.PadD),pulse:S==='play'&&!!(K.KeyQ||M.r)});return}
 if(P&&NET.other)netSend({type:'state',state:{S,P,Q:NET.other,E,B:B.map(({hit,...b})=>b),LZ,BR,boss,stage,wave,score,THR,RT,U,own,pick:pickSnapshot(),pending:pendingPicks,reward:runCoins,achievements:[...RUN_ACH]}});
}
function drawPartner(){if(!NET.connected||!NET.other)return;const q=NET.other,s=SKINS.find(s=>s[0]===NET.skin)||SKINS[0];g.strokeStyle=s[2];g.fillStyle=s[2]+'33';g.lineWidth=2.5;poly(q.x,q.y,15,s[3],q.a||0);g.fill();g.stroke();T(NET.role==='host'?'P2':'P1',q.x,q.y-25,11,s[2])}
