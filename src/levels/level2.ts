import { Level, Piece, palette } from './types';
const pieces: Piece[] = [
  { type:'box', position:[0,-.3,0], size:[4,.6,4] },
  { type:'box', position:[0,-.25,7], size:[1.2,.5,10] },
  { type:'box', position:[0,-.3,13], size:[4,.6,2] },
  { type:'movingPlatform', position:[0,-.25,17], size:[3,.5,4], axis:'z',travel:6,period:6,phase:-Math.PI/2 },
  { type:'box', position:[0,-.3,20], size:[3,.6,2] },
  { type:'checkpoint', position:[0,0,20], radius:1.5 },
  { type:'movingPlatform', position:[0,-.25,23], size:[3,.5,4], axis:'z',travel:6,period:6,phase:-Math.PI/2 },
  { type:'box', position:[0,-.3,26.5], size:[4,.6,4] },
  { type:'box', position:[0,-.3,29], size:[5,.6,2] },
  { type:'checkpoint', position:[0,0,25], radius:1.2 },
  { type:'box', position:[0,-.3,40], size:[6,.6,20] },
  { type:'checkpoint', position:[0,0,50], radius:1.5 },
  { type:'ramp', position:[0,-1.12,54], size:[6,.24,8.25], rotation:[Math.atan(2/8),0,0] },
  { type:'box', position:[0,-2.3,64.5], size:[6,.6,13] },
  { type:'goal', position:[0,-2,70], radius:1.7 },
];
for(let i=0;i<6;i++) pieces.push({ type:'cylinder', position:[i%2?-1.15:1.15,.65,32+i*3], radius:.6,height:1.3,color:palette.hazard });
export const level2: Level = { id:2,name:'Delivery Docks',subtitle:'Five crates. Absolutely no sea legs.',cargo:'crates',length:70,target:'2 min',start:[0,0,0],killY:-3,pieces };
