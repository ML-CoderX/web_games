import { Level, Piece, palette } from './types';

const pieces: Piece[] = [
  { type:'box',position:[0,-.3,3],size:[5,.6,10] },
  { type:'box',position:[0,-.3,13],size:[1.4,.6,10] },
  { type:'box',position:[0,-.3,22],size:[6,.6,8] },
  { type:'checkpoint',position:[0,0,21],radius:1.4 },
  { type:'checkpoint',position:[0,0,25],radius:1.1 },
  { type:'movingPlatform',position:[0,-.25,30],size:[3,.5,6],axis:'z',travel:6,period:8,phase:-Math.PI/2 },
  { type:'box',position:[0,-.3,37],size:[6,.6,10] },
  { type:'checkpoint',position:[0,0,33],radius:1.4 },
  { type:'box',position:[0,-.3,45],size:[1.4,.6,6] },
  { type:'box',position:[0,-.3,53],size:[6,.6,10] },
  { type:'goal',position:[0,0,56],radius:1.6 },
];
for(const z of [19,24,50,54])for(const x of [-1.7,1.7])pieces.push({type:'cylinder',position:[x,.6,z],radius:.5,height:1.2,color:palette.hazard});
export const level5:Level={id:5,name:'Harbor Hop',subtitle:'Tiny bridges. A very tall order.',cargo:'crates',length:56,target:'2 min',start:[0,0,0],killY:-3,pieces};
