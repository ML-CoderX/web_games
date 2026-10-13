import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import './style.css';
import { levels } from './levels';
import { Simulation,STEP,GameEvent } from './game/simulation';
import { Input } from './game/input';
import { FollowCamera } from './game/camera';
import { HUD } from './game/hud';
import { menu,pauseMenu } from './ui/menu';
import { winScreen } from './ui/win';
import { Synth } from './audio/synth';
import { tuning,createTuning,cargoFriction,saveFriction } from './tuning';
import { mesh,disposeTree } from './levels/builder';

const canvas=document.querySelector<HTMLCanvasElement>('#game')!,ui=document.querySelector<HTMLDivElement>('#ui')!;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xe5eae1);scene.fog=new THREE.Fog(0xe5eae1,28,115);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,220);const follow=new FollowCamera(camera);
scene.add(new THREE.HemisphereLight(0xfffaf0,0x849a9f,2.4));const sun=new THREE.DirectionalLight(0xfff7df,3.1);sun.position.set(-12,22,-9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-20;sun.shadow.camera.right=20;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-20;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
const audio=new Synth();let sim:Simulation;let hud:HUD|null=null,screen:HTMLElement|null=null;let mode:'menu'|'playing'|'paused'|'won'='menu';let selected=0;let accumulator=0;let demo:THREE.Group|null=null;
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);resize();
function setSound(){audio.muted=!audio.muted;hud?.sound(audio.muted);}
const input=new Input(canvas,()=>{if(mode==='playing')pause();},()=>{if(mode==='playing'||mode==='paused'){sim.respawn(true);if(mode==='paused')resume();}},setSound,()=>mode==='playing');
function event(e:GameEvent){
  if(e==='respawn'&&mode==='paused'){input.clear();input.yaw=sim.checkpoints.yaw;follow.snap(sim.player,input.yaw);}
  if(mode!=='playing')return;
  if(e==='drop'){audio.thud();follow.shake=.4;hud?.message('Oops. Gravity wins this round.',sim.elapsed,1.5);}
  if(e==='checkpoint'){audio.ding();hud?.message('Checkpoint! A little room to breathe.',sim.elapsed);}
  if(e==='respawn'){input.clear();input.yaw=sim.checkpoints.yaw;follow.snap(sim.player,input.yaw);}
  if(e==='win'){mode='won';document.exitPointerLock();audio.win();screen=winScreen(ui,sim,()=>start(selected),()=>selected===levels.length-1?showMenu():start(selected+1),showMenu,selected===levels.length-1);}
}
function replaceLevel(index:number){sim?.dispose();selected=index;const level=levels[index];tuning.cargoFriction=cargoFriction(index);sim=new Simulation(level,tuning,event);scene.add(sim.built.root);}
function cleanUI(){screen?.remove();screen=null;hud?.dispose();hud=null;input.clear();accumulator=0;if(demo){disposeTree(demo);demo=null;}}
function start(index:number){mode='menu';cleanUI();audio.unlock();replaceLevel(index);mode='playing';input.yaw=0;input.pitch=0;follow.snap(sim.player,0);hud=new HUD(ui,sim,pause,setSound);hud.sound(audio.muted);hud.message('Easy does it. Your delivery starts here.',0,3);gui.controllersRecursive().forEach(c=>c.updateDisplay());}
function pause(){if(mode!=='playing')return;mode='paused';input.clear();document.exitPointerLock();screen=pauseMenu(ui,resume,()=>{sim.respawn(true);resume();},showMenu);}
function resume(){screen?.remove();screen=null;mode='playing';input.clear();accumulator=0;audio.unlock();}
function showMenu(){mode='menu';document.exitPointerLock();cleanUI();replaceLevel(0);
  // A small, handmade parcel diorama for the dispatch screen.
  sim.built.root.visible=false;demo=new THREE.Group();scene.add(demo);
  mesh(new THREE.BoxGeometry(6,.55,5),0xf4d35e,demo,[0,-.4,0]);mesh(new THREE.BoxGeometry(6.08,.1,5.08),0xebc652,demo,[0,-.72,0]);
  for(let i=0;i<5;i++)mesh(new THREE.BoxGeometry(.09,.01,.35),0xfff5cf,demo,[-2+i,.0,-1.75]);
  const courier=sim.player.visual.clone();courier.position.set(-.25,.82,-.65);courier.rotation.y=-.35;demo.add(courier);
  const tray=sim.tray.visual.clone();tray.position.set(courier.position.x+Math.sin(-.35)*2,1.02,courier.position.z+Math.cos(-.35)*2);tray.rotation.z=-.10;demo.add(tray);
  sim.cargo.bindings.forEach((b,i)=>{const box=b.mesh.clone();box.position.set(tray.position.x+i*.025,1.13+i*.115,tray.position.z);box.rotation.z=-.10;box.rotation.y=i*.04;demo!.add(box);});
  for(const z of [-2,2]){mesh(new THREE.BoxGeometry(.18,.6,4.5),0x3d5a80,demo,[2.8,.15,0]);if(z===2)break;}
  const flag=new THREE.Group();flag.position.set(1.7,0,1.25);demo.add(flag);mesh(new THREE.CylinderGeometry(.035,.035,2.2,8),0x3d5a80,flag,[0,1.1,0]);mesh(new THREE.BoxGeometry(.55,.35,.035),0x7bd389,flag,[.24,1.96,0]);mesh(new THREE.CylinderGeometry(.35,.45,.13,12),0x7bd389,flag,[0,.04,0]);
  mesh(new THREE.PlaneGeometry(200,200),0xe5eae1,demo,[0,-.85,0]).rotation.x=-Math.PI/2;
  screen=menu(ui,levels,start);camera.position.set(-8,7,10);camera.lookAt(-2,0,0);sun.position.set(-6,14,7);sun.target.position.set(0,0,0);
}
let gui:ReturnType<typeof createTuning>;
async function bootstrap(){
  await RAPIER.init();ui.innerHTML='';gui=createTuning(()=>{sim?.tune();saveFriction(selected);});showMenu();let last=performance.now();
  function frame(now:number){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.1);last=now;
    if(mode==='playing'){accumulator+=dt;let first=true;while(accumulator>=STEP){const c=input.read();if(!first)c.jump=false;sim.step(c);accumulator-=STEP;first=false;if(mode!=='playing')break;}sim.render(Math.max(0,accumulator/STEP));follow.update(sim.player,input.yaw,input.pitch,dt);hud?.update(sim);
      const p=sim.player.visual.position;sun.position.set(p.x-12,p.y+22,p.z-9);sun.target.position.copy(p);
    }else if(mode==='menu'&&demo){demo.rotation.y=Math.sin(now*.00015)*.045;const wide=innerWidth/innerHeight>1.3;camera.position.set(-8,7,10);camera.lookAt(wide?-2.6:0,wide?.7:0,0);camera.setViewOffset(innerWidth,innerHeight,wide?-innerWidth*.16:0,wide?innerHeight*.03:innerHeight*.18,innerWidth,innerHeight);}
    if(mode!=='menu')camera.clearViewOffset();renderer.render(scene,camera);
  }requestAnimationFrame(frame);
}
bootstrap().catch(error=>{console.error(error);ui.innerHTML='<div class="loading">Could not start the delivery.<br>Please reload in a browser with WebGL enabled.</div>';});
