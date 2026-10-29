'use strict';
(()=>{
const get=id=>document.getElementById(id);let promptEvent=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;get('native-install').hidden=false;});
window.addEventListener('appinstalled',()=>{promptEvent=null;get('native-install').hidden=true;get('install-status').textContent='Installed! Find Little Artist on your Home Screen.';});
function help(){get('install-status').textContent=window.matchMedia('(display-mode: standalone)').matches?'Already open as an app.':!window.isSecureContext?'Open the hosted HTTPS website to install and use offline.':location.hostname==='127.0.0.1'||location.hostname==='localhost'?'This preview is on this computer. A hosted HTTPS address is needed to install it on another device.':'Install from your browser to keep drawing offline after the first visit.';get('install-dialog').showModal();}
get('install-button').onclick=help;get('install-help').onclick=help;get('close-install').onclick=()=>get('install-dialog').close();
get('native-install').onclick=async()=>{if(!promptEvent)return;const event=promptEvent;promptEvent=null;get('native-install').hidden=true;try{await event.prompt();const result=await event.userChoice;get('install-status').textContent=result.outcome==='accepted'?'Installation requested.':'You can install another time.';}catch{get('install-status').textContent='Use your browser’s menu to install.';}};
get('go-draw').onclick=()=>{if(get('digital-studio').hidden)get('toggle-studio').click();get('digital-studio').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
if('serviceWorker' in navigator&&window.isSecureContext){navigator.serviceWorker.register('/service-worker.js').then(()=>navigator.serviceWorker.ready).then(()=>{get('offline-status').textContent='Lessons are ready offline on this device.';}).catch(()=>{get('offline-status').textContent='Offline setup is unavailable. You can still use the website online.';});}
})();
