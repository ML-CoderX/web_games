import { Level, Piece, palette } from './types';

const pieces: Piece[] = [
  { type:'box', position:[0,-.3,9], size:[5,.6,22] },
  { type:'ramp', position:[0,.63,23], size:[5,.24,6.2], rotation:[-Math.atan(1.5/6),0,0] },
  { type:'box', position:[0,1.2,32], size:[5,.6,12] },
  { type:'box', position:[0,.7,44.5], size:[5,.6,13] },
  { type:'checkpoint', position:[0,0,18], radius:1.4 },
  { type:'checkpoint', position:[0,1.5,35], radius:1.4 },
  { type:'goal', position:[0,1,49], radius:1.6 },
];
for(let i=0;i<4;i++)pieces.push({type:'cylinder',position:[i%2?-1.55:1.55,.6,5+i*3],radius:.5,height:1.2,color:palette.accent});
for(const x of [-2.65,2.65]){
  pieces.push({type:'box',position:[x,.3,9],size:[.3,.6,22],color:palette.hazard});
  pieces.push({type:'ramp',position:[x,1.05,23],size:[.3,.6,6.2],rotation:[-Math.atan(1.5/6),0,0],color:palette.hazard});
  pieces.push({type:'box',position:[x,1.8,32],size:[.3,.6,12],color:palette.hazard});
  pieces.push({type:'box',position:[x,1.3,44.5],size:[.3,.6,13],color:palette.hazard});
}
export const level4:Level={id:4,name:'Pantry Express',subtitle:'An uphill shift. Dinner is on the line.',cargo:'pizza',length:49,target:'75 sec',start:[0,0,0],killY:-3,pieces};
