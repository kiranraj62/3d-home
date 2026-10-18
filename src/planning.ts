// Metres; +Z faces the courtyard. Ground-floor geometry remains the reference.
export const landing = { x: 2.7, z: -1.55, w: 0.9, d: 1.05 };
export const hallOutline = [[-1.74,-2.1],[2.25,-2.1],[2.25,3.968],[-5.336,3.968],[-5.336,-.4],[-1.74,-.4]] as const;
export const masterOutline = [[-1.74,-5.4],[5.452,-5.4],[5.452,-2.1],[-1.74,-2.1]] as const;
// Short concealed chase links the corner ensuite to the existing wet-area stack below.
export const serviceCore = {x:3.007,z:-5.225,w:.714,d:.35};
type Rect = { x: number; z: number; w: number; d: number };
export function roomParts(room: Rect & {id: string}): Rect[] {
  if (room.id === 'bed1') return [
    {x:.455,z:-3.75,w:4.39,d:3.3},
    {x:3.007,z:-3.575,w:.714,d:2.95},
    {x:4.408,z:-2.8,w:2.088,d:1.4},
  ];
  if (room.id === 'hall') return [
    {x:.255,z:-1.25,w:3.99,d:1.7},
    {x:-1.543,z:1.784,w:7.586,d:4.368},
  ];
  return [room];
}
export const roomArea = (room: Rect & {id: string}) => roomParts(room).reduce((area,r)=>area+r.w*r.d,0);
export function overlapArea(a: Rect & {id: string}, b: Rect & {id: string}) {
  return roomParts(a).reduce((sum,p)=>sum+roomParts(b).reduce((n,q)=>n+
    Math.max(0,Math.min(p.x+p.w/2,q.x+q.w/2)-Math.max(p.x-p.w/2,q.x-q.w/2))*
    Math.max(0,Math.min(p.z+p.d/2,q.z+q.d/2)-Math.max(p.z-p.d/2,q.z-q.d/2)),0),0);
}
export const roomLabels: Record<string,[number,number]> = {
  bed1:[1.25,-2.42], bed2:[-3.538,-.95], masterbath:[4.408,-4.08], hall:[-1.4,.3],
};
export const doors = [
  {id:'master',x:0,z:-2.1,axis:'x',width:.9},
  {id:'bed2',x:-1.74,z:-1.55,axis:'z',width:.9},
  {id:'bath',x:3.85,z:-3.5,axis:'x',width:.8},
  {id:'arrival',x:2.25,z:-1.55,axis:'z',width:1.05},
] as const;
export const furniture = [
  {id:'bed1',room:'bed1',label:'King bed',x:1.55,z:-3.75,w:1.6,d:2,h:.55,color:'#d8c9af'},
  {id:'wardrobe1',room:'bed1',label:'Dressing',x:-1.33,z:-3.75,w:.6,d:2,h:2.2,color:'#96755c'},
  {id:'bed2',room:'bed2',label:'Double bed',x:-3.4,z:-3.8,w:1.5,d:2,h:.55,color:'#bbcecb'},
  {id:'wardrobe2',room:'bed2',label:'Wardrobe',x:-4.93,z:-1.7,w:.6,d:1.7,h:2.2,color:'#96755c'},
  {id:'sofa',room:'hall',label:'Sofa',x:-3.8,z:2.4,w:.85,d:2.2,h:.7,color:'#8fa99b'},
  {id:'table',room:'hall',label:'Table',x:-2.2,z:2.4,w:.75,d:1.15,h:.4,color:'#b59a73'},
  {id:'tv',room:'hall',label:'TV console',x:1.95,z:2.4,w:.35,d:1.6,h:.5,color:'#96755c'},
  {id:'shower',room:'masterbath',label:'Shower',x:3.87,z:-4.82,w:.75,d:.85,h:.08,color:'#b8d5d8'},
  {id:'wc',room:'masterbath',label:'WC',x:4.84,z:-4.82,w:.45,d:.6,h:.45,color:'#f3f4f0'},
  {id:'basin',room:'masterbath',label:'Basin',x:4.88,z:-3.82,w:.45,d:.4,h:.8,color:'#f3f4f0'},
] as const;
// Drop remains above the ground-floor bathroom; the rear chase connects it to the corner ensuite.
export const plumbingDrop = {x:2.75,z:-5.225,groundRoom:'g-bath2'};
export const upperWalls = [
  [-5.336,-5.4,5.452,-5.4],[-5.336,-5.4,-5.336,3.968],
  [-1.74,-5.4,-1.74,-.4],[-5.336,-.4,-1.74,-.4],
  [5.452,-5.4,5.452,-2.1],[-1.74,-2.1,5.452,-2.1],
  [3.364,-5.4,3.364,-3.5],[3.364,-3.5,5.452,-3.5],
  [2.65,-5.4,2.65,-5.05],[2.65,-5.05,3.364,-5.05],
  [-5.336,3.968,2.25,3.968],[2.25,-2.1,2.25,3.968],
] as const;
