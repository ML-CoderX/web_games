import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { groups,mesh,bind } from '../levels/builder';
import { Tuning } from '../tuning';
import { Player } from './player';
export class Tray {
  body:RAPIER.RigidBody;visual=new THREE.Group();position=new THREE.Vector3();velocity=new THREE.Vector3();tilt=new THREE.Vector3();filteredAcceleration=new THREE.Vector3();
  constructor(world:RAPIER.World,bowl:boolean){
    this.body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased());
    world.createCollider(RAPIER.ColliderDesc.cuboid(.6,.05,.6).setFriction(1).setCollisionGroups(groups.tray),this.body);
    mesh(new THREE.BoxGeometry(1.2,.1,1.2),0xfdf7e9,this.visual);
    if(bowl) for(let i=0;i<16;i++){
      const a=i/16*Math.PI*2,q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-a);
      const x=Math.cos(a)*.55,z=Math.sin(a)*.55;
      world.createCollider(RAPIER.ColliderDesc.cuboid(.05,.05,.115).setTranslation(x,.10,z).setRotation(q).setCollisionGroups(groups.tray).setFriction(1),this.body);
      const rim=mesh(new THREE.BoxGeometry(.1,.1,.23),0xf4d35e,this.visual,[x,.10,z]);rim.quaternion.copy(q);
    }
  }
  get binding(){return bind(this.body,this.visual);}
  anchor(player:Player){const p=player.body.translation();return new THREE.Vector3(p.x+Math.sin(player.facing)*2,p.y+.2,p.z+Math.cos(player.facing)*2);}
  reset(player:Player){this.position.copy(this.anchor(player));this.velocity.set(0,0,0);this.tilt.set(0,0,0);this.filteredAcceleration.set(0,0,0);this.body.setTranslation(this.position,true);this.body.setRotation({x:0,y:0,z:0,w:1},true);this.body.setNextKinematicTranslation(this.position);this.body.setNextKinematicRotation({x:0,y:0,z:0,w:1});}
  step(player:Player,dt:number,t:Tuning){
    const force=this.anchor(player).sub(this.position).multiplyScalar(t.springStiffness).addScaledVector(this.velocity,-t.damping);
    this.velocity.addScaledVector(force,dt);this.position.addScaledVector(this.velocity,dt);
    // Kinematic bodies cannot be stopped by contacts. Constrain the held tray
    // outside the capsule before submitting its next pose, including the
    // player's next movement. A bounding sphere also covers tilted corners/rim.
    const p=player.body.translation(),v=player.body.linvel();
    const center=new THREE.Vector3(p.x+v.x*dt,p.y,p.z+v.z*dt);
    const outward=new THREE.Vector3(this.position.x-center.x,0,this.position.z-center.z);
    const clearance=1.28;
    if(outward.length()<clearance){
      if(outward.lengthSq()<1e-8)outward.set(Math.sin(player.facing),0,Math.cos(player.facing));
      outward.normalize();this.position.x=center.x+outward.x*clearance;this.position.z=center.z+outward.z*clearance;
      const inward=this.velocity.dot(outward);if(inward<0)this.velocity.addScaledVector(outward,-inward);
    }
    this.filteredAcceleration.lerp(player.acceleration,1-Math.exp(-dt*5));
    const ax=THREE.MathUtils.clamp(this.filteredAcceleration.z*t.tiltFactor,-t.maxTilt,t.maxTilt),az=THREE.MathUtils.clamp(-this.filteredAcceleration.x*t.tiltFactor,-t.maxTilt,t.maxTilt);
    this.tilt.x+=(ax-this.tilt.x)*Math.min(1,dt*10);this.tilt.z+=(az-this.tilt.z)*Math.min(1,dt*10);
    this.body.setNextKinematicTranslation(this.position);this.body.setNextKinematicRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(this.tilt.x,0,this.tilt.z)));
  }
}
