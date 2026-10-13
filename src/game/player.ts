import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { groups, mesh, bind } from '../levels/builder';
import { Tuning } from '../tuning';
export interface Controls { x:number;z:number;jump:boolean;yaw:number; }
export class Player {
  body:RAPIER.RigidBody; visual=new THREE.Group(); facing=0; grounded=false; acceleration=new THREE.Vector3();lastVelocity=new THREE.Vector3();
  constructor(private world:RAPIER.World){
    this.body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().lockRotations().setCcdEnabled(true).setCanSleep(false));
    world.createCollider(RAPIER.ColliderDesc.capsule(.4,.4).setMass(60).setFriction(.9).setRestitution(0).setCollisionGroups(groups.player),this.body);
    mesh(new THREE.CapsuleGeometry(.4,.8,5,12),0xee6c4d,this.visual);
    mesh(new THREE.SphereGeometry(.405,12,8),0xf6b899,this.visual,[0,.37,0]).scale.set(1,.6,1);
    for(const x of [-.15,.15]){mesh(new THREE.SphereGeometry(.10,10,8),0xfffcf3,this.visual,[x,.38,.34]);mesh(new THREE.SphereGeometry(.046,8,8),0x243b4a,this.visual,[x,.38,.425]);
      const arm=mesh(new THREE.CylinderGeometry(.085,.09,1.4,8),0xee6c4d,this.visual,[x*2.6,-.02,.7]);arm.rotation.x=Math.PI/2;
      mesh(new THREE.SphereGeometry(.11,8,8),0xf6b899,this.visual,[x*2.6,-.02,1.4]);
      mesh(new THREE.SphereGeometry(.18,8,6),0x3d5a80,this.visual,[x,-.68,.1]).scale.set(1,.6,1.5);
    }
  }
  get binding(){return bind(this.body,this.visual);}
  step(input:Controls,dt:number,t:Tuning){
    const pos=this.body.translation(),vel=this.body.linvel();
    const ray=new RAPIER.Ray(pos,{x:0,y:-1,z:0});
    const hit=this.world.castRayAndGetNormal(ray,.87,true,undefined,groups.groundQuery,undefined,this.body);
    this.grounded=!!hit&&hit.normal.y>.45&&vel.y<1;
    const support=hit?.collider.parent();const base=support&&support.isKinematic()?support.linvel():{x:0,z:0};
    const f=new THREE.Vector3(Math.sin(input.yaw),0,Math.cos(input.yaw));
    const target=f.multiplyScalar(input.z).add(new THREE.Vector3(-Math.cos(input.yaw),0,Math.sin(input.yaw)).multiplyScalar(input.x));
    if(target.lengthSq()>1)target.normalize();target.multiplyScalar(t.playerSpeed);
    const delta=new THREE.Vector3(target.x+base.x-vel.x,0,target.z+base.z-vel.z).clampLength(0,20*dt);
    const next={x:vel.x+delta.x,y:input.jump&&this.grounded?Math.sqrt(2*t.gravity*1.05):vel.y,z:vel.z+delta.z};
    // Measure actual velocity changes, including obstacle impacts, for tray inertia.
    this.acceleration.set((next.x-this.lastVelocity.x)/dt,0,(next.z-this.lastVelocity.z)/dt).clampLength(0,30);
    this.lastVelocity.set(next.x,next.y,next.z);this.body.setLinvel(next,true);
    const desired=input.yaw;this.facing+=Math.atan2(Math.sin(desired-this.facing),Math.cos(desired-this.facing))*Math.min(1,dt*9);
  }
  reset(p:THREE.Vector3,yaw=0){this.body.setTranslation({x:p.x,y:p.y+.82,z:p.z},true);this.body.setLinvel({x:0,y:0,z:0},true);this.lastVelocity.set(0,0,0);this.acceleration.set(0,0,0);this.facing=yaw;}
}
