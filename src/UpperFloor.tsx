import { useState } from 'react';
import { Text } from '@react-three/drei';
import { useHouse } from './store';
import { doors, furniture, hallOutline, masterOutline, upperWalls, roomParts, roomArea, roomLabels } from './planning';
import { lowerSteps, upperSteps, middleLanding } from './stairGeometry';

const px = (n: number) => 300 + n * 42;
const pz = (n: number) => 320 + n * 42;
const compactLabels: Record<string, string[]> = {
  closet: ['Walk-in', 'Closet'],
  masterbath: ['Attached', 'Bath'],
};

export function UpperPlan() {
  const {layout, setSelected, selected} = useHouse();
  const [showGroundWetAreas, setShowGroundWetAreas] = useState(true);
  return <g>
    <rect x={px(2.25)} y={pz(-2.1)} width={3.48*42} height={3.045*42} fill="#e5e9e7" stroke="#7b8c89" strokeDasharray="5 4" />
    {[...lowerSteps, ...upperSteps, middleLanding].map((step,i)=><rect key={i}
      x={px(step.x-step.args[0]/2)} y={pz(step.z-step.args[2]/2)}
      width={step.args[0]*42} height={step.args[2]*42} fill="#e6c398" stroke="#a58b69" strokeWidth=".6"/>)}
    {layout.rooms.filter(r=>r.floor===1).map(r=>{
      const outline = r.id==='hall' ? hallOutline : r.id==='bed1' ? masterOutline : null;
      return <g key={r.id} onClick={()=>setSelected(r.id)} role="button" tabIndex={0} aria-label={r.name}
        onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(r.id);}}} style={{cursor:'pointer'}}>
        {outline ? <polygon points={outline.map(([x,z])=>`${px(x)},${pz(z)}`).join(' ')} fill={r.color} stroke={selected===r.id?'#b78150':'#42535a'} strokeWidth="2"/> :
          <rect x={px(r.x-r.w/2)} y={pz(r.z-r.d/2)} width={r.w*42} height={r.d*42} fill={r.color} stroke={selected===r.id?'#b78150':'#42535a'} strokeWidth="2"/>}
      </g>;
    })}
    {furniture.map(f=>{
      const isSouth = (f as {head?: string}).head === 'south';
      return <g key={f.id} pointerEvents="none">
        <rect x={px(f.x-f.w/2)} y={pz(f.z-f.d/2)} width={f.w*42} height={f.d*42} rx="3" fill={f.color} stroke="#75847e"/>
        {f.id.startsWith('bed')&&<rect x={px(f.x-f.w/2)+4} y={isSouth ? pz(f.z+f.d/2)-16 : pz(f.z-f.d/2)+4} width={f.w*42-8} height="12" rx="3" fill="#fffaf0"/>}
      </g>;
    })}
    {showGroundWetAreas && <g pointerEvents="none">
      {layout.rooms.filter(r=>r.id==='g-bath1'||r.id==='g-bath2').map(r=><rect key={r.id}
        x={px(r.x-r.w/2)} y={pz(r.z-r.d/2)} width={r.w*42} height={r.d*42}
        fill="#0e7490" fillOpacity=".07" stroke="#087e96" strokeWidth="2" strokeDasharray="5 3"/>)}
      <text x={px(3.8)} y={pz(-.45)} textAnchor="middle" fontSize="9" fill="#086477">GF Bath 1 below · stair void</text>
      <text x={px(1.856)} y={pz(-4.3)} textAnchor="middle" fontSize="8" fill="#086477">GF BATH 2 BELOW</text>
    </g>}
    {layout.rooms.filter(r=>r.floor===1&&r.id!=='stairs').map(r=>{
      const [x,z]=roomLabels[r.id] || [r.x,r.z];
      const lines=compactLabels[r.id] || [r.name];
      const compact=lines.length>1;
      const titleY=pz(z)-(compact?4:0);
      return <g key={r.id} pointerEvents="none">
        {compact&&<rect x={px(x)-30} y={pz(z)-20} width="60" height="42" rx="4" fill="#ffffff" fillOpacity=".78" stroke="#d5dfdd" strokeWidth=".7"/>}
        <text x={px(x)} y={titleY} textAnchor="middle" fontSize={compact?9.5:11.5} fontWeight="700" fill="#17242a" paintOrder="stroke" stroke="#f7faf9" strokeWidth="3" strokeLinejoin="round">
          {lines.map((line,index)=><tspan key={line} x={px(x)} dy={index===0?0:10}>{line}</tspan>)}
        </text>
        <text x={px(x)} y={pz(z)+(compact?16:12)} textAnchor="middle" fontSize={compact?8.2:9} fontWeight="600" fill="#42535a" paintOrder="stroke" stroke="#f7faf9" strokeWidth="2.5">{roomArea(r).toFixed(1)} m²</text>
      </g>;
    })}
    {doors.map(d=><g key={d.id} pointerEvents="none" transform={`translate(${px(d.x)},${pz(d.z)}) rotate(${d.axis==='z'?90:0})`}>
      <line x1={-d.width*21} x2={d.width*21} stroke="#f6f4ed" strokeWidth="5"/>
      {d.id!=='arrival' && <><line x1={-d.width*21} y1="0" x2={-d.width*21} y2={d.width*42} stroke="#6b3b1e" strokeWidth="2"/><path d={`M ${d.width*21} 0 A ${d.width*42} ${d.width*42} 0 0 1 ${-d.width*21} ${d.width*42}`} fill="none" stroke="#6b3b1e" strokeWidth="1"/></>}
    </g>)}
    <defs><marker id="upper-entry" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#164f56"/></marker></defs>
    <path d={`M ${px(3.0)} ${pz(-1.55)} H ${px(.3)} V ${pz(-.55)}`} stroke="#164f56" strokeWidth="2" fill="none" markerEnd="url(#upper-entry)"/>
    <text x={px(3.6)} y={pz(1.35)} textAnchor="middle" fontSize="9" fill="#42535a">EXISTING STAIR</text>
    <foreignObject x={px(-5.1)} y={pz(4.3)} width="420" height="52">
      <div style={{fontSize:11,color:'#086477'}}>
        <label style={{display:'flex',gap:7,alignItems:'center',cursor:'pointer'}}>
          <input type="checkbox" checked={showGroundWetAreas} onChange={e=>setShowGroundWetAreas(e.target.checked)}/>
          Ground-floor bathrooms and proposed pipe alignment
        </label>
        <div style={{fontSize:10,marginTop:5}}>Dashed outlines = bathrooms below. Existing pipe positions are unverified.</div>
      </div>
    </foreignObject>
  </g>;
}

function Block({x,z,w,d,h=2.95,y=4.675,color='#e7ded5'}:{x:number;z:number;w:number;d:number;h?:number;y?:number;color?:string}) {
  return <mesh position={[x,y,z]} castShadow receiveShadow><boxGeometry args={[w,h,d]}/><meshStandardMaterial color={color} roughness={.8}/></mesh>;
}

export function UpperInterior() {
  const {layout,setSelected}=useHouse();
  return <group>
    {layout.rooms.filter(r=>r.floor===1&&r.id!=='stairs').map(r=><group key={r.id} onClick={e=>{e.stopPropagation();setSelected(r.id);}}>
      {roomParts(r).map((part,i)=><Block key={i} {...part} h={.2} y={3.1} color={r.color}/>)}
      <Text position={[(roomLabels[r.id] || [r.x,r.z])[0],3.23,(roomLabels[r.id] || [r.x,r.z])[1]]} rotation={[-Math.PI/2,0,0]} fontSize={.18} color="#253b3b">{r.name}</Text>
    </group>)}
    {upperWalls.map(([x1,z1,x2,z2],i)=>{
      const alongX=z1===z2; const start=alongX?x1:z1; const end=alongX?x2:z2;
      const opening=doors.find(d=>d.axis===(alongX?'x':'z')&&Math.abs((alongX?d.z:d.x)-(alongX?z1:x1))<.001&&(alongX?d.x:d.z)>start&&(alongX?d.x:d.z)<end);
      const draw=(a:number,b:number,h=2.95,y=4.675)=>b-a>.001?<Block key={`${i}-${a}-${y}`} x={alongX?(a+b)/2:x1} z={alongX?z1:(a+b)/2} w={alongX?b-a:.14} d={alongX?.14:b-a} h={h} y={y}/>:null;
      if(!opening)return draw(start,end);
      const center=alongX?opening.x:opening.z;const a=center-opening.width/2,b=center+opening.width/2;
      return <group key={i}>{draw(start,a)}{draw(b,end)}{draw(a,b,.75,5.775)}</group>;
    })}
    {furniture.map(f=>{
      const isSouth = (f as {head?: string}).head === 'south';
      const pillowZ = isSouth ? f.z + f.d/2 - .3 : f.z - f.d/2 + .3;
      return <group key={f.id}>
        <Block x={f.x} z={f.z} w={f.w} d={f.d} h={f.h} y={3.2+f.h/2} color={f.color}/>
        {f.id.startsWith('bed')&&<Block x={f.x} z={pillowZ} w={f.w-.2} d={.4} h={.12} y={3.2+f.h+.06} color="#f8f3e9"/>}
      </group>;
    })}
    {/* Guard the open edges of the existing landing, keeping the west arrival open. */}
    {[-2.075,-1.025].map(z=><group key={z}><Block x={2.7} z={z} w={.9} d={.04} h={.04} y={4.25} color="#6b3b1e"/>{[2.3,2.7,3.1].map(x=><Block key={x} x={x} z={z} w={.035} d={.035} h={1.05} y={3.725} color="#6b3b1e"/>)}</group>)}
  </group>;
}
