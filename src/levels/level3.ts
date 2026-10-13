import { Level, Piece, palette } from './types';
const pieces: Piece[] = [
  { type:'box', position:[0,-.5,9], size:[6,1,22] },
  { type:'windZone', position:[0,2,7], size:[7,5,9],force:5,phase:0 },
  { type:'windZone', position:[0,2,16], size:[7,5,7],force:-5,phase:2 },
  { type:'checkpoint', position:[0,0,20], radius:1.5 },
  { type:'box', position:[0,-.5,30], size:[4,1,20] },
  { type:'pendulum', position:[0,5,26], length:4,period:3,phase:0 },
  { type:'pendulum', position:[0,5,35], length:4,period:3,phase:Math.PI },
  { type:'box', position:[0,-.5,42], size:[5,1,4] },
  { type:'checkpoint', position:[0,0,40], radius:1.5 },
  { type:'box', position:[0,-.16,47], size:[3,.32,6], seesaw:true,color:palette.accent },
  { type:'box', position:[0,-.5,53.5], size:[5,1,7] },
  { type:'box', position:[0,-.5,61.75], size:[5,1,6.5] },
  { type:'checkpoint', position:[0,0,65], radius:1.2 },
  { type:'box', position:[0,-.2,68], size:[.8,.4,6] },
  { type:'box', position:[0,-.5,76.5], size:[6,1,11] },
  { type:'goal', position:[0,0,80], radius:1.7 },
];
export const level3: Level = { id:3,name:'Rooftop Chaos',subtitle:'One giant egg. A terrible shortcut.',cargo:'egg',length:80,target:'3 min',start:[0,0,0],killY:-6,pieces };
