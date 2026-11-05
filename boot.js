// Start only after every renderer module has loaded; RAF may run between script loads.
window.GAME_READY=true;
sched(window);
setInterval(()=>{if(performance.now()-LL>300)sched(window)},250);
