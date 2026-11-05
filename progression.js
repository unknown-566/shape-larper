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
function openPicks(){if(NET.role==='guest'){netSend({type:'action',action:'picks'});return}if(!pendingPicks||!['play','pause'].includes(S))return;if(!cards.length)deal();PV=cards.map(preview);S='pick';pickOpened=t;lk=.45;M.d=M.r=0}
function deferPicks(){S='play';M.d=M.r=0}
function progressHud(){if(S!=='play')return;T(WALLET.coins+' CR',930,528,14,'#ffe38a','right');if(pendingPicks)btn('UPGRADES · '+pendingPicks+'  [U]',660,546,270,40,openPicks,{sz:16,c:'#8feaf5'})}
function pickDraw(){dim(.84);T('CHOOSE YOUR EDGE',W/2,70,32);T(pendingPicks+' upgrade'+(pendingPicks===1?'':'s')+' banked · '+WALLET.coins+' credits',W/2,110,16,'#b6a4d2');
 cards.forEach((c,i)=>{const age=cl((t-pickOpened-i*.075)/.32,0,1),ease=1-Math.pow(1-age,3),x=45+i*300;g.save();g.globalAlpha=age;g.translate(x+135,320+(1-ease)*130);g.rotate((1-ease)*(i-1)*.13);g.scale(.88+.12*ease,1);const color=c[4]?'#ff6c98':c[5]?'#ffe38a':'#68e8f5';menuPanel(-135,-150,270,300);g.strokeStyle=color;g.lineWidth=2;g.beginPath();g.moveTo(-115,-128);g.lineTo(-45,-128);g.stroke();icon(c[3],0,-84,40,color);T(c[0],0,-18,22,color);c[1].split('|').forEach((s,j)=>wr(s,-116,20+j*37,232,18,'#c3b6da',14));(PV[i]?.[0]||[]).forEach((s,j)=>T(s,0,92+j*15,11,'#92cddd'));if(c[4])T(c[4]==='hp'?'COST: 1 HP':'COST: 1 MAX HP',0,126,13,'#ff6c98');else T('SELECT '+(i+1),0,130,12,color);g.restore()});
 btn('Keep for later · U',330,548,300,42,deferPicks,{sz:17});T(NET.role?'Host chooses team upgrades · both players pause':'Right-click to banish · '+P.bn+' remaining',W/2,613,13,'#a69abb')}
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
