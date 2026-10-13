import RAPIER from '@dimforge/rapier3d-compat';
import assert from 'node:assert/strict';
import { Simulation } from '../src/game/simulation';
import { defaults } from '../src/tuning';
import { level1 } from '../src/levels/level1';
import { level2 } from '../src/levels/level2';
import { level3 } from '../src/levels/level3';
import { levels,frictionForCargo } from '../src/levels';
import { groups } from '../src/levels/builder';
import * as THREE from 'three';
await RAPIER.init();
const failures:string[]=[];
for(const level of levels.filter(l=>!process.env.LEVEL||l.id===Number(process.env.LEVEL))){
 const sim=new Simulation(level,{...defaults,cargoFriction:frictionForCargo[level.cargo]});
 for(let i=0;i<(level.cargo==='egg'?0:120);i++)sim.step({x:0,z:0,yaw:0,jump:false});
 let maxZ=0,turn=0;
 for(let i=0;i<14400;i++){
  const p=sim.player.body.translation(),v=sim.player.body.linvel();maxZ=Math.max(maxZ,p.z);
  const support=sim.world.castRay(new RAPIER.Ray(p,{x:0,y:-1,z:0}),.87,true,undefined,groups.groundQuery,undefined,sim.player.body)?.collider.parent();
  const riding=support?.isKinematic()?support.linvel().z:0;
  if(level.id===1){if(p.z>13.5)turn=Math.max(turn,1);if(p.x<-14.5)turn=2;if(sim.failed&&sim.checkpoints.index<0)turn=0;}
  const goal=level.pieces.find(piece=>piece.type==='goal')!;
  const target=level.id===1?(turn===0?new THREE.Vector3(0,0,14.5):turn===1?new THREE.Vector3(-15,0,15):new THREE.Vector3(-15,0,30)):new THREE.Vector3(...goal.position);
  const dir=target.sub(new THREE.Vector3(p.x,0,p.z)).normalize();const speed=level.id===2&&p.z<14?.5:level.id===3&&p.z<40?5:level.id===3&&p.z>53&&p.z<66?3:1;
  const along=v.x*dir.x+(v.z-riding)*dir.z;const press=along<speed;
  if(level.id===1){
   const desired=turn===1?1:0;const side=desired&&-v.x<.7?1:turn===2&&p.x<-15.05?-1:0;
   const forward=turn===1?(p.z<14.8&&v.z<.5?1:0):(v.z<1?1:0);
   sim.step({x:side,z:forward,yaw:0,jump:p.z>7.2&&p.z<8.2&&p.x>-.5&&sim.player.grounded});
  }else if(level.id===3){
   const x=Math.abs(p.x)>.05?Math.sign(p.x):0;
   sim.step({x,z:v.z<speed?1:0,yaw:0,jump:p.z>56.5&&p.z<57.1&&sim.player.grounded});
  }else if(level.id===6){
   const pace=p.z<32?5:p.z>44?3:1;
   sim.step({x:Math.abs(p.x)>.05?Math.sign(p.x):0,z:v.z<pace?1:0,yaw:0,jump:p.z>47.5&&p.z<48.1&&sim.player.grounded});
  }else sim.step({x:0,z:level.id===5?(v.z-riding<(p.z<38?.5:1)?1:0):press?1:0,yaw:Math.atan2(dir.x,dir.z),jump:false});
  if(sim.failed&&sim.drops>25){console.log(`Retry limit: ${level.name} z=${p.z.toFixed(2)}, checkpoint=${sim.checkpoints.position.z}`);break;}
  if(sim.won){console.log(`PASS ${level.name}: start to goal in ${sim.elapsed.toFixed(1)}s, ${sim.drops} drops`);break;}
  if(i===14399)console.log(level.name,'timed out',sim.player.body.translation(),maxZ);
 }
 if(!sim.won)failures.push(level.name);sim.dispose();
}
assert.deepEqual(failures,[],'normal-input traversal must reach every goal');
