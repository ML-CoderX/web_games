import * as THREE from 'three';
import { BuiltLevel } from '../levels/builder';
import { Level } from '../levels/types';
export class Checkpoints {
  position:THREE.Vector3;index=-1;yaw=0;
  constructor(level:Level){this.position=new THREE.Vector3(...level.start);}
  update(position:THREE.Vector3,built:BuiltLevel,onCheckpoint:()=>void){
    let won=false;
    built.checkpoints.forEach(({piece,flag},i)=>{
      const p=new THREE.Vector3(...piece.position);const within=Math.hypot(position.x-p.x,position.z-p.z)<piece.radius&&Math.abs(position.y-(p.y+.8))<1.4;
      if(within&&piece.type==='goal')won=true;
      if(within&&piece.type==='checkpoint'&&i>this.index){this.index=i;this.position.copy(p);this.yaw=piece.position[0]<0?-Math.PI/2:0;(flag.material as THREE.MeshStandardMaterial).color.setHex(0x7bd389);onCheckpoint();}
    });return won;
  }
}
