'use strict';
(()=>{
const $=s=>document.querySelector(s),form=$('#artist-form'),fields=['artist-name','favorite-art','artist-note'];
const read=()=>{try{const value=JSON.parse(localStorage.getItem('little-artist-about-me')||'{}');return value&&typeof value==='object'?value:{};}catch{return {};}};
const profile=read();for(const id of fields)if(profile[id]!==undefined)$('#'+id).value=profile[id];
function greet(){const name=$('#artist-name').value.trim();$('#hello-title').innerHTML=name?`Hello, <em>${escapeText(name)}!</em>`:'About <em>me!</em>';$('#encouragement').textContent=name?`${name}, keep making wonderful things!`:'Keep making wonderful things!';}
function escapeText(value){const span=document.createElement('span');span.textContent=value;return span.innerHTML;}
greet();$('#artist-name').addEventListener('input',greet);
form.addEventListener('submit',event=>{event.preventDefault();const data={};for(const id of fields)data[id]=$('#'+id).value;try{localStorage.setItem('little-artist-about-me',JSON.stringify(data));$('#save-message').textContent='Saved on this device!';greet();}catch{$('#save-message').textContent='Could not save in this browser.';}});
$('#clear-card').addEventListener('click',()=>{try{localStorage.removeItem('little-artist-about-me');}catch{}form.reset();$('#save-message').textContent='Your card is ready for a fresh start.';greet();});
})();
