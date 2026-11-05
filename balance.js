// Shared caps apply to normal cards, sacrifices, random rewards and previews.
const STAT_LIMITS={dmg:[.25,12],rate:[.4,3],multi:[1,5],pierce:[0,4],dashCd:[.65,2.5],speed:[.65,1.65],pulse:[.5,3],bounce:[0,3],home:[0,3],orbs:[0,4],shock:[0,3],chain:[0,3],crit:[0,.6],size:[0,3],graze:[0,3],rev:[0,1],rear:[0,3],med:[0,1],bspd:[1,1.6],aura:[0,3],bounty:[0,1],interest:[0,60]};
function capStats(){for(const [k,[lo,hi]] of Object.entries(STAT_LIMITS))U[k]=cl(U[k],lo,hi);P.mhp=cl(P.mhp,1,12);P.hp=Math.min(P.hp,P.mhp);P.r=cl(P.r,11,20)}
function tune(name,description,effect){const c=[...UP,...SAC,...Object.values(EV).map(x=>x[0])].find(c=>c[0]===name);if(!c)throw Error('Unknown card '+name);c[1]=description;c[2]=effect}
tune('Overcharge','+25% shot damage',()=>U.dmg*=1.25);
tune('Hair Trigger','+20% fire rate|Maximum: 3×',()=>U.rate*=1.2);
tune('Split Shot','+1 shot per volley (max 5)|Each extra shot reduces pellet damage 10%',()=>U.multi++);
tune('Phase Boots','Dash cooldown -20%|Minimum cooldown: 0.72s',()=>U.dashCd*=.8);
tune('Armor Plating','+1 max HP and heal 1|Maximum: 12 HP',()=>{if(P.mhp<12){P.mhp++;P.hp++}});
tune('Reinforced Plating','+2 max HP and heal 1|Maximum: 12 HP',()=>{if(P.mhp<12){P.mhp+=2;P.hp++}});
tune('Piercing Rounds','Shots pass through +2 targets|Maximum: 4 pierce',()=>U.pierce+=2);
tune('Pulse Cell','Pulse charges 30% faster|Maximum: 3×',()=>U.pulse*=1.3);
tune('Heavy Barrel','+50% damage|-15% fire rate',()=>{U.dmg*=1.5;U.rate*=.85});
tune('Blood Price','+45% damage|Enemy bullets 8% faster',()=>{U.dmg*=1.45;U.bspd*=1.08});
tune('Hungry Pact','+2 shots per volley (max 5)|-20% shot damage',()=>{U.multi+=2;U.dmg*=.8});
tune('Reckless Oath','+45% fire rate|Dash cooldown +25%',()=>{U.rate*=1.45;U.dashCd*=1.25});
tune('Brittle Speed','+25% move speed|Hitbox grows by 2',()=>{U.speed*=1.25;P.r+=2});
tune('Pulse Tithe','Full pulse and +50% pulse charge|Enemy bullets 8% faster',()=>{P.pc=100;U.pulse*=1.5;U.bspd*=1.08});
tune('Scrap Deal','+2 pierce, +1 ricochet|-10% fire rate',()=>{U.pierce+=2;U.bounce++;U.rate*=.9});
tune('Cursed Coin','+40% kill credits, +15% damage|Enemy bullets 8% faster',()=>{U.bounty+=.4;U.dmg*=1.15;U.bspd*=1.08});
tune('Titan Rounds','+90% damage|-20% fire rate',()=>{U.dmg*=1.9;U.rate*=.8});
tune('Twin Orbits','+2 orbs|-10% move speed',()=>{U.orbs+=2;U.speed*=.9});
tune('Overclock','+60% fire rate, +1 shot|Enemy bullets 15% faster',()=>{U.rate*=1.6;U.multi++;U.bspd*=1.15});
tune('Echo Chamber','+1 rear shot, +2 ricochets|-15% damage',()=>{U.rear++;U.bounce+=2;U.dmg*=.85});
tune('Hunter’s Eye','+2 homing, +20% crit|-15% damage',()=>{U.home+=2;U.crit+=.2;U.dmg*=.85});
tune('Glass Cannon','+65% damage, +15% crit|Hitbox grows by 3',()=>{U.dmg*=1.65;U.crit+=.15;P.r+=3});
tune('Bounty Hunter','Kills grant +25% credits|Maximum bonus: +100%',()=>U.bounty+=.25);
tune('Liquid Armor','Spend 30 credits to block a hit|One block every 8 seconds',()=>U.insurance=1);
tune('Capital Rounds','+1% damage / 50 credits earned this run|Maximum: +25%',()=>U.capital=1);
tune('Total Gamble','Gain 2 useful random upgrades|Enemy bullets 12% faster',()=>{for(let i=0;i<2;i++){const pool=UP.filter(canOffer);if(pool.length)pool[R()*pool.length|0][2]()}U.bspd*=1.12});
for(const c of [...UP,...SAC,...Object.values(EV).map(x=>x[0])]){const apply=c[2];c[2]=()=>{apply();capStats()}}
function canOffer(c){
 if(c[0]==='Supply Cache')return false;
 if(c[0]==='Hungry Pact'&&U.multi>2||c[0]==='Twin Orbits'&&U.orbs>2||c[0]==='Cursed Coin'&&U.bounty>=1||c[0]==='Pulse Tithe'&&U.pulse>=3||c[0]==='Echo Chamber'&&U.bounce>=3||c[0]==='Scrap Deal'&&(U.pierce>=4||U.bounce>=3))return false;
 if(BAN.has(c[0])||c[4]==='hp'&&P.hp<=1||c[4]==='max'&&P.mhp<=2)return false;
 if(c[0]==='Total Gamble')return UP.some(canOffer);
 const before={...U},hp=P.hp,mhp=P.mhp,r=P.r,pc=P.pc;
 try{c[2]();return P.hp>hp||P.mhp>mhp||P.pc>pc||Object.keys(before).some(k=>k==='dashCd'?U[k]<before[k]:k!=='bspd'&&U[k]>before[k])}
 finally{Object.assign(U,before);Object.assign(P,{hp,mhp,r,pc})}
}
function shuffledCards(pool){const a=pool.slice();for(let i=a.length-1;i>0;i--){const j=R()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}

const SUPPLY_CARD=['Supply Cache','Gain 40 credits',()=>earn(40),'interest'];UP.push(SUPPLY_CARD);
ST.push(['bounty','kill credits','%'],['interest','clear credits','n'],['insurance','liquid armor','b'],['capital','capital rounds','b']);
