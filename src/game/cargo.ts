import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { Binding,bind,groups,mesh,disposeTree } from '../levels/builder';
import { Level } from '../levels/types';
import { Tuning } from '../tuning';
export class Cargo {
  bindings:Binding[]=[];colliders:RAPIER.Collider[]=[];
  constructor(private world:RAPIER.World,private root:THREE.Group,private kind:Level['cargo']){}
  rebuild(anchor:THREE.Vector3,t:Tuning){
    this.clear();const n=this.kind==='pizza'?3:this.kind==='crates'?5:1;const height=this.kind==='pizza'?.1:this.kind==='crates'?.6:1;
    for(let i=0;i<n;i++){
      const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(anchor.x,anchor.y+.05+height*(i+.5)+.008*i+.003,anchor.z).setCcdEnabled(true).setCanSleep(false));
      const desc=this.kind==='egg'?RAPIER.ColliderDesc.ball(.5):RAPIER.ColliderDesc.cuboid(this.kind==='pizza'?.4:.3,height/2,this.kind==='pizza'?.4:.3);
      const collider=this.world.createCollider(desc.setMass(t.cargoMass).setFriction(t.cargoFriction).setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min).setRestitution(0).setCollisionGroups(groups.cargo).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),body);this.colliders.push(collider);
      const g=new THREE.Group();this.root.add(g);
      if(this.kind==='egg'){mesh(new THREE.SphereGeometry(.5,20,16),0x98c1d9,g);for(const x of [-.15,.15])mesh(new THREE.SphereGeometry(.035,8,6),0x3d5a80,g,[x,.06,.473]);}
      else if(this.kind==='pizza'){
        mesh(new THREE.BoxGeometry(.8,.1,.8),i%2?0x98c1d9:0xc7e0e4,g);
        mesh(new THREE.BoxGeometry(.81,.015,.81),0xeaf3e9,g,[0,.045,0]);mesh(new THREE.BoxGeometry(.18,.105,.81),0xee6c4d,g);
      }else{
        mesh(new THREE.BoxGeometry(.6,.6,.6),0x98c1d9,g);
        for(const side of [-1,1])for(const y of [-.22,.22])mesh(new THREE.BoxGeometry(.62,.075,.055),0x638d9f,g,[0,y,side*.3]);
        mesh(new THREE.BoxGeometry(.065,.61,.61),0xc5dfe1,g);
      }
      g.position.copy(body.translation());this.bindings.push(bind(body,g));
    }
  }
  tune(t:Tuning){this.colliders.forEach(c=>{c.setFriction(t.cargoFriction);c.setMass(t.cargoMass);c.parent()?.recomputeMassPropertiesFromColliders();});}
  clear(){this.bindings.forEach(b=>{this.world.removeRigidBody(b.body);disposeTree(b.mesh);});this.bindings=[];this.colliders=[];}
}
