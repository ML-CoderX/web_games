import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { Level, Piece, palette } from './types';
// Both members of a collision pair must opt in. The courier is solid to every
// physical object, including the load and moving hammers.
export const groups = { player:0x0001000e, terrain:0x0002000f, cargo:0x0004000f, tray:0x00080005, hammer:0x00020005, groundQuery:0x00010002 };
export const material=(color:number)=>new THREE.MeshStandardMaterial({color,flatShading:true,roughness:.86});
export function mesh(geo:THREE.BufferGeometry,color:number,parent:THREE.Object3D,position?:number[]) {
  const m=new THREE.Mesh(geo,material(color)); m.castShadow=true;m.receiveShadow=true;if(position)m.position.set(position[0],position[1],position[2]);parent.add(m);return m;
}
export interface Binding { body:RAPIER.RigidBody; mesh:THREE.Object3D; previous:THREE.Vector3; previousQ:THREE.Quaternion }
export function bind(body:RAPIER.RigidBody,m:THREE.Object3D):Binding { return {body,mesh:m,previous:new THREE.Vector3().copy(body.translation()),previousQ:new THREE.Quaternion().copy(body.rotation())}; }
export interface BuiltLevel { root:THREE.Group; bindings:Binding[]; movers:{piece:Extract<Piece,{type:'movingPlatform'}>;body:RAPIER.RigidBody}[]; hammers:{piece:Extract<Piece,{type:'pendulum'}>;body:RAPIER.RigidBody;visual:THREE.Group}[]; winds:{piece:Extract<Piece,{type:'windZone'}>;visual:THREE.Group}[]; terrain:Set<number>; checkpoints:{piece:Extract<Piece,{type:'checkpoint'|'goal'}>;flag:THREE.Mesh}[]; }
export function buildLevel(level:Level,world:RAPIER.World):BuiltLevel {
  const b:BuiltLevel={root:new THREE.Group(),bindings:[],movers:[],hammers:[],winds:[],terrain:new Set(),checkpoints:[]};
  for(const p of level.pieces){
    const [x,y,z]=p.position;
    if(p.type==='windZone'){
      const g=new THREE.Group();g.position.set(x,y,z);b.root.add(g);
      for(let i=0;i<18;i++)mesh(new THREE.BoxGeometry(.65,.025,.025),0xf7f3e8,g,[(i*1.71)%7-3.5,(i*.73)%3-1.5,(i*1.37)%p.size[2]-p.size[2]/2]);
      b.winds.push({piece:p,visual:g}); continue;
    }
    if(p.type==='checkpoint'||p.type==='goal'){
      const g=new THREE.Group();g.position.set(x,y,z);b.root.add(g);
      const pad=mesh(new THREE.CylinderGeometry(p.radius,p.radius,.045,32),p.type==='goal'?palette.goal:0xffefad,g,[0,.025,0]);pad.receiveShadow=true;
      mesh(new THREE.CylinderGeometry(.045,.045,2.6,8),palette.hazard,g,[p.radius+.12,1.3,0]);
      const flag=mesh(new THREE.BoxGeometry(.65,.4,.04),p.type==='goal'?palette.goal:palette.accent,g,[p.radius+.42,2.3,0]);
      if(p.type==='goal') { mesh(new THREE.TorusGeometry(p.radius,.07,8,32),palette.goal,g,[0,2.4,0]); }
      b.checkpoints.push({piece:p,flag});continue;
    }
    if(p.type==='pendulum'){
      const g=new THREE.Group();g.position.set(x,y,z);b.root.add(g);
      mesh(new THREE.CylinderGeometry(.06,.06,p.length,8),palette.hazard,g,[0,-p.length/2,0]);
      const head=mesh(new THREE.BoxGeometry(1.7,.85,.85),palette.accent,g,[0,-p.length,0]);head.castShadow=true;
      for(const side of [-1,1])mesh(new THREE.BoxGeometry(.14,5.5,.14),palette.hazard,b.root,[x+side*3,2.25,z]);
      mesh(new THREE.BoxGeometry(6.2,.16,.16),palette.hazard,b.root,[x,5,z]);
      const body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x,y-p.length,z));
      world.createCollider(RAPIER.ColliderDesc.cuboid(.85,.425,.425).setCollisionGroups(groups.hammer).setFriction(.5),body);
      b.hammers.push({piece:p,body,visual:g});continue;
    }
    const dynamic=(p.type==='box' && p.seesaw);
    const desc=dynamic?RAPIER.RigidBodyDesc.dynamic():p.type==='movingPlatform'?RAPIER.RigidBodyDesc.kinematicPositionBased():RAPIER.RigidBodyDesc.fixed();
    desc.setTranslation(x,y,z);
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rotation||[0,0,0])));desc.setRotation(q);
    if(dynamic)desc.setAngularDamping(4).setLinearDamping(1);
    const body=world.createRigidBody(desc);
    let visual:THREE.Mesh,collider:RAPIER.Collider;
    if(p.type==='cylinder'){
      visual=mesh(new THREE.CylinderGeometry(p.radius,p.radius,p.height,12),p.color??palette.hazard,b.root);
      collider=world.createCollider(RAPIER.ColliderDesc.cylinder(p.height/2,p.radius).setFriction(.8).setCollisionGroups(groups.terrain),body);
      for(const yy of [-.4,.4]){const ring=mesh(new THREE.TorusGeometry(p.radius+.005,.035,4,12),0x7893a9,visual,[0,yy,0]);ring.rotation.x=Math.PI/2;}
    }else{
      visual=mesh(new THREE.BoxGeometry(...p.size),p.color??palette.ground,b.root);
      collider=world.createCollider(RAPIER.ColliderDesc.cuboid(p.size[0]/2,p.size[1]/2,p.size[2]/2).setFriction(1).setCollisionGroups(groups.terrain).setMass(dynamic?14:1),body);
    }
    b.terrain.add(collider.handle);visual.position.copy(body.translation());visual.quaternion.copy(q);
    if(p.type==='movingPlatform'){b.movers.push({piece:p,body});b.bindings.push(bind(body,visual));}
    if(dynamic){
      const pivot=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,y,z));
      const joint=world.createImpulseJoint(RAPIER.JointData.revolute({x:0,y:0,z:0},{x:0,y:0,z:0},{x:1,y:0,z:0}),pivot,body,true) as RAPIER.RevoluteImpulseJoint;
      joint.setLimits(-.2,.2);b.bindings.push(bind(body,visual));
      mesh(new THREE.CylinderGeometry(.65,.65,2.8,3),palette.hazard,b.root,[x,y-.6,z]).rotation.z=Math.PI/2;
    }
  }
  // Scenery is generated from geometry only. It has no gameplay colliders.
  if(level.cargo==='pizza'){
    mesh(new THREE.BoxGeometry(85,.3,90),0xe4e2d3,b.root,[-10,-2.5,20]);
    for(let i=0;i<12;i++){ const x=i%2?-23:8,z=3+Math.floor(i/2)*8;mesh(new THREE.BoxGeometry(4,2.2,4),i%3?0xd8c7a6:0xb3c5bd,b.root,[x,-1.5,z]);mesh(new THREE.BoxGeometry(4.2,.18,4.2),0xf7f3e8,b.root,[x,-.32,z]); }
  }else if(level.cargo==='crates'){mesh(new THREE.PlaneGeometry(250,250),0x6bacc1,b.root,[0,-3.1,35]).rotation.x=-Math.PI/2;
    for(let i=0;i<14;i++)mesh(new THREE.BoxGeometry(3,2+(i%3),5),i%2?0xb8cbcc:0x789aaa,b.root,[i%2?-12:12,-1, i*6]);
  }else{mesh(new THREE.PlaneGeometry(300,300),0xbac8c9,b.root,[0,-15,40]).rotation.x=-Math.PI/2;
    for(let i=0;i<34;i++){const h=2+(i*7)%9;mesh(new THREE.BoxGeometry(4,h,5),i%2?0x9db1b7:0x8e9eab,b.root,[(i%2?-1:1)*(10+(i%4)*5),-15+h/2,(i*7)%110-10]);}
  }
  // Start-pad stripes and a few painted route markers.
  for(let i=0;i<3;i++)mesh(new THREE.BoxGeometry(.18,.015,.75),0xfff9da,b.root,[-.6+i*.6,.012,-.7]);
  return b;
}
export function disposeTree(root:THREE.Object3D){root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});root.removeFromParent();}
