import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import { Simulation,STEP } from '../src/game/simulation';
import { defaults } from '../src/tuning';
import { level1 } from '../src/levels/level1';
import { level2 } from '../src/levels/level2';
import { level3 } from '../src/levels/level3';
import { levels,frictionForCargo } from '../src/levels';
await RAPIER.init();
const idle={x:0,z:0,jump:false,yaw:0};
for(const level of levels){
  const events:string[]=[];const t={...defaults,cargoFriction:frictionForCargo[level.cargo]};const sim=new Simulation(level,t,e=>events.push(e));
  for(let i=0;i<180;i++)sim.step(idle);
  assert.equal(sim.drops,0,`${level.name}: cargo should settle on tray`);
  assert.equal(sim.cargo.bindings.length,level.cargo==='pizza'?3:level.cargo==='crates'?5:1);
  const first=sim.cargo.bindings[0].body;
  assert(first.translation().y>sim.tray.position.y,`${level.name}: CCD cargo stays above tray`);
  first.setTranslation({x:0,y:level.killY-1,z:0},true);sim.step(idle);
  assert.equal(sim.drops,1);assert(sim.failed>0);
  for(let i=0;i<100;i++)sim.step(idle);
  assert.equal(sim.drops,1);assert.equal(sim.failed,0);
  assert(sim.player.body.translation().y>level.killY);
  const cp=level.pieces.find(p=>p.type==='checkpoint')!;sim.player.reset(new (await import('three')).Vector3(...cp.position));sim.tray.reset(sim.player);sim.cargo.rebuild(sim.tray.position,t);sim.bindings=[...sim.built.bindings,sim.player.binding,sim.tray.binding,...sim.cargo.bindings];sim.step(idle);
  assert(events.includes('checkpoint'),`${level.name}: checkpoint activation`);
  sim.respawn(true);assert.equal(sim.drops,2);assert(Math.abs(sim.player.body.translation().z-cp.position[2])<.01);
  t.cargoMass=2;t.cargoFriction=.42;t.gravity=8;sim.tune();assert.equal(sim.world.gravity.y,-8);assert(Math.abs(sim.cargo.colliders[0].friction()-.42)<.001);assert(Math.abs(sim.cargo.bindings[0].body.mass()-2)<.001);
  console.log(`PASS ${level.name}: settle, CCD, drop, timed rebuild, checkpoint, R, live tuning`);sim.dispose();
}
assert.equal(STEP,1/60);
// A full-speed approach should deliver the intended first bump surprise.
const bump=new Simulation(level1,{...defaults});
for(let i=0;i<240&&!bump.failed;i++)bump.step({x:0,z:1,yaw:0,jump:false});
console.log(`Bump approach: drops=${bump.drops}, z=${bump.player.body.translation().z.toFixed(2)}`);
assert.equal(bump.drops,1,'full-speed bump causes a drop');
assert(bump.player.body.translation().z>6.5,'starting normally must survive until the bump');
bump.dispose();
console.log('Physics smoke checks passed.');
