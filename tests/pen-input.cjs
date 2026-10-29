// Run: node tests/pen-input.cjs. No browser or extra dependencies needed.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../studio/static/studio/app.js'),'utf8');
const input=source.slice(source.indexOf('let penOnly=false'),source.indexOf('async function restore'));
const marks=[],controls={'#size':{value:10},'#pen-only':{setAttribute(){}},'#pen-status':{textContent:''}};
let captures=new Set(), saves=0,checkpoints=0;
const ctx={beginPath(){},arc(...args){marks.push({dot:args[2]})},fill(){},moveTo(){},lineTo(){},stroke(){marks.push({width:this.lineWidth})}};
const sandbox={Number,Math,$:key=>controls[key],canvas:{setPointerCapture(id){captures.add(id)},hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id)},ctx,mode:'draw',restoring:false,activePointer:null,tool:'pen',color:'#181445',point:e=>[e.clientX,e.clientY],checkpoint:()=>checkpoints++,changed:()=>saves++};
vm.createContext(sandbox);vm.runInContext(input,sandbox);
function event(type,pressure=.5,id=1){return {pointerId:id,pointerType:type,pressure,button:0,width:1,height:1,clientX:10,clientY:20,preventDefault(){}};}
sandbox.canvas.onpointerdown(event('pen',.2));sandbox.canvas.onpointermove(event('pen',.8));sandbox.canvas.onpointerup(event('pen',.8));
assert.equal(checkpoints,1);assert.equal(saves,1);assert.equal(marks[0].dot,3);assert.equal(marks[1].width,13.5);assert.equal(captures.size,0);
controls['#pen-only'].onclick();sandbox.canvas.onpointerdown(event('touch'));assert.equal(checkpoints,1);
sandbox.canvas.onpointerdown(event('pen',.5,2));sandbox.canvas.onpointermove({...event('pen',.5,2),getCoalescedEvents:()=>[event('pen',.3,2),event('pen',.9,2)]});sandbox.canvas.onpointercancel(event('pen',.5,2));assert.equal(checkpoints,2);assert.equal(saves,2);assert.equal(captures.size,0);
controls['#pen-only'].onclick();sandbox.canvas.onpointerdown({...event('touch'),width:60});assert.equal(checkpoints,2);
sandbox.canvas.onpointerdown(event('touch'));sandbox.canvas.onpointerdown(event('touch',.5,3));assert.equal(checkpoints,3);sandbox.canvas.onpointerup(event('touch'));assert.equal(saves,3);
console.log('Pen input passed: pressure, coalesced samples, pen-only filtering, cancellation, secondary-pointer rejection.');
