import * as THREE from 'three';
import { Player } from './player';
export class FollowCamera {
  shake=0;
  constructor(public camera:THREE.PerspectiveCamera){}
  update(player:Player,yaw:number,pitch:number,dt:number){const p=player.visual.position;const dest=new THREE.Vector3(p.x-Math.sin(yaw)*7,p.y+3.5+pitch*4,p.z-Math.cos(yaw)*7);this.camera.position.lerp(dest,1-Math.exp(-dt*7));
    if(this.shake>0){this.shake=Math.max(0,this.shake-dt);this.camera.position.x+=Math.sin(this.shake*130)*this.shake*.18;this.camera.position.y+=Math.cos(this.shake*110)*this.shake*.12;}
    this.camera.lookAt(p.x,p.y+1.2,p.z);
  }
  snap(player:Player,yaw:number){const p=player.body.translation();this.camera.position.set(p.x-Math.sin(yaw)*7,p.y+3.5,p.z-Math.cos(yaw)*7);this.camera.lookAt(p.x,p.y+1.2,p.z);}
}
