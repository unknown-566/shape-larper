const http=require('node:http'),crypto=require('node:crypto');
const {WebSocketServer,WebSocket}=require('ws');
const PROTOCOL='shape-larper-045',MAX=512*1024;
function createRelay({key=process.env.RELAY_KEY||'',maxRooms=50}={}){
 const rooms=new Map();
 const server=http.createServer((req,res)=>{res.writeHead(req.url==='/health'?200:404,{'Content-Type':'application/json'});res.end(JSON.stringify(req.url==='/health'?{ok:true,protocol:PROTOCOL}:{error:'Not found'}))});
 const wss=new WebSocketServer({server,path:'/ws',maxPayload:MAX,perMessageDeflate:false});
 const send=(ws,value)=>{if(ws?.readyState===WebSocket.OPEN&&ws.bufferedAmount<MAX*2)ws.send(JSON.stringify(value))};
 function remove(ws){const room=rooms.get(ws.room);if(!room)return;rooms.delete(ws.room);for(const peer of [room.host,room.guest])if(peer&&peer!==ws){send(peer,{type:'disconnected'});peer.close(1000,'Peer left')}ws.room=null}
 wss.on('connection',ws=>{
  if(wss.clients.size>maxRooms*2+20){ws.close(1013,'Server full');return}
  ws.alive=true;ws.created=Date.now();ws.window=Date.now();ws.frames=0;ws.bytes=0;
  ws.on('pong',()=>ws.alive=true);ws.on('error',()=>{});ws.on('close',()=>remove(ws));
  ws.on('message',(buffer,binary)=>{
   const now=Date.now();if(now-ws.window>1000){ws.window=now;ws.frames=ws.bytes=0}
   if(binary||++ws.frames>120||(ws.bytes+=buffer.length)>8*1024*1024){ws.close(1008,'Rate limit');return}
   let m;try{m=JSON.parse(buffer)}catch{ws.close(1008,'Invalid JSON');return}
   if(!m||m.protocol!==PROTOCOL){send(ws,{type:'error',error:'Both players need v0.4.5.'});ws.close(1008,'Version mismatch');return}
   if(m.type==='ping'){send(ws,{type:'pong'});return}
   if(m.type==='create'||m.type==='join'){
    if(ws.room){send(ws,{type:'error',error:'Already in a room'});return}
    if(key&&(typeof m.key!=='string'||m.key!==key)){send(ws,{type:'error',error:'Incorrect relay access key'});ws.close(1008,'Access denied');return}
    if(m.type==='create'){
     if(rooms.size>=maxRooms){send(ws,{type:'error',error:'Relay is full. Try later.'});return}
     let code;do{code=crypto.randomBytes(6).toString('hex').toUpperCase()}while(rooms.has(code));
     rooms.set(code,{host:ws,guest:null,at:now});ws.room=code;ws.role='host';send(ws,{type:'room',code});
    }else{
     const code=String(m.code||'').replace(/[ -]/g,'').toUpperCase(),room=rooms.get(code);
     if(!room||room.guest){send(ws,{type:'error',error:'Room not found or already full.'});return}
     room.guest=ws;ws.room=code;ws.role='guest';send(room.host,{type:'connected',role:'host'});send(ws,{type:'connected',role:'guest'});
    }
   }else if(m.type==='data'&&ws.room){const room=rooms.get(ws.room);if(room&&m.message&&typeof m.message==='object')send(ws.role==='host'?room.guest:room.host,{type:'message',message:m.message})}
  });
 });
 const timer=setInterval(()=>{const now=Date.now();for(const ws of wss.clients){const room=rooms.get(ws.room);if(!ws.alive||(!ws.room&&now-ws.created>30000)||(room&&!room.guest&&now-room.at>600000)||(room&&now-room.at>6*3600000)){ws.terminate();continue}ws.alive=false;ws.ping()}},15000);timer.unref();
 return{server,rooms,close:async()=>{clearInterval(timer);for(const ws of wss.clients)ws.terminate();await new Promise(r=>wss.close(r));await new Promise(r=>server.close(r))}};
}
if(require.main===module){const relay=createRelay();relay.server.listen(Number(process.env.PORT)||10000,'0.0.0.0',()=>console.log('Shape Larper relay ready'));for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>relay.close().then(()=>process.exit(0)))}
module.exports={createRelay,PROTOCOL};
