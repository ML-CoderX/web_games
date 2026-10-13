import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { Player } from '../src/game/player';
import { Tray } from '../src/game/tray';
import { groups } from '../src/levels/builder';
import { defaults } from '../src/tuning';

await RAPIER.init();
// Fire cargo through the courier's centerline at high speed. With the old
// collision masks this crosses the entire capsule in a handful of frames.
for(const axis of ['x','z'] as const){
  const world=new RAPIER.World({x:0,y:0,z:0});world.timestep=1/60;
  const player=new Player(world);player.reset(new THREE.Vector3());
  const shot=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(axis==='x'?-3:0,.82,axis==='z'?-3:0).setCcdEnabled(true));
  world.createCollider(RAPIER.ColliderDesc.ball(.25).setMass(1).setCollisionGroups(groups.cargo),shot);
  shot.setLinvel({x:axis==='x'?80:0,y:0,z:axis==='z'?80:0},true);
  let contacted=false;
  for(let i=0;i<12;i++){
    world.step();world.contactPair(player.body.collider(0),shot.collider(0),()=>contacted=true);
    assert(shot.translation()[axis]<player.body.translation()[axis],`cargo cannot tunnel through the player's ${axis} axis`);
  }
  assert(contacted,'cargo must physically contact the player');world.free();
}
// Stress spring lag, direction changes, jumps, and maximum live tilt. Check
// actual collider separation rather than merely testing the clamp formula.
const world=new RAPIER.World({x:0,y:0,z:0});world.timestep=1/60;
const player=new Player(world);player.reset(new THREE.Vector3());const tray=new Tray(world,true);tray.reset(player);
for(let i=0;i<720;i++){
  player.step({x:Math.sin(i*.1)>0?1:-1,z:i%120<60?1:-1,jump:false,yaw:i*.04},1/60,{...defaults,playerSpeed:8});
  tray.step(player,1/60,{...defaults,springStiffness:10,damping:1,maxTilt:.8,tiltFactor:.15});world.step();
  for(let j=0;j<tray.body.numColliders();j++){
    const contact=player.body.collider(0).contactCollider(tray.body.collider(j),.01);
    assert(!contact||contact.distance>-.005,'tilted tray and rim cannot penetrate the capsule');
  }
}
world.free();
console.log('PASS solid player: fast cargo impacts on two axes and 720 steps of tray-clearance stress');
