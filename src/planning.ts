// Metres; +Z faces the courtyard. Ground-floor geometry remains the reference.
export const landing = { x: 2.7, z: -1.55, w: 0.9, d: 1.05 };
export const hallOutline = [[-1.74,-5.4],[2.25,-5.4],[2.25,0.8],[-1.74,0.8]] as const;
export const masterOutline = [[-5.336,-2.8],[-1.74,-2.8],[-1.74,0.8],[-5.336,0.8]] as const;
export const serviceCore = { x: 0, z: 0, w: 0, d: 0 };
type Rect = { x: number; z: number; w: number; d: number };
export function roomParts(room: Rect & {id: string}): Rect[] {
  return [room];
}
export const roomArea = (room: Rect & {id: string}) => roomParts(room).reduce((area,r)=>area+r.w*r.d,0);
export function overlapArea(a: Rect & {id: string}, b: Rect & {id: string}) {
  return roomParts(a).reduce((sum,p)=>sum+roomParts(b).reduce((n,q)=>n+
    Math.max(0,Math.min(p.x+p.w/2,q.x+q.w/2)-Math.max(p.x-p.w/2,q.x-q.w/2))*
    Math.max(0,Math.min(p.z+p.d/2,q.z+q.d/2)-Math.max(p.z-p.d/2,q.z-q.d/2)),0),0);
}
export const roomLabels: Record<string,[number,number]> = {
  bed1: [-3.538, -1.0],
  closet: [-4.437, -3.8],
  masterbath: [-2.639, -3.8],
  'blank-area': [-3.538, -5.1],
  'front-free-area': [-1.543, 2.384],
  bed2: [3.851, -3.75],
  hall: [.255, -2.3],
};
export const doors = [
  { id: 'master', x: -1.74, z: -0.65, axis: 'z', width: .9 },
  { id: 'closet', x: -4.437, z: -2.8, axis: 'x', width: .8 },
  { id: 'bath', x: -2.639, z: -2.8, axis: 'x', width: .8 },
  { id: 'bed2', x: 2.25, z: -2.75, axis: 'z', width: .9 },
  { id: 'arrival', x: 2.25, z: -1.55, axis: 'z', width: 1.05 },
] as const;
export const furniture = [
  { id: 'bed1', room: 'bed1', label: 'King bed', x: -4.3, z: -0.21, w: 1.8, d: 2, h: .55, color: '#d8c9af', head: 'south' },
  { id: 'nightstand', room: 'bed1', label: 'Nightstand', x: -3.1, z: 0.55, w: .45, d: .45, h: .5, color: '#96755c' },
  { id: 'table1', room: 'bed1', label: 'Console', x: -2.05, z: -1.9, w: .5, d: 1.4, h: .75, color: '#b59a73' },
  { id: 'closet_w1', room: 'closet', label: 'Wardrobe L', x: -5.0, z: -3.8, w: .55, d: 1.7, h: 2.2, color: '#96755c' },
  { id: 'closet_w2', room: 'closet', label: 'Wardrobe R', x: -3.85, z: -4.15, w: .55, d: 1.1, h: 2.2, color: '#96755c' },
  { id: 'shower', room: 'masterbath', label: 'Shower', x: -2.25, z: -4.3, w: .85, d: .8, h: .08, color: '#b8d5d8' },
  { id: 'wc', room: 'masterbath', label: 'WC', x: -3.1, z: -4.3, w: .45, d: .6, h: .45, color: '#f3f4f0' },
  { id: 'basin', room: 'masterbath', label: 'Basin', x: -2.1, z: -3.4, w: .45, d: .5, h: .8, color: '#f3f4f0' },
  { id: 'bed2', room: 'bed2', label: 'Double bed', x: 3.4, z: -4.3, w: 1.6, d: 2, h: .55, color: '#bbcecb' },
  { id: 'wardrobe2', room: 'bed2', label: 'Wardrobe', x: 5.1, z: -3.75, w: .55, d: 1.8, h: 2.2, color: '#96755c' },
  { id: 'desk2', room: 'hall', label: 'Study desk', x: .8, z: -.2, w: 1.2, d: .6, h: .75, color: '#b59a73' },
  { id: 'sofa', room: 'hall', label: 'Sofa', x: -1.2, z: -4.1, w: .85, d: 2.2, h: .7, color: '#8fa99b' },
  { id: 'table', room: 'hall', label: 'Table', x: .1, z: -4.1, w: .75, d: 1.15, h: .4, color: '#b59a73' },
  { id: 'tv', room: 'hall', label: 'TV console', x: 1.95, z: -4.35, w: .35, d: 1.6, h: .5, color: '#96755c' },
] as const;
export const plumbingDrop = { x: 4.756, z: -0.93, groundRoom: 'g-bath1' };
export const upperWalls = [
  [-1.74, -5.4, 2.25, -5.4],
  [2.25, -5.4, 5.452, -5.4],
  [5.452, -5.4, 5.452, -2.1],
  [2.25, -2.1, 5.452, -2.1],
  [2.25, -5.4, 2.25, -2.1],
  [-5.336, -5.4, -1.74, -5.4],
  [-5.336, -5.4, -5.336, -4.8],
  [-1.74, -5.4, -1.74, -4.8],
  [-5.336, -4.8, -1.74, -4.8],
  [-5.336, -4.8, -5.336, -2.8],
  [-1.74, -4.8, -1.74, -2.8],
  [-3.538, -4.8, -3.538, -2.8],
  [-5.336, -2.8, -3.538, -2.8],
  [-3.538, -2.8, -1.74, -2.8],
  [-5.336, -2.8, -5.336, 0.8],
  [-1.74, -2.8, -1.74, 0.8],
  [-5.336, 0.8, -1.74, 0.8],
  [-5.336, 0.8, -5.336, 3.968],
  [-5.336, 3.968, 2.25, 3.968],
  [2.25, -2.1, 2.25, 3.968],
] as const;
