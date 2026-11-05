const RELAY={socket:null,active:false,code:'',timer:null,last:0,connecting:false};
function relayLeave(){clearInterval(RELAY.timer);RELAY.timer=null;RELAY.active=false;RELAY.connecting=false;RELAY.code='';const ws=RELAY.socket;RELAY.socket=null;if(ws){ws.onclose=null;ws.close()}}
function relaySend(message){const ws=RELAY.socket;if(ws?.readyState===WebSocket.OPEN&&ws.bufferedAmount<1024*1024)ws.send(JSON.stringify({protocol:'shape-larper-044',type:'data',message}))}
function relayConnect(address,code='',key=''){
 let url;try{url=new URL(address);if(url.username||url.password||url.hash||!(url.protocol==='wss:'||(url.protocol==='ws:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))))throw Error();if(url.pathname==='/')url.pathname='/ws'}catch{NET.status='Use wss://your-relay.example/ws (ws://localhost only for testing).';return false}
 leaveLan();NET.status='Connecting to relay…';RELAY.active=RELAY.connecting=true;CFG.relay=url.href;saveD();
 const ws=new WebSocket(url.href);RELAY.socket=ws;RELAY.last=Date.now();
 ws.onopen=()=>{if(RELAY.socket!==ws)return;ws.send(JSON.stringify({protocol:'shape-larper-044',type:code?'join':'create',code,key}));RELAY.connecting=false;NET.status=code?'Joining room…':'Creating room…'};
 ws.onmessage=e=>{if(RELAY.socket!==ws||typeof e.data!=='string'||e.data.length>600000)return;RELAY.last=Date.now();let m;try{m=JSON.parse(e.data)}catch{return}if(m.type==='room'){RELAY.code=String(m.code);NET.role='host';NET.status='Room '+RELAY.code+' · waiting for second pilot';return}if(m.type==='error'){NET.status=String(m.error);return}if(['connected','message','disconnected'].includes(m.type))handleNetEvent(m)};
 ws.onerror=()=>{NET.status='Relay unavailable. Check address/key; if asleep, wait a minute and retry.'};
 ws.onclose=()=>{if(RELAY.socket!==ws)return;const was=NET.connected;relayLeave();if(was)handleNetEvent({type:'disconnected'});else if(!NET.status.includes('key')&&!NET.status.includes('Room not found'))NET.status='Relay closed. Check address/key and retry.'};
 RELAY.timer=setInterval(()=>{if(Date.now()-RELAY.last>90000){NET.status='Relay timed out. Try again.';ws.close();return}if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify({protocol:'shape-larper-044',type:'ping'}))},10000);
 return true;
}
const relayForm=document.createElement('form');relayForm.id='relay-form';relayForm.style.cssText='display:none;position:fixed;inset:15% 8% auto;max-height:75vh;overflow:auto;background:#151028;padding:24px;border:1px solid #68e8f5;z-index:40;color:#e5ddff;font:16px system-ui;gap:16px;flex-direction:column';
relayForm.innerHTML='<strong>Online co-op · relay setup</strong><span>No public server is preconfigured. Deploy the included relay first.</span><label>Relay address <input name="address" aria-label="Relay address" placeholder="wss://your-service.onrender.com/ws" required style="width:95%"></label><label>Relay access key <input name="key" type="password" autocomplete="off" style="width:95%"></label><label>Room code (empty = create room) <input name="room" maxlength="16" autocomplete="off" style="width:95%"></label><div><button type="submit">Connect</button> <button type="button">Cancel</button></div>';
document.body.append(relayForm);relayForm.querySelector('[type=button]').onclick=()=>relayForm.style.display='none';
for(const event of ['keydown','keyup','mousedown'])relayForm.addEventListener(event,e=>e.stopPropagation());
relayForm.onsubmit=e=>{e.preventDefault();const data=new FormData(relayForm);if(relayConnect(String(data.get('address')).trim(),String(data.get('room')).trim(),String(data.get('key')))){relayForm.style.display='none';relayForm.elements.key.value=''}};
function openRelayForm(){relayForm.elements.address.value=CFG.relay||'';relayForm.style.display='flex';relayForm.elements.address.focus()}
