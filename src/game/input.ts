import { Controls } from './player';
export class Input {
  keys=new Set<string>();yaw=0;pitch=0;jump=false;
  constructor(canvas:HTMLCanvasElement,onPause:()=>void,onRetry:()=>void,onMute:()=>void,isPlaying:()=>boolean){
    window.addEventListener('keydown',e=>{if(['Space','KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();if(e.repeat)return;
      this.keys.add(e.code);if(e.code==='Space')this.jump=true;if(e.code==='Escape')onPause();if(e.code==='KeyR')onRetry();if(e.code==='KeyM')onMute();
    });
    window.addEventListener('keyup',e=>this.keys.delete(e.code));
    canvas.addEventListener('click',()=>{if(isPlaying())canvas.requestPointerLock()?.catch(()=>{});});
    document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas){this.yaw-=e.movementX*.0025;this.pitch=Math.max(-.35,Math.min(.7,this.pitch+e.movementY*.002));}});
    document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&isPlaying())onPause();});
    window.addEventListener('blur',()=>{this.clear();if(isPlaying())onPause();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){this.clear();if(isPlaying())onPause();}});
  }
  clear(){this.keys.clear();this.jump=false;}
  read():Controls{const c={x:Number(this.keys.has('KeyD'))-Number(this.keys.has('KeyA')),z:Number(this.keys.has('KeyW'))-Number(this.keys.has('KeyS')),jump:this.jump,yaw:this.yaw};this.jump=false;return c;}
}
