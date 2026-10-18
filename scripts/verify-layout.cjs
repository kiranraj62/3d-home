const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const storage = new Map();
const localStorage = {getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
function load(file) {
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  const module={exports:{}};
  new Function('require','module','exports','localStorage',code)(require,module,module.exports,localStorage);
  return module.exports;
}
const {defaultLayout,validateLayout,useHouse}=load('src/store.ts');
const {landing,doors,furniture,roomParts,roomArea,overlapArea,plumbingDrop,serviceCore,upperWalls}=load('src/planning.ts');
const {lowerSteps,upperSteps,middleLanding,topLanding}=load('src/stairGeometry.ts');
const rooms=defaultLayout.rooms.filter(r=>r.floor===1);
const room=id=>defaultLayout.rooms.find(r=>r.id===id);
const near=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const inside=(p,r)=>p.x>=r.x-r.w/2-1e-6&&p.x<=r.x+r.w/2+1e-6&&p.z>=r.z-r.d/2-1e-6&&p.z<=r.z+r.d/2+1e-6;
near(landing.x-landing.w/2,2.25);
near(doors.find(d=>d.id==='arrival').z,landing.z);
for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++)
  near(overlapArea(rooms[i],rooms[j]),0);
for(const r of rooms)for(const p of roomParts(r))
  assert(p.x-p.w/2>=-5.336-1e-6&&p.x+p.w/2<=5.452+1e-6&&p.z-p.d/2>=-5.4-1e-6&&p.z+p.d/2<=3.968+1e-6,'Proposed room exceeds bounds');
for(const f of furniture){
  const owner=room(f.room);
  // Exact rectangle intersection sum checks furniture containment in irregular room footprints.
  near(overlapArea({...f,id:'fixture'},owner),f.w*f.d);
}
near(roomArea(room('masterbath')),3.9672);
near(roomArea(room('bed1')),19.5165);
assert(inside(plumbingDrop,room(plumbingDrop.groundRoom)));
assert(inside(plumbingDrop,serviceCore));
assert(furniture.find(f=>f.id==='wc').x>room('g-bath2').x+room('g-bath2').w/2,
  'Corner ensuite fixtures should connect laterally through the service chase');
assert.equal(rooms.filter(r=>r.id.includes('bath')).length,1);
for(const d of doors){
  const walls=upperWalls.filter(([x1,z1,x2,z2])=>
    d.axis==='x' ? z1===z2&&Math.abs(z1-d.z)<1e-6&&d.x-d.width/2>=x1&&d.x+d.width/2<=x2 :
      x1===x2&&Math.abs(x1-d.x)<1e-6&&d.z-d.width/2>=z1&&d.z+d.width/2<=z2);
  assert.equal(walls.length,1,`Door ${d.id} must fit a wall segment`);
  const epsilon=.08;
  const sides=[-epsilon,epsilon].map(offset=>({x:d.x+(d.axis==='z'?offset:0),z:d.z+(d.axis==='x'?offset:0)}));
  assert(sides.every(p=>rooms.some(r=>roomParts(r).some(part=>inside(p,part)))),`Door ${d.id} must join two usable spaces`);
}
const lowerLast=lowerSteps.at(-1),upperFirst=upperSteps[0],upperLast=upperSteps.at(-1);
near(lowerLast.x+lowerLast.args[0]/2,middleLanding.x-middleLanding.args[0]/2);
near(upperFirst.x+upperFirst.args[0]/2,middleLanding.x-middleLanding.args[0]/2);
near(upperLast.x-upperLast.args[0]/2,topLanding.x+topLanding.args[0]/2);
const bad=structuredClone(defaultLayout);bad.rooms[0].x=100;assert.throws(()=>validateLayout(bad));
const stair=structuredClone(defaultLayout);stair.rooms.find(r=>r.id==='stairs').z=3;assert.throws(()=>validateLayout(stair));
const missing=structuredClone(defaultLayout);missing.rooms[1]=missing.rooms[0];assert.throws(()=>validateLayout(missing));
const original=useHouse.getState().layout;
useHouse.getState().updateRoom('g-kitchen',{x:100});assert.equal(useHouse.getState().layout,original);
useHouse.getState().setPresentation(false);
useHouse.getState().updateRoom('stairs',{z:100});assert.equal(useHouse.getState().layout,original);
useHouse.getState().updateRoom('bed1',{x:100});assert.equal(useHouse.getState().layout,original);
storage.set('mangalam-review-v9',JSON.stringify({rooms:[{id:'bed1',color:'#123456',x:100}]}));
const migrated=load('src/store.ts').useHouse.getState().layout;
assert.equal(migrated.rooms.find(r=>r.id==='bed1').color,'#123456');
assert.equal(migrated.rooms.find(r=>r.id==='bed1').x,room('bed1').x);
assert(storage.has('mangalam-review-v9'),'Prior saved layout must remain available');
console.log('PASS: net room areas/non-overlap, furniture containment, bathroom alignment, door connectivity, stair connections, fixed geometry, imports and finish migration.');
