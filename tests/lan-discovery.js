const assert=require('node:assert/strict'),dgram=require('node:dgram'),net=require('node:net');const {createLan}=require('../electron/lan');
(async()=>{const events=[],port=43878,lan=createLan({port,notify:e=>events.push(e)}),probe=dgram.createSocket('udp4');
 try{await lan.host();const room=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Discovery timed out')),2500);probe.once('message',b=>{clearTimeout(timer);resolve(JSON.parse(b))})});probe.send(Buffer.from(JSON.stringify({protocol:'shape-larper-048',type:'search'})),port,'127.0.0.1');assert.equal((await room).port,port);
 const bad=net.createConnection({host:'127.0.0.1',port});await new Promise(resolve=>bad.once('connect',resolve));const closed=new Promise(resolve=>bad.once('close',resolve));bad.write(JSON.stringify({protocol:'wrong',type:'hello'})+'\n');await closed;assert.ok(!events.some(e=>e.type==='connected'));await assert.rejects(()=>lan.join('8.8.8.8'),/local IPv4/);console.log('PASS: UDP auto-discovery, mismatched protocol rejection, public address rejection');
 }finally{probe.close();await lan.leave()}
})().catch(e=>{console.error(e);process.exitCode=1});
