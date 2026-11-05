// Impact visuals only: never move simulation bodies or native OS windows.
const IMPACTS=[];
let impactSerial=0;
const impactPower=()=>CFG.impact??1.35;
function impact(kind,x,y,color='#5ef2ff',remote=false){
 const power=impactPower();if(!Number.isFinite(x+y)||power<=0)return;
 const strength={dash:3,kill:5,hurt:23,pulse:20,phase:27,boss:42}[kind]||5;
 shake=Math.max(shake,strength*power);
 const length=kind==='boss'?.85:kind==='pulse'?.55:kind==='dash'?.22:.38;
 IMPACTS.push({kind,x,y,color,at:t,length,id:++impactSerial});
 const cap=lowFX()?8:24;if(IMPACTS.length>cap)IMPACTS.splice(0,IMPACTS.length-cap);
 // Flashes are isolated, decaying hits; kills and ordinary shots do not strobe.
 if(CFG.fl&&['hurt','pulse','phase','boss'].includes(kind)){
  flash=Math.max(flash,Math.min(1,(kind==='boss'?.85:.28)*power));
  FLC=kind==='hurt'?'255,45,100':kind==='pulse'?'70,225,255':kind==='phase'?'190,110,255':'255,245,225';
 }
 if(!remote&&NET.role==='host'&&NET.connected)netSend({type:'impact',kind,x,y,color});
}
function impactWorld(){
 while(IMPACTS.length&&t-IMPACTS[0].at>1)IMPACTS.shift();
 const power=impactPower();if(!power)return;
 g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
 for(const q of IMPACTS){const age=(t-q.at)/q.length;if(age<0||age>=1)continue;
  const fade=(1-age)*(1-age),large=q.kind==='boss'||q.kind==='pulse',radius=(large?35:10)+age*(large?310:78);
  g.globalAlpha=fade*Math.min(1,power);g.strokeStyle=q.color;g.lineWidth=(large?5:3)*(1-age)+1;
  g.beginPath();g.arc(q.x,q.y,radius,0,PI*2);g.stroke();
  if(large&&!lowFX()){g.globalAlpha=fade*.35;g.lineWidth=13*(1-age);g.beginPath();g.arc(q.x,q.y,radius*.75,0,PI*2);g.stroke()}
  const count=lowFX()?6:large?18:10;
  g.globalAlpha=fade;g.lineWidth=q.kind==='dash'?3:2;g.beginPath();
  for(let i=0;i<count;i++){const a=i*PI*2/count+q.id*1.91,r=radius*(.55+(i%3)*.13),len=(large?62:24)*(1-age);g.moveTo(q.x+Math.cos(a)*r,q.y+Math.sin(a)*r);g.lineTo(q.x+Math.cos(a)*(r+len),q.y+Math.sin(a)*(r+len))}g.stroke();
 }
 g.restore();
}
function impactFrame(x,y,w,h,color){
 if(!CFG.fl||!impactPower()||S!=='play')return;
 const energy=cl(Math.max(flash,shake/55),0,1)*Math.min(1.4,impactPower());if(energy<.025)return;
 g.save();g.globalAlpha=Math.min(.85,energy);g.strokeStyle=color;g.lineWidth=2+energy*5;
 const size=Math.min(w,h)*.12;g.beginPath();
 for(const [cx,cy,dx,dy] of [[x+4,y+4,1,1],[x+w-4,y+4,-1,1],[x+4,y+h-4,1,-1],[x+w-4,y+h-4,-1,-1]]){g.moveTo(cx,cy+dy*size);g.lineTo(cx,cy);g.lineTo(cx+dx*size,cy)}g.stroke();
 if(!lowFX()&&flash>.15){g.globalAlpha=energy*.15;g.fillStyle=color;g.fillRect(x+4,y+4,w-8,3);g.fillRect(x+4,y+h-7,w-8,3)}
 g.restore();
}
function desktopShake(){return S==='play'?{x:cl(SX,-10,10),y:cl(SY,-10,10)}:{x:0,y:0}}
