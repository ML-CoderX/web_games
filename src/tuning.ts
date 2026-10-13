import GUI from 'lil-gui';
import { levels,frictionForCargo } from './levels';
export const defaults = { springStiffness:60,damping:8,tiltFactor:.06,maxTilt:.5,cargoFriction:.9,cargoMass:1,playerSpeed:5,gravity:9.81 };
export type Tuning = typeof defaults;
export const tuning:Tuning = {...defaults};
try { if(typeof window!=='undefined'){const saved=JSON.parse(localStorage.getItem('wobble-tuning')||'{}'); for(const k of Object.keys(defaults) as (keyof Tuning)[]) if(Number.isFinite(saved[k])) tuning[k]=saved[k];} } catch { /* Storage is optional. */ }
export function cargoFriction(level:number){const preset=frictionForCargo[levels[level].cargo];try{const saved=localStorage.getItem(`wobble-friction-${level}`);if(saved!==null&&Number.isFinite(Number(saved)))return Math.max(0,Math.min(2,Number(saved)));}catch{}return preset;}
export function saveFriction(level:number){try{localStorage.setItem(`wobble-friction-${level}`,String(tuning.cargoFriction));}catch{}}
export function createTuning(onChange:()=>void) {
  const gui=new GUI({title:'THE WOBBLE LAB',width:280}); gui.hide();
  const ranges:Record<keyof Tuning,[number,number,number]>={springStiffness:[10,150,1],damping:[1,30,.1],tiltFactor:[0,.15,.005],maxTilt:[0,.8,.01],cargoFriction:[0,2,.05],cargoMass:[.1,10,.1],playerSpeed:[1,8,.1],gravity:[2,20,.1]};
  for(const k of Object.keys(ranges) as (keyof Tuning)[]) { tuning[k]=Math.max(ranges[k][0],Math.min(ranges[k][1],tuning[k])); gui.add(tuning,k,...ranges[k]).onChange(()=>{try{localStorage.setItem('wobble-tuning',JSON.stringify(tuning));}catch{} onChange();}); }
  window.addEventListener('keydown',e=>{if(e.code==='Backquote') gui.show(gui._hidden);}); return gui;
}
