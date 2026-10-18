import { create } from 'zustand';

export type FloorMode = 'both' | 'ground' | 'first';
export type Room = {
  id: string;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  color: string;
  floor: 0 | 1;
  notes?: string;
};
export type Layout = { width: number; depth: number; rooms: Room[] };

export const defaultLayout: Layout = {
  width: 11.6,
  depth: 12.4,
  rooms: [
    // Ground Floor (Zero Overlaps, Aligned Boundaries)
    { id: 'g-kitchen', name: 'Kitchen', x: -3.596, z: -3.782, w: 3.48, d: 3.348, color: '#E8B86C', floor: 0, notes: 'Rear-left kitchen aligned with Bedroom 1' },
    { id: 'g-work', name: 'Work Area', x: -0.464, z: -4.774, w: 2.552, d: 1.364, color: '#D4B28C', floor: 0, notes: 'Rear utility / work area connecting kitchen and hall' },
    { id: 'g-bath2', name: 'Bathroom 2', x: 1.856, z: -4.774, w: 2.088, d: 1.364, color: '#9DB7CB', floor: 0, notes: 'Rear attached bathroom for Bedroom 2' },
    { id: 'g-bed2', name: 'Bedroom 2', x: 4.176, z: -3.534, w: 2.552, d: 4.092, color: '#A5C8A5', floor: 0, notes: 'Rear-right bedroom' },
    { id: 'g-bed1', name: 'Bedroom 1', x: -3.596, z: -0.434, w: 3.48, d: 3.348, color: '#A5C8A5', floor: 0, notes: 'Middle-left bedroom' },
    { id: 'g-hall', name: 'Main Hall', x: 0.58, z: -0.062, w: 4.64, d: 8.06, color: '#B4D5E9', floor: 0, notes: 'Central living and dining hall' },
    { id: 'g-sink', name: 'Sink + Passage', x: 3.48, z: -0.93, w: 1.16, d: 1.116, color: '#C5DCE9', floor: 0, notes: 'Wash basin and passage to common bath' },
    { id: 'g-bath1', name: 'Bathroom 1', x: 4.756, z: -0.93, w: 1.392, d: 1.116, color: '#9DB7CB', floor: 0, notes: 'Ground floor common bathroom' },
    { id: 'g-stairs', name: 'Staircase', x: 4.176, z: 0.372, w: 2.552, d: 1.24, color: '#B3A6CF', floor: 0, notes: 'Stair flight takeoff' },
    { id: 'g-prayer', name: 'Prayer Room', x: -3.596, z: 2.666, w: 3.48, d: 2.604, color: '#D6B4DE', floor: 0, notes: 'Front-left pooja / prayer room' },
    { id: 'g-porch', name: 'Car Porch', x: 4.176, z: 3.41, w: 2.552, d: 4.836, color: '#C6C9CE', floor: 0, notes: 'Front-right covered car porch' },
    { id: 'g-sitout', name: 'Sit-out', x: 0.58, z: 4.96, w: 4.64, d: 1.736, color: '#E9CE9E', floor: 0, notes: 'Front verandah / sit-out' },

    // First floor V4.8: central family hall, retained rear blank strip, and an additional large front free area
    { id: 'bed1', name: 'Master Bedroom', x: -3.538, z: -1.0, w: 3.596, d: 3.6, color: '#8db5ad', floor: 1, notes: '12.9 m² expanded master bedroom with king bed tucked in the bottom-left corner.' },
    { id: 'closet', name: 'Walk-in Closet', x: -4.437, z: -3.8, w: 1.798, d: 2.0, color: '#c4b5a5', floor: 1, notes: '3.6 m² walk-in closet on the rear-left of the master suite.' },
    { id: 'masterbath', name: 'Attached Bath', x: -2.639, z: -3.8, w: 1.798, d: 2.0, color: '#a3c4d2', floor: 1, notes: '3.6 m² attached ensuite bathroom on the rear-right of the master suite.' },
    { id: 'blank-area', name: 'Rear Blank Area', x: -3.538, z: -5.1, w: 3.596, d: 0.6, color: '#dbe4e2', floor: 1, notes: '2.2 m² rear blank strip retained behind the walk-in closet and attached bathroom.' },
    { id: 'front-free-area', name: 'Open / Free Area', x: -1.543, z: 2.384, w: 7.586, d: 3.168, color: '#dbe4e2', floor: 1, notes: '24.0 m² additional open free area across the front of the proposed first floor.' },
    { id: 'bed2', name: 'Bedroom 2', x: 3.851, z: -3.75, w: 3.202, d: 3.3, color: '#b6cbb8', floor: 1, notes: '10.6 m² second bedroom positioned behind the staircase as marked.' },
    { id: 'hall', name: 'Family Hall', x: .255, z: -2.3, w: 3.99, d: 6.2, color: '#e5d2a3', floor: 1, notes: '24.7 m² central family hall connected directly to the fixed stair arrival.' },
    { id: 'stairs', name: 'Fixed Landing', x: 2.7, z: -1.55, w: .9, d: 1.05, color: '#c7cad4', floor: 1, notes: 'Actual top landing of the existing two-flight stair; fixed geometry.' },
  ]
};

type State = {
  layout: Layout;
  mode: FloorMode;
  roof: boolean;
  selected: string | null;
  before: boolean;
  presentation: boolean;
  setPresentation: (value: boolean) => void;
  setMode: (mode: FloorMode) => void;
  setRoof: (v: boolean) => void;
  setBefore: (v: boolean) => void;
  setSelected: (id: string | null) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  restore: () => void;
  importLayout: (l: Layout) => void;
};

const STORAGE_KEY = 'mangalam-review-v23';

export function validateLayout(value: unknown): Layout {
  const p = value as Layout;
  if (!p || !Array.isArray(p.rooms) || p.rooms.length !== defaultLayout.rooms.length ||
      p.width !== defaultLayout.width || p.depth !== defaultLayout.depth) throw new Error('Invalid layout dimensions.');
  // This measured geometry is fixed; import can restore room finishes, not move the house or stair.
  const rooms = defaultLayout.rooms.map((base) => {
    const matches = p.rooms.filter(r => r?.id === base.id);
    if (matches.length !== 1) throw new Error('Missing or duplicate room.');
    const r = matches[0];
    if (['x','z','w','d','floor'].some(k => r[k as keyof Room] !== base[k as keyof Room]))
      throw new Error('This layout changes fixed geometry. Use a V4.8 export.');
    if (!/^#[0-9a-f]{6}$/i.test(r.color)) throw new Error('Invalid finish colour.');
    return {...base, color: base.floor === 0 || base.id === 'stairs' ? base.color : r.color};
  });
  return {...defaultLayout, rooms};
}

function load(): Layout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Keep prior finishes while applying new geometry; retain the old saved layout.
      const previous = JSON.parse(localStorage.getItem('mangalam-review-v22') || localStorage.getItem('mangalam-review-v21') || localStorage.getItem('mangalam-review-v20') || localStorage.getItem('mangalam-review-v19') || localStorage.getItem('mangalam-review-v13') || localStorage.getItem('mangalam-review-v12') || localStorage.getItem('mangalam-review-v11') || localStorage.getItem('mangalam-review-v9') || 'null');
      if (Array.isArray(previous?.rooms)) return {...defaultLayout, rooms: defaultLayout.rooms.map(base => {
        const saved = previous.rooms.find((r: Room) => r.id === base.id);
        return base.floor === 1 && base.id !== 'stairs' && /^#[0-9a-f]{6}$/i.test(saved?.color || '') ? {...base, color:saved.color} : base;
      })};
    }
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p.rooms)) {
        const kitchen = p.rooms.find((r: any) => r.id === 'g-kitchen' || r.id === 'kitchen');
        if (kitchen && kitchen.w > 5) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLayout));
          return defaultLayout;
        }
        return validateLayout(p);
      }
    }
  } catch {}
  return defaultLayout;
}

export const useHouse = create<State>((set) => ({
  layout: load(),
  mode: 'ground',
  roof: true,
  selected: null,
  before: false,
  presentation: true,
  setPresentation: (presentation) => set({presentation}),
  setMode: (mode) => set({ mode }),
  setRoof: (roof) => set({ roof }),
  setBefore: (before) => set({ before }),
  setSelected: (selected) => set({ selected }),
  updateRoom: (id, patch) =>
    set((s) => {
      if (s.presentation || id.startsWith('g-') || id === 'stairs') return s;
      if (!patch.color || !/^#[0-9a-f]{6}$/i.test(patch.color)) return s;
      const layout = {
        ...s.layout,
        rooms: s.layout.rooms.map((r) => (r.id === id ? { ...r, color: patch.color! } : r))
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
      return { layout };
    }),
  restore: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('home-v22-layout');
    set({ layout: defaultLayout, selected: null });
  },
  importLayout: (layout) => {
    layout = validateLayout(layout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    set({ layout, selected: null });
  }
}));
