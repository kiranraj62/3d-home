# My Home 3D Studio — Review V3.9

A starter **React + Vite + TypeScript + React Three Fiber + Three.js + Drei + Zustand + Tailwind** app for planning a Kerala first-floor extension.

## Run on your Windows PC

Install Node.js 20.19+ or 22.12+, then open this folder in Antigravity, Cursor or VS Code and run:

```bash
npm install
npm run dev
```

Open the local address printed by Vite (usually http://localhost:5173).

To test production compilation: `npm run build`.

## Features included

- Procedural, orbitable 3D massing model with lit walls and floors, staircase steps and roof toggle
- Ground/first/both-floor switching and a top-down 2D conceptual plan
- Room click selection and width/depth editing
- Existing tin-sheet vs proposed extension conceptual mode
- JSON export/import, browser localStorage persistence and reset
- Actual uploaded house photos and hand sketch in the References panel
- Mobile responsive interface

## Current first-floor proposal

- Ground-floor geometry remains unchanged as the reference for the upstairs proposal.
- Existing stair ends at the **front-right** upper area over the car porch: **no bedroom or decorative front window there**.
- The master suite has the **only attached bathroom**, positioned in its rear-right exterior corner. A short concealed rear chase connects it to the proposed vertical pipe drop above ground-floor Bathroom 2.
- The traditional tiled roof remains one continuous trapezium. A separate triangular hip canopy sits over the sit-out and projects farther toward the courtyard. The proposed first-floor top remains a modern concrete flat slab with a clean parapet and charcoal coping.
- The proposed upper exterior follows the supplied modern reference: a deep white rectangular frame, large left picture window, recessed central balcony door, transparent glass balustrade, projecting balcony ledge and recessed soffit lighting.
- The existing stair and landing zone is included in the exterior as a recessed right-side stair tower with a tall framed window. Its concrete roof connects continuously to the main upper roof.
- Rear-left Bedroom 2 has independent access from the family hall. The former front-left bathroom footprint is now part of the hall.
- The floor plan can show dashed outlines of both ground-floor bathrooms and a proposed pipe drop. These are alignment references, not a survey of existing pipes or confirmed connections.
- The stair and its entrance remain unchanged. Ground-floor Bathroom 1 lies beneath the open stair area and is not used for a new upstairs bathroom.
- Run `node scripts/verify-layout.cjs` to check room/furniture containment, door connections, wet-area alignment, stair joins and saved-layout validation.

## Important limitations

The model is a **conceptual massing prototype**, not an as-built reconstruction or construction drawing. Measurements, wall geometry, stairs, plumbing, roof form and building envelope are provisional. Room blocks may overlap because real measurements are not yet known. Wall openings, true roof geometry, photo-based modeling and structural feasibility are future work. Have a licensed architect/structural engineer inspect and measure the house before building.

## Project structure

- `src/store.ts` — shared house layout and Zustand state
- `src/House3D.tsx` — procedural 3D scene
- `src/App.tsx` — controls, 2D plan, room inspector and references
- `src/style.css` — responsive styling with Tailwind directives
- `public/references/` — supplied photos and ground-floor sketch
