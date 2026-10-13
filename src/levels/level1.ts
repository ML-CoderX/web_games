import { Level, Piece, palette } from './types';
const pieces: Piece[] = [
  { type: 'box', position: [0,-0.3,6.5], size: [3,0.6,17] },
  { type: 'box', position: [-7.5,-0.3,15], size: [18,0.6,3] },
  { type: 'box', position: [-15,1.2,18.75], size: [3,0.6,4.5] },
  { type: 'box', position: [-15,0.7,26.5], size: [3,0.6,11] },
  { type: 'ramp', position: [0,.055,7.79], size: [3,.04,.212],rotation:[-Math.PI/4,0,0], color: palette.accent },
  { type: 'box', position: [0,.075,8], size: [3,.15,.3], color: palette.accent },
  { type: 'ramp', position: [0,.055,8.21], size: [3,.04,.212],rotation:[Math.PI/4,0,0], color: palette.accent },
  { type: 'ramp', position: [-10,0.64,15], size: [6.2,0.24,3], rotation: [0,0,-Math.atan(1.5/6)] },
  { type: 'box', position: [-14.75,1.2,15], size: [3.5,0.6,3] },
  { type: 'checkpoint', position: [-7,0,15], radius: 1.2 },
  { type: 'goal', position: [-15,1,30], radius: 1.35 },
];
// Continuous rails, with openings only where the path turns.
for (const [x,z,sx,sz,y] of [[-1.65,5.5,.3,15,0],[1.65,7.5,.3,19,0],[-2.75,16.65,8.5,.3,0],[-4.25,13.35,5.5,.3,0],[-14.75,13.35,3.5,.3,1.5],[-16.65,17.5,.3,7,1.5],[-16.65,26.5,.3,11,1],[-13.35,19.65,.3,2.7,1.5],[-13.35,26.5,.3,11,1],[-15,32.15,3.6,.3,1]] as number[][]) {
  pieces.push({ type:'box', position:[x,y+.3,z], size:[sx,.6,sz], color:palette.hazard });
}
for(const z of [13.35,16.65])pieces.push({type:'ramp',position:[-10,.95,z],size:[6.2,.6,.3],rotation:[0,0,-Math.atan(1.5/6)],color:palette.hazard});
export const level1: Level = { id:1, name:'Kitchen Run', subtitle:'Three pizzas. One very bumpy shift.', cargo:'pizza', length:45, target:'60 sec', start:[0,0,0], killY:-3, pieces };
