import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { buildLevel, BuiltLevel, Binding, disposeTree } from '../levels/builder';
import { Level } from '../levels/types';
import { Tuning } from '../tuning';
import { Player,Controls } from './player';
import { Tray } from './tray';
import { Cargo } from './cargo';
import { Checkpoints } from './checkpoints';
export type GameEvent='drop'|'respawn'|'checkpoint'|'win';
export const STEP=1/60;
export class Simulation {
  world:RAPIER.World;queue=new RAPIER.EventQueue(true);built:BuiltLevel;player:Player;tray:Tray;cargo:Cargo;checkpoints:Checkpoints;
  elapsed=0;clock=0;drops=0;failed=0;won=false;bindings:Binding[]=[];
  constructor(public level:Level,public tuning:Tuning,public onEvent:(event:GameEvent)=>void=()=>{}){
    this.world=new RAPIER.World({x:0,y:-tuning.gravity,z:0});this.world.timestep=STEP;this.world.numSolverIterations=8;this.world.integrationParameters.maxCcdSubsteps=4;
    this.built=buildLevel(level,this.world);this.player=new Player(this.world);this.tray=new Tray(this.world,level.cargo==='egg');this.built.root.add(this.player.visual,this.tray.visual);
    this.cargo=new Cargo(this.world,this.built.root,level.cargo);this.checkpoints=new Checkpoints(level);this.respawn(false);
  }
  respawn(count=false){
    if(count&&!this.failed){this.drops++;this.onEvent('drop');}
    this.failed=0;this.player.reset(this.checkpoints.position,this.checkpoints.yaw);this.tray.reset(this.player);this.cargo.rebuild(this.tray.position,this.tuning);
    this.bindings=[...this.built.bindings,this.player.binding,this.tray.binding,...this.cargo.bindings];
    for(const b of this.bindings){b.previous.copy(b.body.translation());b.previousQ.copy(b.body.rotation());b.mesh.position.copy(b.previous);b.mesh.quaternion.copy(b.previousQ);}
    this.onEvent('respawn');
  }
  drop(){if(this.failed||this.won)return;this.failed=1.5;this.drops++;this.onEvent('drop');}
  tune(){this.world.gravity.y=-this.tuning.gravity;this.cargo.tune(this.tuning);}
  step(input:Controls){
    if(this.won)return;this.elapsed+=STEP;this.clock+=STEP;
    for(const b of this.bindings){b.previous.copy(b.body.translation());b.previousQ.copy(b.body.rotation());}
    for(const {piece:p,body} of this.built.movers){const pos=new THREE.Vector3(...p.position);pos[p.axis]+=Math.sin(this.clock*2*Math.PI/p.period+p.phase)*p.travel/2;body.setNextKinematicTranslation(pos);}
    for(const {piece:p,body,visual} of this.built.hammers){const a=Math.sin(this.clock*2*Math.PI/p.period+p.phase)*.95;visual.rotation.z=a;body.setNextKinematicTranslation({x:p.position[0]+Math.sin(a)*p.length,y:p.position[1]-Math.cos(a)*p.length,z:p.position[2]});body.setNextKinematicRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),a));}
    for(const {piece:p,visual} of this.built.winds){const phase=(this.clock+p.phase)%4;visual.visible=phase>=2.5;visual.children.forEach((m,i)=>m.position.x=((this.clock*6+i*.43)%7)-3.5);
      if(phase>=3)for(const b of this.cargo.bindings){const pos=b.body.translation();if(Math.abs(pos.x-p.position[0])<p.size[0]/2&&Math.abs(pos.z-p.position[2])<p.size[2]/2)b.body.applyImpulse({x:p.force*STEP,y:0,z:0},true);}
    }
    if(!this.failed){this.player.step(input,STEP,this.tuning);this.tray.step(this.player,STEP,this.tuning);}
    this.world.step(this.queue);
    const cargoHandles=new Set(this.cargo.colliders.map(c=>c.handle));
    this.queue.drainCollisionEvents((a,b,started)=>{if(started&&((cargoHandles.has(a)&&this.built.terrain.has(b))||(cargoHandles.has(b)&&this.built.terrain.has(a))))this.drop();});
    if(this.player.body.translation().y<this.level.killY||this.cargo.bindings.some(b=>b.body.translation().y<this.level.killY))this.drop();
    if(this.failed){this.failed-=STEP;if(this.failed<=0)this.respawn();return;}
    if(this.checkpoints.update(new THREE.Vector3().copy(this.player.body.translation()),this.built,()=>this.onEvent('checkpoint'))){
      // A delivery requires every piece to still be with the courier.
      if(this.cargo.bindings.every(b=>new THREE.Vector3().copy(b.body.translation()).distanceTo(this.tray.position)<4)){this.won=true;this.onEvent('win');}
    }
  }
  render(alpha:number){for(const b of this.bindings){b.mesh.position.lerpVectors(b.previous,new THREE.Vector3().copy(b.body.translation()),alpha);b.mesh.quaternion.slerpQuaternions(b.previousQ,new THREE.Quaternion().copy(b.body.rotation()),alpha);}this.player.visual.rotation.y=this.player.facing;}
  dispose(){this.queue.free();this.world.free();disposeTree(this.built.root);}
}
