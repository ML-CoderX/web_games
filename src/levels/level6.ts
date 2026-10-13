import { Level, Piece, palette } from './types';

const pieces:Piece[]=[
  { type:'box',position:[0,-.5,8],size:[6,1,20] },
  { type:'windZone',position:[0,2,8],size:[7,5,10],force:5,phase:0 },
  { type:'checkpoint',position:[0,0,17],radius:1.4 },
  { type:'box',position:[0,-.5,25],size:[4,1,14] },
  { type:'pendulum',position:[0,5,25],length:4,period:3.5,phase:0 },
  { type:'checkpoint',position:[0,0,31],radius:1.4 },
  { type:'box',position:[0,-.2,35],size:[1,.4,6],color:palette.accent },
  { type:'box',position:[0,-.5,43],size:[6,1,10] },
  { type:'checkpoint',position:[0,0,46],radius:1.4 },
  { type:'box',position:[0,-.5,53.75],size:[6,1,8.5] },
  { type:'goal',position:[0,0,56],radius:1.6 },
];
export const level6:Level={id:6,name:'Skyline Sprint',subtitle:'A gust, a hammer, and one last leap.',cargo:'egg',length:56,target:'2 min',start:[0,0,0],killY:-6,pieces};
