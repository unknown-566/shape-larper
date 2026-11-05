let SETTINGS_RETURN='title';
function openSettings(back='title'){SETTINGS_RETURN=back;S='set';M.d=M.r=0;cf=0}
function settingsBack(){S=SETTINGS_RETURN;cf=0;M.d=M.r=0}
function resumeGame(){S='play';M.d=M.r=0;for(const k in K)K[k]=0}
function menuPanel(x,y,w,h){g.fillStyle='#0b091bea';g.strokeStyle='#393052';g.lineWidth=1.5;g.beginPath();g.roundRect(x,y,w,h,16);g.fill();g.stroke()}
function settingCycle(key,values){const value=CFG[key]??1;CFG[key]=values[(values.indexOf(value)+1)%values.length];saveD();if(key=='uiScale')fit()}
function settingsDraw(){
 menuBG();dim(.68);menuPanel(40,96,880,492);
 T('SETTINGS',64,50,30,'#f2edff','left');T(SETTINGS_RETURN=='pause'?'Run paused':'Make it yours',896,54,14,'#9b91b7','right','normal');
 btn('← Back',62,112,112,34,settingsBack,{sz:15});
 T('AUDIO & INPUT',76,174,12,'#5ef2ff','left');T('VISUALS',512,174,12,'#ff83c4','left');
 const level=value=>['Off','50%','100%'][Math.round((value??1)*2)];
 const change=key=>()=>settingCycle(key,[0,.5,1]);
 btn('Sound effects  ·  '+level(CFG.vol),72,198,380,46,change('vol'),{sz:17});
 btn('Music  ·  '+level(CFG.mus),72,254,380,46,change('mus'),{sz:17});
 btn('Aim guide  ·  '+(CFG.aim?'On':'Off'),72,310,380,46,()=>{CFG.aim^=1;saveD()},{sz:17});
 const quality=(CFG.quality||'auto').toUpperCase()+(CFG.quality!='high'&&CFG.quality!='low'&&AUTOLOW?' · LOW':'');
 btn('Graphics  ·  '+quality,508,198,380,46,cycleQuality,{sz:17});
 btn('Screen shake  ·  '+level(CFG.shk),508,254,380,46,change('shk'),{sz:17});
 btn('Flashes  ·  '+(CFG.fl?'On':'Off'),508,310,380,46,()=>{CFG.fl^=1;saveD()},{sz:17});
 btn('Impact effects · '+((CFG.impact??1.35)===0?'Off':(CFG.impact??1.35)===.6?'Soft':(CFG.impact??1.35)===2?'Overdrive':'Full'),72,364,380,32,()=>{const modes=[0,.6,1.35,2];CFG.impact=modes[(modes.indexOf(CFG.impact??1.35)+1)%modes.length];saveD()},{sz:14});
 T('LAYOUT',76,402,12,'#5ef2ff','left');T('Fits your display automatically',884,402,12,'#938aa9','right','normal');
 btn('Panel size  ·  '+Math.round((CFG.panelScale||1)*100)+'%',72,414,380,46,()=>settingCycle('panelScale',[.85,1,1.15]),{sz:17});
 btn('Interface size  ·  '+Math.round((CFG.uiScale||1)*100)+'%',508,414,380,46,()=>settingCycle('uiScale',[.85,1,1.15]),{sz:17});
 if(NAT)btn('Minimize other windows · '+(CFG.clearDesktop!==false?'On':'Off'),508,470,380,30,()=>{CFG.clearDesktop=CFG.clearDesktop===false;saveD()},{sz:13});
 T(DESKTOPMODE?Math.round(innerWidth)+' × '+Math.round(innerHeight)+' · Desktop':CFG.wm?'Desktop layout · adaptive':'Classic · 960 × 640 arena',76,UPDATE_API?477:496,13,'#b1a6cc','left','normal');
 updateSettings();
 if(SETTINGS_RETURN=='title')btn(cf?'Confirm reset':'Reset progress',666,516,222,40,()=>{if(!cf){cf=1;return}SEEN={};ADVS={};hi=0;WALLET={coins:0,earned:0,skins:['signal'],skin:'signal'};walletSave();localStorage.removeItem('ng_adv');localStorage.removeItem('ng_hi');cf=0;saveD()},{c:'#ff849c',sz:15});
 else T('Your changes are saved immediately.',76,UPDATE_API?574:548,13,'#9288a9','left','normal');
 T('ESC · BACK',64,612,12,'#827696','left','normal');T('v'+VER,896,612,12,'#827696','right','normal');
}
function pauseDraw(){
 if(!DESKTOPMODE)dim(.72);
 menuPanel(264,112,432,NAT?444:392);
 T('PAUSED',W/2,164,38,'#f5efff');
 if(pendingPicks&&NET.role!=='guest')btn('Choose upgrade · '+pendingPicks,300,213,360,30,openPicks,{sz:14});
 T('Score '+score+'   ·   '+fmtT(RT),W/2,197,15,'#ada3c6','center','normal');
 btn(NET.role==='guest'?'Waiting for host':'Resume',300,252,360,48,()=>{if(NET.role!=='guest')resumeGame()},{c:'#8ff5f2',sz:20});
 btn('Settings',300,312,360,48,()=>openSettings('pause'),{sz:19});
 btn('Return to menu',300,372,360,48,toMenu,{sz:19});
 if(NAT)btn('Quit game',300,432,360,44,()=>SL.quit(),{c:'#ff87a7',sz:17});
 T('ESC / P · RESUME     M · MENU',W/2,NAT?520:466,12,'#9589ab','center','normal');
}
