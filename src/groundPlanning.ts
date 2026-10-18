export type GroundDoor = {
  id: string;
  x: number;
  z: number;
  axis: 'x' | 'z';
  width: number;
  open?: boolean;
};

export type GroundFurniture = {
  id: string;
  room: string;
  kind: 'bed' | 'wardrobe' | 'counter' | 'fixture' | 'sofa' | 'table' | 'console' | 'altar' | 'bench' | 'car';
  x: number;
  z: number;
  w: number;
  d: number;
  color: string;
  head?: 'north' | 'south';
};

export const groundRoomLabels: Record<string, [number, number]> = {
  'g-kitchen': [-3.55, -3.35],
  'g-work': [-.46, -4.48],
  'g-bath2': [1.86, -4.48],
  'g-bed2': [4.18, -2.95],
  'g-bed1': [-3.6, -.15],
  'g-hall': [.58, -.75],
  'g-sink': [3.48, -1.15],
  'g-bath1': [4.76, -1.15],
  'g-stairs': [4.18, .65],
  'g-prayer': [-3.6, 2.45],
  'g-porch': [4.18, 4.65],
  'g-sitout': [.58, 4.72],
};

export const groundRoomDisplayNames: Record<string, string> = {
  'g-bath2': 'Bath 2',
  'g-sink': 'Sink / Passage',
  'g-bath1': 'Bath 1',
  'g-stairs': 'Stair',
};

export const groundDoors: GroundDoor[] = [
  { id: 'g-kitchen-door', x: -1.798, z: -3.0, axis: 'z', width: .9 },
  { id: 'g-work-door', x: -1.798, z: -4.75, axis: 'z', width: .8 },
  { id: 'g-bath2-door', x: 2.9, z: -4.8, axis: 'z', width: .72 },
  { id: 'g-bed2-door', x: 2.9, z: -2.65, axis: 'z', width: .9 },
  { id: 'g-bed1-door', x: -1.798, z: -.45, axis: 'z', width: .9 },
  { id: 'g-prayer-door', x: -1.798, z: 2.55, axis: 'z', width: .8 },
  { id: 'g-sink-opening', x: 2.9, z: -.93, axis: 'z', width: .82, open: true },
  { id: 'g-bath1-door', x: 4.06, z: -.93, axis: 'z', width: .7 },
  { id: 'g-stair-opening', x: 2.9, z: .42, axis: 'z', width: 1.0, open: true },
  { id: 'g-main-entry', x: -1.2, z: 4.03, axis: 'x', width: 1.0 },
];

export const groundFurniture: GroundFurniture[] = [
  { id: 'g-kitchen-counter', room: 'g-kitchen', kind: 'counter', x: -4.95, z: -3.78, w: .5, d: 2.6, color: '#a77b50' },
  { id: 'g-kitchen-island', room: 'g-kitchen', kind: 'counter', x: -3.2, z: -4.75, w: 1.6, d: .55, color: '#c39b6d' },
  { id: 'g-work-counter', room: 'g-work', kind: 'counter', x: -.46, z: -5.15, w: 2.0, d: .45, color: '#a77b50' },
  { id: 'g-bath2-wc', room: 'g-bath2', kind: 'fixture', x: 1.25, z: -4.75, w: .4, d: .6, color: '#f4f6f3' },
  { id: 'g-bath2-shower', room: 'g-bath2', kind: 'fixture', x: 2.35, z: -4.75, w: .7, d: .8, color: '#b8d5d8' },
  { id: 'g-bed2-bed', room: 'g-bed2', kind: 'bed', x: 4.0, z: -4.25, w: 1.6, d: 2.1, color: '#c4d2c7', head: 'south' },
  { id: 'g-bed2-wardrobe', room: 'g-bed2', kind: 'wardrobe', x: 5.1, z: -2.2, w: .5, d: 1.1, color: '#96755c' },
  { id: 'g-bed1-bed', room: 'g-bed1', kind: 'bed', x: -3.8, z: -.7, w: 1.6, d: 2.0, color: '#c4d2c7', head: 'south' },
  { id: 'g-bed1-wardrobe', room: 'g-bed1', kind: 'wardrobe', x: -5.0, z: .6, w: .5, d: 1.0, color: '#96755c' },
  { id: 'g-hall-sofa', room: 'g-hall', kind: 'sofa', x: -.6, z: 1.35, w: 1.8, d: .75, color: '#8fa99b' },
  { id: 'g-hall-table', room: 'g-hall', kind: 'table', x: -.6, z: .25, w: 1.0, d: .6, color: '#b59a73' },
  { id: 'g-hall-tv', room: 'g-hall', kind: 'console', x: 2.58, z: 1.35, w: .4, d: 1.6, color: '#96755c' },
  { id: 'g-dining-table', room: 'g-hall', kind: 'table', x: .5, z: -2.6, w: 1.4, d: .8, color: '#b59a73' },
  { id: 'g-sink-basin', room: 'g-sink', kind: 'fixture', x: 3.42, z: -.93, w: .55, d: .5, color: '#f4f6f3' },
  { id: 'g-bath1-wc', room: 'g-bath1', kind: 'fixture', x: 4.45, z: -.93, w: .4, d: .6, color: '#f4f6f3' },
  { id: 'g-bath1-shower', room: 'g-bath1', kind: 'fixture', x: 5.05, z: -.93, w: .65, d: .8, color: '#b8d5d8' },
  { id: 'g-prayer-altar', room: 'g-prayer', kind: 'altar', x: -3.6, z: 3.55, w: 1.7, d: .45, color: '#9b6b47' },
  { id: 'g-sitout-bench', room: 'g-sitout', kind: 'bench', x: .58, z: 5.35, w: 2.7, d: .45, color: '#8b5e3c' },
  { id: 'g-porch-car', room: 'g-porch', kind: 'car', x: 4.18, z: 3.45, w: 1.8, d: 3.6, color: '#b9c7d2' },
];
