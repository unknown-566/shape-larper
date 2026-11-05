const assert=require('node:assert/strict');const {WebSocket}=require('../relay/node_modules/ws');const {createRelay,PROTOCOL}=require('../relay/server');
(async()=>{const relay=createRelay({key:'test-key',maxRooms:2}),sockets=[];await new Promise(r=>relay.server.listen(0,'127.0.0.1',r));const url='ws://127.0.0.1:'+relay.server.address().port+'/ws';
 async function client(){const ws=new WebSocket(url);sockets.push(ws);ws.messages=[];ws.on('message',b=>ws.messages.push(JSON.parse(b)));await new Promise(r=>ws.once('open',r));return ws}
 const send=(ws,m)=>ws.send(JSON.stringify({protocol:PROTOCOL,...m}));async function get(ws,type){const until=Date.now()+3000;while(Date.now()<until){const i=ws.messages.findIndex(m=>m.type===type);if(i>=0)return ws.messages.splice(i,1)[0];await new Promise(r=>setTimeout(r,10))}throw Error('Missing '+type)}
 try{const a=await client();send(a,{type:'create',key:'test-key'});const {code}=await get(a,'room');assert.match(code,/^[A-F0-9]{12}$/);const wrong=await client();send(wrong,{type:'join',code,key:'wrong'});assert.match((await get(wrong,'error')).error,/key/);
 const b=await client();send(b,{type:'join',code,key:'test-key'});assert.equal((await get(a,'connected')).role,'host');assert.equal((await get(b,'connected')).role,'guest');send(a,{type:'data',message:{type:'state',sequence:123}});assert.equal((await get(b,'message')).message.sequence,123);
 const third=await client();send(third,{type:'join',code,key:'test-key'});assert.match((await get(third,'error')).error,/full/);b.close();await get(a,'disconnected');await new Promise(r=>setTimeout(r,30));assert.equal(relay.rooms.size,0);
 const incompatible=await client();incompatible.send(JSON.stringify({protocol:'old',type:'create'}));assert.match((await get(incompatible,'error')).error,/0\.4\.8/);
 console.log('PASS: relay room create/join, access key, forwarding, capacity, disconnect cleanup and protocol rejection');
 }finally{for(const ws of sockets)ws.terminate();await relay.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
