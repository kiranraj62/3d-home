import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Grid, Environment, ContactShadows, Edges, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useHouse, type Room } from './store';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { UpperInterior } from './UpperFloor';
import { lowerSteps, upperSteps, middleLanding, topLanding } from './stairGeometry';

export type ViewPreset = 'isometric' | 'front' | 'top';

// Realistic Kerala architectural color palette (matched to actual exterior reference photos)
const PALETTE = {
  wallSalmon: '#c9786f', // Muted coral-pink exterior wall paint from the reference facade
  wallTrim: '#f0dfd2', // Light carved trim under the veranda eave
  wallInterior: '#f4ede6', // Warm off-white interior room walls
  wallAccent: '#c76e5f',
  plinthStone: '#3d3733', // Dark granite / rubble stone foundation plinth
  woodTeak: '#6b3b1e', // Polished teak wood (Charupadi, doors, window frames)
  woodCarved: '#854b28',
  brassStud: '#facc15', // Gold / brass studs on Charupadi
  roofClay: '#b24a2f', // Mangalore terracotta roof tiles
  roofRidge: '#88311b', // Terracotta ridge tiles
  eaveWhite: '#fdfdfd', // Decorative carved white wooden eave frills / bargeboard
  pillarStone: '#6e6359', // Smooth round masonry pillars
  glass: '#cbd5e1', // Window glass
  paverRed: '#9e3d2f', // Interlocking courtyard pavers
  paverCharcoal: '#444240',
  paverCream: '#ddd4c7',
  foliageGreen: '#2d6a4f',
  foliageBright: '#40916c',
  potClay: '#c85a32',
  stairWood: '#966e4a',
  stairRiser: '#f1f1f1',
  metalRailing: '#94a3b8'
};

/**
 * Procedural Hip Roof BufferGeometry with correct outward-facing normals.
 */
function createHipRoofGeometry(
  w: number,
  d: number,
  ridgeW: number,
  height: number,
  overhang: number,
  ridgeOffsetZ: number = 0
) {
  const geom = new THREE.BufferGeometry();
  const halfW = w / 2 + overhang;
  const halfD = d / 2 + overhang;
  const halfRidge = ridgeW / 2;
  const rZ = ridgeOffsetZ;

  let positions: Float32Array;

  if (ridgeW <= 0.001) {
    // Pure triangular pyramid / hip canopy (4 clean triangular faces meeting at apex point [0, height, rZ])
    positions = new Float32Array([
      // Front triangle (facing +Z, +Y) -> perfectly triangular front elevation
      0, height, rZ,
      -halfW, 0, halfD,
      halfW, 0, halfD,

      // Back triangle (facing -Z, +Y)
      0, height, rZ,
      halfW, 0, -halfD,
      -halfW, 0, -halfD,

      // Left triangle (facing -X, +Y)
      0, height, rZ,
      -halfW, 0, -halfD,
      -halfW, 0, halfD,

      // Right triangle (facing +X, +Y)
      0, height, rZ,
      halfW, 0, halfD,
      halfW, 0, -halfD
    ]);
  } else {
    positions = new Float32Array([
      // Front quad (facing +Z, +Y)
      -halfRidge, height, rZ,
      -halfW, 0, halfD,
      halfW, 0, halfD,

      -halfRidge, height, rZ,
      halfW, 0, halfD,
      halfRidge, height, rZ,

      // Back quad (facing -Z, +Y)
      halfRidge, height, rZ,
      halfW, 0, -halfD,
      -halfW, 0, -halfD,

      halfRidge, height, rZ,
      -halfW, 0, -halfD,
      -halfRidge, height, rZ,

      // Left triangle (facing -X, +Y)
      -halfRidge, height, rZ,
      -halfW, 0, -halfD,
      -halfW, 0, halfD,

      // Right triangle (facing +X, +Y)
      halfRidge, height, rZ,
      halfW, 0, halfD,
      halfW, 0, -halfD
    ]);
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.computeVertexNormals();
  return geom;
}

/**
 * Traditional Kerala Pitch / Hip Roof with Mangalore Clay Tiles,
 * Decorative Blue/White Gable Vent (Mukhappu), Brass Finial, and Carved White Eave Frills.
 */
/**
 * Roof: Only the front triangle (sit-out canopy) and back trapezium (front section hip)
 * are tiled roof design. The rest of the roof extending up to the back of the house is plain concrete.
 */
function KeralaRoof({ ghost = false }: { isUpper?: boolean; ghost?: boolean }) {
  const frontTrapeziumGeom = useMemo(() => {
    // Continuous tiled hip across the front porch/verandah (the "back trapezium")
    return createHipRoofGeometry(10.9, 3.2, 6.1, 1.08, 0.55, 0.1);
  }, []);
  const sitoutTriangleGeom = useMemo(() => {
    // Forward-projecting triangular hip canopy above the sit-out (the "front triangle")
    return createHipRoofGeometry(5.25, 2.50, 0, 1.12, .45, 0.0);
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Plain Flat Concrete Roof extending from the front trapezium all the way up to the back */}
      <group position={[0.058, 0, 0]}>
        {/* Concrete Roof Slab */}
        <mesh position={[0, 3.20, -1.615]} castShadow receiveShadow>
          <boxGeometry args={[10.88, 0.18, 7.95]} />
          <meshStandardMaterial color="#dedcd6" roughness={0.88} />
        </mesh>

        {/* Clean parapet walls along exposed roof perimeter (shown when ground/before floor is active) */}
        {!ghost && (
          <group>
            {/* Rear parapet wall at the very back */}
            <mesh position={[0, 3.65, -5.58]} castShadow receiveShadow>
              <boxGeometry args={[10.88, 0.72, 0.16]} />
              <meshStandardMaterial color="#eceae4" roughness={0.72} />
            </mesh>
            <mesh position={[0, 4.04, -5.58]} castShadow>
              <boxGeometry args={[10.94, 0.06, 0.22]} />
              <meshStandardMaterial color="#35434a" roughness={0.42} />
            </mesh>

            {/* Left parapet wall */}
            <mesh position={[-5.36, 3.65, -1.615]} castShadow receiveShadow>
              <boxGeometry args={[0.16, 0.72, 7.93]} />
              <meshStandardMaterial color="#eceae4" roughness={0.72} />
            </mesh>
            <mesh position={[-5.36, 4.04, -1.615]} castShadow>
              <boxGeometry args={[0.22, 0.06, 7.99]} />
              <meshStandardMaterial color="#35434a" roughness={0.42} />
            </mesh>

            {/* Right parapet wall (from back wall to staircase/car porch zone) */}
            <mesh position={[5.36, 3.65, -2.294]} castShadow receiveShadow>
              <boxGeometry args={[0.16, 0.72, 6.57]} />
              <meshStandardMaterial color="#eceae4" roughness={0.72} />
            </mesh>
            <mesh position={[5.36, 4.04, -2.294]} castShadow>
              <boxGeometry args={[0.22, 0.06, 6.63]} />
              <meshStandardMaterial color="#35434a" roughness={0.42} />
            </mesh>
          </group>
        )}
      </group>

      {/* Tiled Roof Design: Only the Front Triangle and Back Trapezium */}
      <group position={[0, 3.35, 4.45]}>
        {/* 1. Back Trapezium: Continuous tiled hip roof across the front section */}
        <mesh position={[.058, 0, 0]} geometry={frontTrapeziumGeom} castShadow receiveShadow>
          <meshStandardMaterial
            color={PALETTE.roofClay}
            roughness={0.72}
            metalness={0.08}
          />
        </mesh>
        <mesh position={[.058, 1.11, .1]} castShadow>
          <boxGeometry args={[6.2, .1, .24]} />
          <meshStandardMaterial color={PALETTE.roofRidge} roughness={0.6} />
        </mesh>
        <mesh position={[.058, -.04, 2.25]}>
          <boxGeometry args={[12.0, .12, .05]} />
          <meshStandardMaterial color={PALETTE.eaveWhite} />
        </mesh>
        <mesh position={[.058, 1.29, .1]} castShadow>
          <coneGeometry args={[0.07, 0.22, 12]} />
          <meshStandardMaterial color="#eab308" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* 2. Front Triangle: Forward-projecting pure triangular sit-out canopy */}
        <mesh position={[.58, -.12, 1.25]} geometry={sitoutTriangleGeom} castShadow receiveShadow>
          <meshStandardMaterial color={PALETTE.roofClay} roughness={.72} metalness={.08} />
        </mesh>
        {/* Front horizontal carved eave */}
        <mesh position={[.58, -.17, 2.95]} castShadow>
          <boxGeometry args={[6.15, .11, .05]} />
          <meshStandardMaterial color={PALETTE.eaveWhite} roughness={.42} />
        </mesh>
        {/* Side eave returns */}
        <mesh position={[.58 - 3.05, -.17, 2.60]} castShadow>
          <boxGeometry args={[0.05, .11, 0.72]} />
          <meshStandardMaterial color={PALETTE.eaveWhite} roughness={.42} />
        </mesh>
        <mesh position={[.58 + 3.05, -.17, 2.60]} castShadow>
          <boxGeometry args={[0.05, .11, 0.72]} />
          <meshStandardMaterial color={PALETTE.eaveWhite} roughness={.42} />
        </mesh>
        {/* Triangular apex ridge cap */}
        <mesh position={[.58, 1.01, 1.25]} castShadow>
          <coneGeometry args={[0.13, 0.12, 4]} />
          <meshStandardMaterial color={PALETTE.roofRidge} roughness={.6} />
        </mesh>
        {/* Brass / gold Thazhikakkuda finial at peak of the triangle */}
        <mesh position={[.58, 1.16, 1.25]} castShadow>
          <coneGeometry args={[0.06, 0.20, 12]} />
          <meshStandardMaterial color="#eab308" metalness={.85} roughness={.25} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Modern flat roof for the proposed first floor. The stepped slab follows the
 * actual upper-floor footprint; crisp white parapets and charcoal coping keep
 * the addition contemporary without changing the traditional porch roof below.
 */
function ModernUpperRoof() {
  const slabs = [
    {x:.058,z:-3.75,w:11.148,d:3.66},
    {x:.255,z:-1.25,w:4.35,d:2.06},
    {x:-1.543,z:1.784,w:7.946,d:4.728},
    // Roof extension above the existing stair and landing zone.
    {x:3.851,z:-.554,w:3.562,d:3.452},
  ];
  const edges = [
    {x:.058,z:-5.4,w:10.788,d:.16},
    {x:5.452,z:-2.204,w:.16,d:6.392},
    {x:3.851,z:.992,w:3.202,d:.16},
    {x:2.25,z:2.48,w:.16,d:2.976},
    {x:-1.543,z:3.968,w:7.586,d:.16},
    {x:-5.336,z:-.716,w:.16,d:9.368},
  ];
  return <group>
    {slabs.map((s,i)=><mesh key={`modern-slab-${i}`} position={[s.x,6.24,s.z]} castShadow receiveShadow>
      <boxGeometry args={[s.w,.18,s.d]}/>
      <meshStandardMaterial color="#eceae4" roughness={.62}/>
    </mesh>)}
    {edges.map((e,i)=><group key={`modern-edge-${i}`}>
      <mesh position={[e.x,6.68,e.z]} castShadow receiveShadow>
        <boxGeometry args={[e.w,.78,e.d]}/>
        <meshStandardMaterial color="#f1eee8" roughness={.68}/>
      </mesh>
      <mesh position={[e.x,7.09,e.z]} castShadow>
        <boxGeometry args={[e.w+.05,.07,e.d+.05]}/>
        <meshStandardMaterial color="#35434a" roughness={.42} metalness={.12}/>
      </mesh>
    </group>)}
    {/* A restrained rear accent frame makes the new roofline read as modern. */}
    <mesh position={[3.9,6.42,-5.53]} castShadow>
      <boxGeometry args={[3.0,.22,.18]}/>
      <meshStandardMaterial color="#35434a" roughness={.42}/>
    </mesh>
  </group>;
}

/** Modern upper-floor street facade based on the supplied exterior reference. */
function ModernUpperFacade() {
  const frameColor = '#f2f0ea';
  const frameDark = '#27343a';
  const frontZ = 4.08;
  return <group>
    {/* Deep rectangular outer frame and recessed soffit. */}
    <mesh position={[-1.543,6.18,4.2]} castShadow receiveShadow>
      <boxGeometry args={[7.95,.42,.55]}/>
      <meshStandardMaterial color={frameColor} roughness={.58}/>
    </mesh>
    {[-5.2,2.11].map(x=><mesh key={x} position={[x,4.75,4.12]} castShadow receiveShadow>
      <boxGeometry args={[.38,2.95,.44]}/>
      <meshStandardMaterial color={frameColor} roughness={.62}/>
    </mesh>)}
    <mesh position={[-2.3,4.95,4.1]} castShadow>
      <boxGeometry args={[.3,2.3,.34]}/>
      <meshStandardMaterial color={frameColor} roughness={.62}/>
    </mesh>

    {/* Large left picture window with a slim charcoal frame. */}
    <mesh position={[-3.72,5.03,frontZ+.06]} castShadow>
      <boxGeometry args={[2.25,1.72,.09]}/>
      <meshPhysicalMaterial color="#76939a" transmission={.25} transparent opacity={.68} roughness={.16} metalness={.08}/>
    </mesh>
    {[[-3.72,5.91,2.42,.09],[-3.72,4.15,2.42,.09],[-4.88,5.03,.09,1.85],[-2.56,5.03,.09,1.85]].map(([x,y,w,h],i)=><mesh key={`window-frame-${i}`} position={[x,y,frontZ+.13]}>
      <boxGeometry args={[w,h,.1]}/><meshStandardMaterial color={frameDark} roughness={.36}/>
    </mesh>)}

    {/* Recessed balcony door with horizontal modern panels. */}
    <mesh position={[-1.28,4.98,frontZ+.08]} castShadow>
      <boxGeometry args={[.94,2.0,.1]}/><meshStandardMaterial color="#50392b" roughness={.42}/>
    </mesh>
    {[-.45,0,.45].map(dy=><mesh key={dy} position={[-1.28,4.98+dy,frontZ+.15]}>
      <boxGeometry args={[.78,.045,.035]}/><meshStandardMaterial color="#a9907a" roughness={.45}/>
    </mesh>)}

    {/* Projecting balcony ledge and transparent glass balustrade. */}
    <mesh position={[-.05,4.28,4.47]} castShadow receiveShadow>
      <boxGeometry args={[4.45,.18,1.0]}/><meshStandardMaterial color="#e7e4de" roughness={.62}/>
    </mesh>
    {[-1.7,-.8,.1,1.0,1.85].map((x,i)=><group key={`rail-${i}`}>
      {i<4 && <mesh position={[(x+[-.8,.1,1.0,1.85][i])/2,4.79,4.94]}>
        <boxGeometry args={[.86,.86,.045]}/>
        <meshPhysicalMaterial color="#b8d4d8" transmission={.35} transparent opacity={.42} roughness={.12}/>
      </mesh>}
      <mesh position={[x,4.79,4.96]}><boxGeometry args={[.035,.93,.055]}/><meshStandardMaterial color="#78888c" metalness={.55} roughness={.24}/></mesh>
    </group>)}
    <mesh position={[-.05,5.27,4.96]}>
      <boxGeometry args={[4.45,.055,.07]}/><meshStandardMaterial color="#78888c" metalness={.55} roughness={.24}/>
    </mesh>

    {/* Small recessed soffit lights along the upper frame. */}
    {[-4.55,-3.25,-1.95,-.65,.65,1.75].map(x=><mesh key={`soffit-${x}`} position={[x,5.94,4.48]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.055,.055,.025,16]}/>
      <meshStandardMaterial color="#fff4c2" emissive="#ffd76b" emissiveIntensity={2.2}/>
    </mesh>)}

  </group>;
}

/**
 * Existing Stair Tower Room on First Floor (marked in red on actual reference photograph).
 * Present in the existing home above the car porch:
 * - Solid salmon-pink exterior walls matching the ground-floor paint.
 * - Solid front wall with authentic white PVC rainwater downpipe as in reference.
 * - Concrete roof slab and parapets over the stair head.
 */
function ExistingStairTower({ isExtensionActive = false }: { isExtensionActive?: boolean }) {
  const towerColor = PALETTE.wallSalmon;
  const towerW = 3.202;
  const towerD = 3.11;
  const centerX = 3.851;
  const centerZ = -0.545;
  const wallH = 2.95;
  const wallY = 4.675;

  return (
    <group>
      {/* 1. Solid Salmon-Pink Front Wall (facing the front above car porch) */}
      <mesh position={[centerX, wallY, 1.01]} castShadow receiveShadow>
        <boxGeometry args={[towerW, wallH, 0.18]} />
        <meshStandardMaterial color={towerColor} roughness={0.78} />
      </mesh>

      {/* 2. Solid Salmon-Pink Right Exterior Wall */}
      <mesh position={[5.36, wallY, centerZ]} castShadow receiveShadow>
        <boxGeometry args={[0.18, wallH, towerD]} />
        <meshStandardMaterial color={towerColor} roughness={0.78} />
      </mesh>

      {/* 3. Rear Wall of Stair Room */}
      <mesh position={[centerX, wallY, -2.10]} castShadow receiveShadow>
        <boxGeometry args={[towerW, wallH, 0.18]} />
        <meshStandardMaterial color={towerColor} roughness={0.78} />
      </mesh>

      {/* 4. Left Wall of Stair Room */}
      {!isExtensionActive ? (
        <mesh position={[2.25, wallY, centerZ]} castShadow receiveShadow>
          <boxGeometry args={[0.18, wallH, towerD]} />
          <meshStandardMaterial color={towerColor} roughness={0.78} />
        </mesh>
      ) : (
        <group position={[2.25, wallY, centerZ]}>
          <mesh position={[0, 0, -1.0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, wallH, 1.1]} />
            <meshStandardMaterial color={towerColor} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0, 1.0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, wallH, 1.1]} />
            <meshStandardMaterial color={towerColor} roughness={0.78} />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, 0.85, 0.91]} />
            <meshStandardMaterial color={towerColor} roughness={0.78} />
          </mesh>
        </group>
      )}

      {/* 5. Authentic White PVC Rainwater Downpipe (as visible inside the red box in the photo) */}
      <group position={[4.88, 4.75, 1.14]}>
        {/* Vertical Pipe */}
        <mesh castShadow>
          <cylinderGeometry args={[0.042, 0.042, 2.7, 12]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.35} />
        </mesh>
        {/* Upper 45-degree Eave Elbow */}
        <mesh position={[-0.1, 1.42, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <cylinderGeometry args={[0.042, 0.042, 0.32, 12]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.35} />
        </mesh>
        {/* Pipe Brackets attaching to the salmon wall */}
        {[-0.8, 0.2, 1.1].map((py, idx) => (
          <mesh key={`bracket-${idx}`} position={[0, py, -0.04]}>
            <boxGeometry args={[0.12, 0.03, 0.06]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* 6. Roof Slab and Parapets over the Existing Stair Tower */}
      {!isExtensionActive && (
        <group>
          {/* Concrete Roof Slab */}
          <mesh position={[centerX, 6.24, centerZ]} castShadow receiveShadow>
            <boxGeometry args={[3.45, 0.18, 3.35]} />
            <meshStandardMaterial color="#dedcd6" roughness={0.85} />
          </mesh>
          {/* Parapet Walls */}
          {[
            { x: centerX, z: 1.03, w: 3.45, d: 0.16 },
            { x: centerX, z: -2.12, w: 3.45, d: 0.16 },
            { x: 5.42, z: centerZ, w: 0.16, d: 3.19 },
            { x: 2.25, z: centerZ, w: 0.16, d: 3.19 },
          ].map((p, idx) => (
            <group key={`stair-roof-edge-${idx}`}>
              <mesh position={[p.x, 6.68, p.z]} castShadow receiveShadow>
                <boxGeometry args={[p.w, 0.72, p.d]} />
                <meshStandardMaterial color="#eceae4" roughness={0.72} />
              </mesh>
              <mesh position={[p.x, 7.07, p.z]} castShadow>
                <boxGeometry args={[p.w + 0.05, 0.06, p.d + 0.05]} />
                <meshStandardMaterial color="#35434a" roughness={0.42} />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}

/**
 * Authentic Kerala Sit-out with Charupadi (Built-in Wooden Bench Railing),
 * Round Masonry Pillars, Carved Teak Double Doors, and Glazed Windows.
 */
function TimberWindow({width=1.35,height=1.35}:{width?:number;height?:number}) {
  return <group>
    <mesh position={[0,0,.08]}><planeGeometry args={[width-.13,height-.13]}/><meshStandardMaterial color="#203d36" roughness={.2} metalness={.35}/></mesh>
    {[-1,1].map(sign=><group key={sign}>
      <mesh position={[sign*(width/2-.04),0,.1]} castShadow><boxGeometry args={[.08,height,.1]}/><meshStandardMaterial color={PALETTE.woodTeak}/></mesh>
      <mesh position={[0,sign*(height/2-.04),.1]} castShadow><boxGeometry args={[width,.08,.1]}/><meshStandardMaterial color={PALETTE.woodTeak}/></mesh>
    </group>)}
    {[-width/6,width/6].map(x=><mesh key={x} position={[x,0,.13]} castShadow><boxGeometry args={[.045,height-.1,.06]}/><meshStandardMaterial color={PALETTE.woodTeak}/></mesh>)}
    <mesh position={[0,height*.22,.12]}><boxGeometry args={[width-.1,.035,.05]}/><meshStandardMaterial color={PALETTE.woodTeak}/></mesh>
    {[-width/3,0,width/3].map(x=><mesh key={x} position={[x,height*.05,.145]} rotation={[0,0,-.2]}><planeGeometry args={[.025,height*.55]}/><meshBasicMaterial color="#a9c8b9" transparent opacity={.35}/></mesh>)}
  </group>;
}

function SitoutDetails() {
  const sitoutZ = 4.96;
  const sitoutX = 0.58;
  const sitoutW = 4.64;
  const sitoutD = 1.74;

  return (
    <group position={[sitoutX, 0.1, sitoutZ]}>
      {/* 1. Solid Main House Front Facade Wall (Separating Sit-out from Main Hall) */}
      <mesh position={[0, 1.48, -sitoutD / 2]} castShadow receiveShadow>
        <boxGeometry args={[sitoutW, 2.95, 0.2]} />
        <meshStandardMaterial color={PALETTE.wallSalmon} roughness={0.78} />
      </mesh>

      {/* Ground-floor facade band and carved veranda valance (roof geometry remains unchanged) */}
      <mesh position={[0, 2.76, -sitoutD / 2 + 0.1]} castShadow>
        <boxGeometry args={[sitoutW + 0.18, 0.16, 0.24]} />
        <meshStandardMaterial color={PALETTE.wallTrim} roughness={0.5} />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => {
        const x = -sitoutW / 2 + 0.18 + i * ((sitoutW - 0.36) / 12);
        return (
          <mesh key={`lace-${i}`} position={[x, 2.61, -sitoutD / 2 + 0.08]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.12, 0.12, 0.04]} />
            <meshStandardMaterial color={PALETTE.wallTrim} roughness={0.48} />
          </mesh>
        );
      })}

      {/* 2. Solid Front Exterior Wall of Prayer Room (to the left of Sit-out) */}
      <group position={[-4.176, 0, -sitoutD / 2]}>
        <mesh position={[0, 1.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.48, 2.95, 0.2]} />
          <meshStandardMaterial color={PALETTE.wallSalmon} roughness={0.78} />
        </mesh>
        {/* Authentic 3-Panel Teak Glazed Window with Sunshade (matching reference photo) */}
        <group position={[0, 1.4, 0.11]}>
          <TimberWindow />
          {/* Concrete / Stone Sunshade (Chajja) Ledge above Window */}
          <mesh position={[0, 0.74, 0.14]} castShadow>
            <boxGeometry args={[1.55, 0.08, 0.32]} />
            <meshStandardMaterial color={PALETTE.wallSalmon} roughness={0.75} />
          </mesh>
        </group>
      </group>

      {/* 3. Solid Side Exterior Wall separating Car Porch from Main Hall & Sit-out - Extended & Filled flush to ceiling and back wall */}
      <mesh position={[sitoutW / 2 + 0.1, 1.55, -2.42]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 3.1, 3.14]} />
        <meshStandardMaterial color={PALETTE.wallSalmon} roughness={0.78} />
      </mesh>
      {/* Flush Corner Infill Block sealing the junction with the staircase back wall */}
      <mesh position={[sitoutW / 2 + 0.1, 1.55, -3.94]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 3.1, 0.26]} />
        <meshStandardMaterial color={PALETTE.wallSalmon} roughness={0.78} />
      </mesh>

      {/* Front Entrance Wooden Double Door (Teak Wood with Brass Handle) */}
      <group position={[0, 1.15, -sitoutD / 2 + 0.11]}>
        {/* Outer Door Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.34, 2.15, 0.14]} />
          <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.4} />
        </mesh>
        {/* Left & Right Door Panels with traditional carvings */}
        <mesh position={[-0.31, 0, 0.09]}>
          <boxGeometry args={[0.56, 1.95, 0.04]} />
          <meshStandardMaterial color="#4a2512" roughness={0.5} />
        </mesh>
        <mesh position={[0.31, 0, 0.09]}>
          <boxGeometry args={[0.56, 1.95, 0.04]} />
          <meshStandardMaterial color="#4a2512" roughness={0.5} />
        </mesh>
        {/* Brass Center Handle Plate */}
        <mesh position={[0, 0, 0.13]}>
          <boxGeometry args={[0.04, 0.26, 0.03]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Traditional 3-Panel Glazed Windows on Both Sides of Front Door */}
      {[-1.65, 1.65].map((xPos, idx) => (
        <group key={`win-${idx}`} position={[xPos, 1.35, -sitoutD / 2 + 0.11]}>
          <TimberWindow width={1.15}/>
        </group>
      ))}

      {/* Traditional Kerala Charupadi (Built-in Wooden Bench Parapet around Sit-out) */}
      <group position={[0, 0, 0]}>
        {/* Front Bench Base */}
        <mesh position={[0, 0.35, 0.46]} castShadow receiveShadow>
          <boxGeometry args={[sitoutW - 0.2, 0.12, 0.3]} />
          <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.4} />
        </mesh>
        {/* Sloped Backrest (Charupadi profile) */}
        <mesh position={[0, 0.65, 0.50]} rotation={[-0.18, 0, 0]} castShadow>
          <boxGeometry args={[sitoutW - 0.2, 0.15, 0.1]} />
          <meshStandardMaterial color={PALETTE.woodCarved} roughness={0.45} />
        </mesh>
        {/* Turned Wooden Balusters under the Bench */}
        {Array.from({ length: 11 }, (_, i) => {
          const bx = -sitoutW / 2 + 0.35 + i * 0.4;
          return (
            <mesh key={`b-${i}`} position={[bx, 0.2, 0.46]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.28, 8]} />
              <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.5} />
            </mesh>
          );
        })}
        {/* Decorative Brass Bosses / Studs on Charupadi Face */}
        {Array.from({ length: 9 }, (_, i) => {
          const sx = -sitoutW / 2 + 0.45 + i * 0.48;
          return (
            <mesh key={`s-${i}`} position={[sx, 0.35, 0.55]} castShadow>
              <sphereGeometry args={[0.026, 12, 12]} />
              <meshStandardMaterial color={PALETTE.brassStud} metalness={0.9} roughness={0.2} />
            </mesh>
          );
        })}
      </group>

      {/* Heavy Circular Masonry Pillars supporting Sit-out Roof - Positioned squarely under the roof canopy following its pitch */}
      {[-1.65, 1.65].map((px, idx) => (
        <group key={`pil-${idx}`} position={[px, 0, 0.38]}>
          {/* Square Stone Base */}
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.38, 0.4, 0.38]} />
            <meshStandardMaterial color={PALETTE.pillarStone} roughness={0.7} />
          </mesh>
          {/* Round Shaft */}
          <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.13, 0.15, 2.3, 16]} />
            <meshStandardMaterial color={PALETTE.pillarStone} roughness={0.65} />
          </mesh>
          {/* Decorative Capital */}
          <mesh position={[0, 2.8, 0]} castShadow>
            <boxGeometry args={[0.36, 0.2, 0.36]} />
            <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.5} />
          </mesh>
          {/* Top Bracket Capital meeting roof */}
          <mesh position={[0, 2.98, 0]} castShadow>
            <boxGeometry args={[0.44, 0.16, 0.44]} />
            <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Horizontal Wooden Eave Lintel Beam directly supporting the Sit-out Canopy */}
      <mesh position={[0, 3.1, 0.38]} castShadow>
        <boxGeometry args={[sitoutW - 0.4, 0.16, 0.28]} />
        <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.48} />
      </mesh>

      {/* Hanging Clay Orchid Pots from Eaves (matching reference photograph) */}
      {[-1.9, -1.35, -0.8, -0.25, 0.35, 0.95, 1.55, 2.0].map((hx, idx) => (
        <group key={`pot-${idx}`} position={[hx, 1.78 + (idx % 2) * 0.08, 0.40]}>
          {/* Hanging string */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.44, 4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Clay Pot */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.06, 0.14, 12]} />
            <meshStandardMaterial color={['#c85a32', '#5d8f4a', '#d6a12f', '#7b4a9e'][idx % 4]} roughness={0.8} />
          </mesh>
          {/* Foliage / Orchid leaves */}
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshStandardMaterial color={PALETTE.foliageGreen} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Low planter row at the edge of the sit-out, echoing the planted front step */}
      <group position={[0.2, 0.1, sitoutD / 2 + 0.18]}>
        <mesh position={[0, 0.12, 0]} receiveShadow>
          <boxGeometry args={[sitoutW - 0.35, 0.22, 0.42]} />
          <meshStandardMaterial color="#3c3028" roughness={0.9} />
        </mesh>
        {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((px, idx) => (
          <group key={`front-planter-${idx}`} position={[px, 0.32 + (idx % 2) * 0.03, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.18 + (idx % 3) * 0.035, 9, 7]} />
              <meshStandardMaterial color={idx % 2 ? PALETTE.foliageBright : PALETTE.foliageGreen} roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/**
 * Foundation Plinth: Exposed Rubble / Dark Granite Plinth along base of entire home.
 */
function FoundationPlinth() {
  return (
    <group position={[0, 0.04, -0.3]}>
      {/* Dark Rubble Stone Masonry Base */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[11.85, 0.28, 12.65]} />
        <meshStandardMaterial
          color={PALETTE.plinthStone}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

/**
 * Authentic Kerala Interlocking Paver Driveway & Front Garden Landscaping.
 */
function CourtyardPavers() {
  const tiles=useRef<THREE.InstancedMesh>(null);
  useEffect(()=>{
    const matrix=new THREE.Matrix4();const color=new THREE.Color();
    for(let row=0;row<22;row++)for(let col=0;col<40;col++){
      const index=row*40+col;
      matrix.makeTranslation(-5.95+(col+.5)*.3375,.055,4.45+(row+.5)*7.5/22);
      tiles.current!.setMatrixAt(index,matrix);
      tiles.current!.setColorAt(index,color.set(row%4===2&&col%4===2?PALETTE.paverCharcoal:row%4===0&&col%4===0?PALETTE.paverCream:PALETTE.paverRed));
    }
    tiles.current!.instanceMatrix.needsUpdate=true;
    if(tiles.current!.instanceColor)tiles.current!.instanceColor.needsUpdate=true;
  },[]);
  return <instancedMesh ref={tiles} args={[undefined,undefined,880]} receiveShadow><cylinderGeometry args={[.17,.17,.025,8]}/><meshStandardMaterial roughness={.95}/></instancedMesh>;
}

function CourtyardDriveway() {
  return (
    <group position={[0, -0.05, 0]}>
      {/* Front Courtyard Interlocking Paver Apron (matching mutham in photo) */}
      <mesh position={[0.8, 0.02, 8.2]} receiveShadow>
        <boxGeometry args={[13.5, 0.04, 7.5]} />
        <meshStandardMaterial
          color={PALETTE.paverRed}
          roughness={0.82}
          metalness={0.05}
        />
      </mesh>

      <CourtyardPavers />

      {/* Garden Planter Beds along Front Foundation */}
      <group position={[-3.8, 0.1, 5.2]}>
        {/* Soil Bed */}
        <mesh receiveShadow>
          <boxGeometry args={[3.2, 0.16, 1.2]} />
          <meshStandardMaterial color="#2d241e" roughness={0.95} />
        </mesh>
        {/* Tropical Shrubs & Flowering Plants */}
        {[-1.1, -0.5, 0.1, 0.7, 1.2].map((gx, idx) => (
          <group key={`plant-${idx}`} position={[gx, 0.25, (idx % 2 === 0 ? 0.15 : -0.15)]}>
            <mesh castShadow>
              <sphereGeometry args={[0.26 + (idx % 3) * 0.06, 8, 8]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? PALETTE.foliageGreen : PALETTE.foliageBright}
                roughness={0.85}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Side gardens frame the house like the reference frontage without changing the building */}
      <SideGarden x={-8.4} z={3.0} side="left" />
      <SideGarden x={8.4} z={3.0} side="right" />
    </group>
  );
}

function SideGarden({ x, z, side }: { x: number; z: number; side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  const leafColors = isLeft ? ['#2d6a4f', '#40916c', '#588157'] : ['#315c43', '#4f794f', '#6f8f55'];
  const shrubOffsets = isLeft ? [-0.85, -0.28, 0.34, 0.82] : [-0.82, -0.28, 0.3, 0.78];

  return (
    <group position={[x, 0, z]}>
      {/* Narrow planting bed */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[1.35, 0.18, 2.55]} />
        <meshStandardMaterial color="#30251f" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.2, -0.02]} receiveShadow>
        <boxGeometry args={[1.52, 0.12, 2.72]} />
        <meshStandardMaterial color={PALETTE.plinthStone} roughness={0.88} />
      </mesh>

      {/* Layered shrubs */}
      {shrubOffsets.map((offset, idx) => (
        <group key={`side-shrub-${side}-${idx}`} position={[offset, 0.35 + (idx % 2) * 0.04, -0.8 + (idx % 3) * 0.75]}>
          <mesh castShadow>
            <sphereGeometry args={[0.28 + (idx % 2) * 0.06, 9, 7]} />
            <meshStandardMaterial color={leafColors[idx % leafColors.length]} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.18, 8, 7]} />
            <meshStandardMaterial color={leafColors[(idx + 1) % leafColors.length]} roughness={0.92} />
          </mesh>
        </group>
      ))}

      {/* Small flowering pots at the garden edge */}
      {[-0.55, 0.55].map((px, idx) => (
        <group key={`side-pot-${side}-${idx}`} position={[px, 0.38, 1.05]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.13, 0.09, 0.2, 12]} />
            <meshStandardMaterial color={idx ? '#b85c3d' : '#d0a33a'} roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.18, 8, 7]} />
            <meshStandardMaterial color={idx ? '#5f8c4d' : '#397a58'} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Slab({ room, level }: { room: Room; level: number }) {
  const selected = useHouse((s) => s.selected);
  const choose = useHouse((s) => s.setSelected);
  const isBalcony = room.id === 'balcony';
  const isStairs = room.id === 'stairs' || room.id === 'g-stairs';
  const isPorch = room.id === 'g-porch' || room.id === 'porch';
  const isSitout = room.id === 'g-sitout' || room.id === 'sitout';
  const y = level * 3.1 + 0.1;
  const wallY = level === 0 ? 1.65 : y + 1.48;
  const wallH = level === 0 ? 3.10 : 2.95;
  const rightWallStartZ = room.z - room.d / 2;
  const rightWallDepth = room.id === 'hall' ? 2.05 - rightWallStartZ : room.d;
  const rightWallZ = room.id === 'hall' ? rightWallStartZ + rightWallDepth / 2 : room.z;

  // Keep the architectural surfaces calm so room boundaries and furniture read first.
  const wallExteriorColor = level === 0 ? PALETTE.wallSalmon : '#e7ded5';
  const slabColor = selected === room.id ? '#d8a85f' : room.color;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        choose(room.id);
      }}
    >
      {/* Floor Slab */}
      <mesh position={[room.x, y, room.z]} receiveShadow>
        <boxGeometry args={[room.w, 0.2, room.d]} />
        <meshStandardMaterial
          color={slabColor}
          roughness={0.78}
        />
        <Edges color={selected === room.id ? '#8a4f1d' : '#6f777a'} threshold={15} />
      </mesh>

      {/* Standard Enclosed Walls - Full Height 2.95m & 100% Solid/Opaque */}
      {!isBalcony && !isStairs && !isPorch && !isSitout && (
        <>
          {/* Left Wall */}
          <Wall
            x={room.x - room.w / 2}
            z={room.z}
            y={wallY}
            w={0.16}
            d={room.d}
            color={wallExteriorColor}
            h={wallH}
          />
          {/* Right Wall */}
          <Wall
            x={room.x + room.w / 2}
            z={rightWallZ}
            y={wallY}
            w={0.16}
            d={rightWallDepth}
            color={wallExteriorColor}
            h={wallH}
          />
          {/* Back Wall */}
          <Wall
            x={room.x}
            z={room.z - room.d / 2}
            y={wallY}
            w={room.w}
            d={0.16}
            color={wallExteriorColor}
            h={wallH}
          />
          {/* Front Wall (Closes off room from the front; g-hall and g-prayer are detailed in SitoutDetails) */}
          {room.id !== 'g-hall' && room.id !== 'g-prayer' && room.id !== 'hall' && (
            <Wall
              x={room.x}
              z={room.z + room.d / 2}
              y={wallY}
              w={room.w}
              d={0.16}
              color={wallExteriorColor}
              h={wallH}
            />
          )}
        </>
      )}

      {/* Staircase Enclosure Walls */}
      {isStairs && (
        <>
          <Wall
            x={room.x + room.w / 2}
            z={room.z}
            y={wallY}
            w={0.16}
            d={room.d}
            color={wallExteriorColor}
            h={wallH}
          />
          <Wall
            x={room.x}
            z={room.z - room.d / 2}
            y={wallY}
            w={room.w}
            d={0.16}
            color={wallExteriorColor}
            h={wallH}
          />
          {level === 0 && (
            <Wall
              x={room.x}
              z={room.z + room.d / 2}
              y={wallY}
              w={room.w}
              d={0.16}
              color={wallExteriorColor}
              h={wallH}
            />
          )}
        </>
      )}

      {/* Car Porch Pillars (Round Masonry Pillars with Stone Finish supporting Roof) */}
      {isPorch && level === 0 && (
        <>
          {/* Left and Right Pillars */}
          {[room.x - room.w / 2 + 0.2, room.x + room.w / 2 - 0.2].map((px, idx) => (
            <group key={`porch-pillar-${idx}`} position={[px, y, room.z + room.d / 2 - 0.2]}>
              {/* Square Stone Base */}
              <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.42, 0.4, 0.42]} />
                <meshStandardMaterial color={PALETTE.pillarStone} roughness={0.7} />
              </mesh>
              {/* Round Masonry Column Shaft */}
              <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.15, 0.17, 2.4, 16]} />
                <meshStandardMaterial color={PALETTE.pillarStone} roughness={0.65} />
              </mesh>
              {/* Pillar Capital */}
              <mesh position={[0, 2.92, 0]} castShadow>
                <boxGeometry args={[0.4, 0.24, 0.4]} />
                <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.5} />
              </mesh>
            </group>
          ))}
          {/* Top Porch Beam directly meeting and supporting the Trapezium Roof */}
          <mesh position={[room.x, y + 3.14, room.z + room.d / 2 - 0.2]} castShadow>
            <boxGeometry args={[room.w + 0.2, 0.22, 0.36]} />
            <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.5} />
          </mesh>
        </>
      )}

      {/* Balcony Railings - Kerala Style Wood Parapet */}
      {isBalcony && (
        <group position={[room.x, y, room.z]}>
          <mesh position={[0, 0.45, room.d / 2 - 0.05]} castShadow>
            <boxGeometry args={[room.w, 0.9, 0.1]} />
            <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.45} />
          </mesh>
          <mesh position={[-room.w / 2 + 0.05, 0.45, 0]} castShadow>
            <boxGeometry args={[0.1, 0.9, room.d]} />
            <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.45} />
          </mesh>
          <mesh position={[room.w / 2 - 0.05, 0.45, 0]} castShadow>
            <boxGeometry args={[0.1, 0.9, room.d]} />
            <meshStandardMaterial color={PALETTE.woodTeak} roughness={0.45} />
          </mesh>
        </group>
      )}

      {/* Room Name Label on Floor */}
      <Text
        position={[room.x, y + 0.2, room.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={room.id === 'hall' || room.id === 'g-hall' ? 0.27 : 0.31}
        maxWidth={room.w - 0.2}
        color="#25323a"
        anchorX="center"
        anchorY="middle"
      >
        {room.name}
      </Text>
    </group>
  );
}

function Wall({
  x,
  z,
  y,
  w,
  d,
  color,
  h = 2.95
}: {
  x: number;
  z: number;
  y: number;
  w: number;
  d: number;
  color: string;
  h?: number;
}) {
  return (
    <mesh position={[x, y, z]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.78} />
      <Edges color="#9a8b80" threshold={18} />
    </mesh>
  );
}

function CameraPreset({ preset }: { preset: ViewPreset }) {
  const { camera } = useThree();
  const controls = useRef<any>(null);

  useEffect(() => {
    const positions: Record<ViewPreset, [number, number, number]> = {
      isometric: [23, 18, 27],
      front: [0, 7, 34],
      top: [0, 30, 0.01]
    };
    const [x, y, z] = positions[preset];
    camera.position.set(x, y, z);
    camera.lookAt(0, 2.3, 0);
    controls.current?.target.set(0, 2.3, 0);
    controls.current?.update();
  }, [camera, preset]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      screenSpacePanning
      minDistance={7}
      maxDistance={42}
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI / 2.02}
      target={[0, 2.3, 0]}
    />
  );
}

/** Two straight return flights joined by the long cross-landing in the reference. */
function Stairs() {
  const railHeight = 0.78;
  const edgeZ = -1.55 + 1.05 / 2;
  const firstUpper = upperSteps[0];
  const lastUpper = upperSteps[upperSteps.length - 1];
  const railStart = new THREE.Vector3(firstUpper.x, firstUpper.y + 0.08 + railHeight, edgeZ);
  const railEnd = new THREE.Vector3(3.15, 3.20 + railHeight, edgeZ);
  const railDirection = railEnd.clone().sub(railStart);
  const railRotation = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0), railDirection.clone().normalize()
  );

  return (
    <group>
      {[lowerSteps, upperSteps].map((flight, flightIndex) => (
        <group key={flightIndex}>
          {flight.map((step, idx) => {
            const rise = flightIndex === 0 ? (1.38 - 0.20) / 7 : (3.20 - 1.38) / 9;
            const riserX = step.x + (flightIndex === 0 ? -1 : 1) * (step.args[0] / 2 - 0.02);
            return (
              <group key={idx}>
                <mesh position={[step.x, step.y, step.z]} castShadow receiveShadow>
                  <boxGeometry args={step.args} />
                  <meshStandardMaterial color={PALETTE.stairWood} roughness={0.5} />
                </mesh>
                <mesh position={[riserX, step.y + 0.08 - rise / 2, step.z]} castShadow receiveShadow>
                  <boxGeometry args={[0.04, rise, step.args[2]]} />
                  <meshStandardMaterial color={PALETTE.stairWood} roughness={0.5} />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}

      {/* Single horizontal landing trimmed flush with the outside edges of both flights. */}
      <mesh position={[middleLanding.x, middleLanding.y, middleLanding.z]} castShadow receiveShadow>
        <boxGeometry args={middleLanding.args} />
        <meshStandardMaterial color={PALETTE.stairWood} roughness={0.5} />
      </mesh>

      {/* Upper flight meets the existing entrance platform directly. */}
      <mesh position={[topLanding.x, topLanding.y, topLanding.z]} castShadow receiveShadow>
        <boxGeometry args={topLanding.args} />
        <meshStandardMaterial color="#a89279" roughness={0.5} />
      </mesh>

      {/* Reference handrail sits beside the upper treads, on the side facing the lower flight. */}
      <mesh position={railStart.clone().add(railEnd).multiplyScalar(0.5)} quaternion={railRotation} castShadow>
        <boxGeometry args={[0.055, railDirection.length(), 0.055]} />
        <meshStandardMaterial color="#5a3d28" />
      </mesh>
      {[firstUpper, lastUpper].map((step, i) => (
        <mesh key={i} position={[step.x, step.y + 0.08 + railHeight / 2, edgeZ]} castShadow>
          <boxGeometry args={[0.045, railHeight, 0.045]} />
          <meshStandardMaterial color="#5a3d28" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * 3D Model of Silver Ford Freestyle (Full Option)
 * Parked inside the Car Porch (Reversed in as in the actual reference photograph KL 33 L 8958).
 * Features:
 * - Metallic Moondust Silver Paint finish
 * - Black Crossover protective body cladding & faux skid plates
 * - Dual silver/black aerodynamic roof rails
 * - Multi-spoke alloy wheels with rubber tires and Ford center caps
 * - Smoked tinted cabin glass, B-pillars, and side mirrors
 * - Tailgate with ruby combination tail lamps, rear spoiler, and license plate 'KL 33 L 8958'
 */
function FordFreestyle() {
  const carX = 4.18;
  const carY = 0.22;
  const carZ = 3.82; // Perfectly parked sheltered under the car porch roof (porch is z: 0.99 to 5.83)

  return (
    <group position={[carX, carY, carZ]}>
      {/* 1. Main Metallic Moondust Silver Body Shell */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.48, 3.82]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.8}
          roughness={0.22}
        />
      </mesh>

      {/* 2. Black Rugged Crossover Protective Cladding (Sills & Bumpers) */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.74, 0.2, 3.84]} />
        <meshStandardMaterial color="#1e242b" roughness={0.88} />
      </mesh>

      {/* Wheel Arch Cladding Flares (Iconic Freestyle Crossover Stance) */}
      {[
        { x: -0.87, z: -1.22 },
        { x: 0.87, z: -1.22 },
        { x: -0.87, z: 1.25 },
        { x: 0.87, z: 1.25 },
      ].map((arch, idx) => (
        <mesh key={`arch-${idx}`} position={[arch.x, 0.38, arch.z]} castShadow>
          <boxGeometry args={[0.04, 0.22, 0.72]} />
          <meshStandardMaterial color="#1e242b" roughness={0.9} />
        </mesh>
      ))}

      {/* Front Bumper & Black Hexagonal Mesh Grille (Facing North -Z into porch) */}
      <group position={[0, 0.42, -1.92]}>
        {/* Honeycomb Grille */}
        <mesh castShadow>
          <boxGeometry args={[0.95, 0.26, 0.06]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        {/* Blue Ford Oval Badge */}
        <mesh position={[0, 0.02, -0.04]}>
          <boxGeometry args={[0.16, 0.08, 0.02]} />
          <meshStandardMaterial color="#1d4ed8" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Swept-Back Front Headlamps */}
        {[-0.62, 0.62].map((hx, idx) => (
          <mesh key={`hl-${idx}`} position={[hx, 0.06, 0.02]} castShadow>
            <boxGeometry args={[0.34, 0.16, 0.08]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        ))}
        {/* Silver Front Skid Plate */}
        <mesh position={[0, -0.16, 0.01]}>
          <boxGeometry args={[0.82, 0.08, 0.05]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.35} />
        </mesh>
      </group>

      {/* 3. Upper Cabin Greenhouse & Sloped Smoked Tinted Glass */}
      <group position={[0, 0.94, -0.08]}>
        {/* Cabin Glass Body */}
        <mesh castShadow>
          <boxGeometry args={[1.54, 0.54, 2.38]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.08}
            metalness={0.65}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Metallic Silver Roof Panel */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.52, 0.05, 2.34]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.8}
            roughness={0.22}
          />
        </mesh>
        {/* Black B & C Pillars */}
        {[-0.78, 0.78].map((px, idx) => (
          <group key={`pil-${idx}`}>
            <mesh position={[px, 0, 0]}>
              <boxGeometry args={[0.04, 0.52, 0.14]} />
              <meshStandardMaterial color="#090d16" roughness={0.9} />
            </mesh>
            <mesh position={[px, 0, 0.7]}>
              <boxGeometry args={[0.04, 0.52, 0.14]} />
              <meshStandardMaterial color="#090d16" roughness={0.9} />
            </mesh>
          </group>
        ))}
        {/* Micro-Antenna at Rear Roof */}
        <mesh position={[0, 0.38, 0.95]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.014, 0.2, 8]} />
          <meshStandardMaterial color="#1e242b" roughness={0.8} />
        </mesh>
      </group>

      {/* 4. Signature Ford Freestyle Functional Roof Rails (Left & Right) */}
      {[-0.62, 0.62].map((rx, idx) => (
        <group key={`rail-${idx}`} position={[rx, 1.32, -0.08]}>
          {/* Main Silver Longitudinal Rail */}
          <mesh castShadow>
            <boxGeometry args={[0.045, 0.04, 2.1]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Front & Rear Rail Feet */}
          <mesh position={[0, -0.04, -0.95]}>
            <boxGeometry args={[0.06, 0.06, 0.12]} />
            <meshStandardMaterial color="#1e242b" />
          </mesh>
          <mesh position={[0, -0.04, 0.95]}>
            <boxGeometry args={[0.06, 0.06, 0.12]} />
            <meshStandardMaterial color="#1e242b" />
          </mesh>
        </group>
      ))}

      {/* 5. Rear Tailgate, Lamps, Spoiler & Kerala License Plate (Facing South +Z to Courtyard) */}
      <group position={[0, 0.54, 1.92]}>
        {/* Tailgate Hatch Panel */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.68, 0.06]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.8}
            roughness={0.22}
          />
        </mesh>

        {/* Rear Integrated Roof Spoiler */}
        <mesh position={[0, 0.68, -0.1]} castShadow>
          <boxGeometry args={[1.48, 0.08, 0.28]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.22} />
        </mesh>
        {/* High-Mounted Stop Lamp (Red LED strip) */}
        <mesh position={[0, 0.68, 0.05]}>
          <boxGeometry args={[0.32, 0.03, 0.02]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} />
        </mesh>

        {/* Rear Window Wiper Arm & Blade */}
        <group position={[0, 0.44, 0.04]} rotation={[0, 0, -0.25]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.03, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.12, 0.06, 0.01]} rotation={[0, 0, -0.7]}>
            <boxGeometry args={[0.26, 0.014, 0.01]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Ruby Red Combination Tail Lamps */}
        {[-0.66, 0.66].map((tx, idx) => (
          <group key={`tail-${idx}`} position={[tx, 0.18, 0.04]}>
            {/* Red Housing */}
            <mesh castShadow>
              <boxGeometry args={[0.26, 0.32, 0.05]} />
              <meshStandardMaterial color="#dc2626" roughness={0.2} />
            </mesh>
            {/* Clear White Reverse Indicator Section */}
            <mesh position={[0, -0.06, 0.02]}>
              <boxGeometry args={[0.22, 0.08, 0.02]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.15} />
            </mesh>
          </group>
        ))}

        {/* Blue Ford Oval Badge on Hatch */}
        <mesh position={[0, 0.22, 0.04]}>
          <boxGeometry args={[0.15, 0.07, 0.02]} />
          <meshStandardMaterial color="#1d4ed8" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* FREESTYLE Badge (Left) */}
        <Text
          position={[-0.48, 0.12, 0.04]}
          fontSize={0.04}
          color="#64748b"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          FREESTYLE
        </Text>

        {/* TITANIUM+ Badge (Right) */}
        <Text
          position={[0.48, 0.12, 0.04]}
          fontSize={0.038}
          color="#64748b"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          TITANIUM+
        </Text>

        {/* Actual Kerala Number Plate from Reference Photograph: KL 33 L 8958 */}
        <group position={[0, -0.06, 0.05]}>
          {/* White Reflective Plate */}
          <mesh castShadow>
            <boxGeometry args={[0.62, 0.15, 0.02]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          {/* Black Plate Border */}
          <mesh position={[0, 0, 0.012]}>
            <boxGeometry args={[0.6, 0.13, 0.005]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          {/* License Plate Text */}
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.065}
            color="#0f172a"
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
          >
            KL 33 L 8958
          </Text>
        </group>

        {/* Lower Rear Bumper Cladding & Silver Skid Plate */}
        <mesh position={[0, -0.24, 0.02]}>
          <boxGeometry args={[1.72, 0.18, 0.06]} />
          <meshStandardMaterial color="#1e242b" roughness={0.88} />
        </mesh>
        <mesh position={[0, -0.28, 0.05]}>
          <boxGeometry args={[0.82, 0.08, 0.04]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Red Rear Bumper Reflectors */}
        {[-0.64, 0.64].map((rx, idx) => (
          <mesh key={`ref-${idx}`} position={[rx, -0.22, 0.06]}>
            <boxGeometry args={[0.18, 0.04, 0.01]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
        ))}
      </group>

      {/* 6. Side View Mirrors & Amber Turn Indicator Repeaters */}
      {[-0.92, 0.92].map((mx, idx) => (
        <group key={`mirr-${idx}`} position={[mx, 0.82, -0.72]}>
          {/* Silver Mirror Shell */}
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.11, 0.16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.22} />
          </mesh>
          {/* Amber Turn Indicator on Mirror */}
          <mesh position={[mx > 0 ? 0.09 : -0.09, 0, 0]}>
            <boxGeometry args={[0.01, 0.03, 0.12]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.2} />
          </mesh>
          {/* Black Mounting Stem */}
          <mesh position={[-mx * 0.06, -0.04, 0]}>
            <boxGeometry args={[0.06, 0.04, 0.06]} />
            <meshStandardMaterial color="#1e242b" />
          </mesh>
        </group>
      ))}

      {/* 7. 4 Multi-Spoke Alloy Wheels with Rubber Tires & Ford Center Caps */}
      {[
        { x: -0.84, z: -1.22 }, // Front Left
        { x: 0.84, z: -1.22 },  // Front Right
        { x: -0.84, z: 1.25 },   // Rear Left
        { x: 0.84, z: 1.25 }    // Rear Right
      ].map((wPos, idx) => (
        <group key={`whl-${idx}`} position={[wPos.x, 0.28, wPos.z]}>
          {/* Rubber Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.22, 24]} />
            <meshStandardMaterial color="#171717" roughness={0.92} />
          </mesh>
          {/* Gunmetal / Silver Multi-Spoke Alloy Rim */}
          <mesh
            position={[wPos.x > 0 ? 0.04 : -0.04, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.21, 0.21, 0.16, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.88} roughness={0.18} />
          </mesh>
          {/* Blue Ford Center Hubcap */}
          <mesh
            position={[wPos.x > 0 ? 0.12 : -0.12, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.045, 0.045, 0.02, 12]} />
            <meshStandardMaterial color="#1d4ed8" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* 8. Soft Ambient Contact Shadow Under the Car */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.86, 3.95]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Scene({ viewPreset }: { viewPreset: ViewPreset }) {
  const { layout, mode, roof, before, presentation } = useHouse();
  const ground = mode === 'both' || mode === 'ground';
  const first = !before && (mode === 'both' || mode === 'first');

  return (
    <>
      <color attach="background" args={['#edf2f3']} />
      
      {/* Neutral architectural lighting keeps the model readable from every angle. */}
      <ambientLight intensity={0.68} />
      <directionalLight
        position={[12, 22, 16]}
        intensity={2.7}
        color="#fffaf2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <hemisphereLight args={['#dceaf0', '#b9c7bd', 0.72]} />

      {/* Interlocking Pavers & Tropical Landscaping */}
      <CourtyardDriveway />

      {/* Dark Rubble Stone Foundation Plinth */}
      <FoundationPlinth />

      {/* Infinite Surrounding Ground Grid */}
      {!presentation && <Grid
        position={[0, -0.06, 0]}
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#94a3b8"
        sectionColor="#64748b"
        infiniteGrid
        fadeDistance={45}
      />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#d3dcdb" roughness={0.92} />
      </mesh>
      <ContactShadows position={[0, -0.03, 0]} opacity={0.28} scale={30} blur={2.6} far={12} />

      {/* Ground Floor Rooms */}
      {ground &&
        layout.rooms
          .filter((r) => r.floor === 0)
          .map((r) => <Slab key={r.id} room={r} level={0} />)}

      {/* First Floor Rooms */}
      {first && <UpperInterior />}

      {/* Modern framed exterior, picture window and glass balcony. */}
      {first && <ModernUpperFacade />}

      {/* Contemporary flat roof over the new upper floor. */}
      {roof && first && <ModernUpperRoof />}

      {/* Upper Story Front Facade (Closes off First Floor from the front) */}
      {/* Proposed walls are generated from the same geometry as the plan. */}

      {/* Authentic Sit-out with Charupadi, Carved Door, Glazed Windows & Hanging Orchid Pots */}
      {ground && <SitoutDetails />}

      {/* Silver Ford Freestyle Parked in Car Porch (KL 33 L 8958) */}
      {ground && <FordFreestyle />}

      {/* Two-flight left-turn staircase */}
      {(ground || first) && <Stairs />}

      {/* Existing Stair Tower Room (marked in red on actual home photo - present in both existing and proposed views) */}
      {(ground || first || before) && (
        <ExistingStairTower isExtensionActive={first} />
      )}

      {/* Existing Kerala roof reference; the front porch tier remains unchanged and opaque. */}
      {roof && <KeralaRoof isUpper={false} ghost={first} />}

      <CameraPreset preset={viewPreset} />
      {!presentation && <GizmoHelper alignment="bottom-right" margin={[72, 72]}>
        <GizmoViewport axisColors={['#b14e3c', '#4f8b5a', '#4f78b5']} labelColor="#30434a" />
      </GizmoHelper>}
    </>
  );
}

export default function House3D({ viewPreset = 'isometric' }: { viewPreset?: ViewPreset }) {
  return (
    <Canvas
      shadows
      camera={{ position: [16, 13, 18], fov: 42, near: 0.1, far: 150 }}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <Suspense fallback={null}>
        <Scene viewPreset={viewPreset} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
