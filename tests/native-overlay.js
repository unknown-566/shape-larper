const assert=require('node:assert/strict');
const path=require('node:path');
const {_electron}=require('playwright');
(async()=>{
 const app=await _electron.launch(process.argv[2]?{executablePath:path.resolve(process.argv[2])}:{executablePath:path.resolve(__dirname,'../node_modules/electron/dist/electron.exe'),args:[path.resolve(__dirname,'..')]});
 try{
  const page=await app.firstWindow();await page.waitForLoadState('load');await page.waitForFunction(()=>typeof desktopRender==='function');const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Do not take focus from the user while automating a desktop-sized surface.
  await app.evaluate(({BrowserWindow})=>{BrowserWindow.prototype.focus=()=>{};BrowserWindow.prototype.show=function(){this.showInactive()}});
  const menu=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getBounds());
  await page.evaluate(async()=>{kd=()=>{};md=()=>{};CFG.vol=CFG.mus=0;CFG.wm=1;CFG.quality='low';await desktopStart(()=>{newGame();P.hp=P.mhp=99;P.inv=999;spawnQ=[];for(let i=0;i<24;i++)spawn(i%10,30+i%8*120,80+Math.floor(i/8)*170);startBoss();boss.x=700;boss.y=220;boss.intro=0});S='pause'});
  await page.waitForTimeout(500);
  const native=await app.evaluate(({BrowserWindow,screen})=>{const windows=BrowserWindow.getAllWindows();const w=windows[0];return{count:windows.length,bounds:w.getBounds(),workArea:screen.getDisplayMatching(w.getBounds()).workArea,background:w.getBackgroundColor(),visible:w.isVisible()}});
  assert.equal(native.count,1);assert.deepEqual(native.bounds,native.workArea);assert.ok(native.visible);assert.equal(native.background,'#000000');
  const rendering=await page.evaluate(()=>{const old=drawWorld;let draws=0;drawWorld=()=>{draws++;old()};render();drawWorld=old;return{draws,mode:DESKTOPMODE,popups:WE.size,panels:desktopRects.length,canvas:[cv.width,cv.height],viewport:[innerWidth,innerHeight]}});
  assert.equal(rendering.draws,1);assert.equal(rendering.mode,1);assert.equal(rendering.popups,0);assert.ok(rendering.panels>1);
  await page.evaluate(()=>openSettings('pause'));await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>S),'set');
  await page.evaluate(()=>settingsBack());assert.equal(await page.evaluate(()=>S),'pause');
  await page.evaluate(()=>toMenu());await page.waitForFunction(()=>!DESKTOPMODE&&!WM);await page.waitForTimeout(150);
  assert.deepEqual(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getBounds()),menu);
  assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().length),1);
  await page.evaluate(()=>{CFG.wm=0;go()});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>S),'play');assert.equal(await page.evaluate(()=>DESKTOPMODE),0);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({native,rendering,menuRestored:true,classic:true,errors},null,2));
 }finally{await app.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
