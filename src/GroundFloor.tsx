import { useHouse } from './store';
import { groundDoors, groundFurniture, groundRoomDisplayNames, groundRoomLabels } from './groundPlanning';
import { lowerSteps, upperSteps, middleLanding, topLanding, stairRoute } from './stairGeometry';

const px = (n: number) => 300 + n * 42;
const pz = (n: number) => 320 + n * 42;

export function GroundPlan() {
  const { layout, selected, setSelected } = useHouse();
  const rooms = layout.rooms.filter((room) => room.floor === 0);

  return <g>
    {rooms.map((room) => {
      const isSelected = selected === room.id;
      return <g
        key={room.id}
        onClick={() => setSelected(room.id)}
        role="button"
        tabIndex={0}
        aria-label={room.name}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setSelected(room.id);
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={px(room.x - room.w / 2)}
          y={pz(room.z - room.d / 2)}
          width={room.w * 42}
          height={room.d * 42}
          fill={room.color}
          stroke={isSelected ? '#b78150' : '#42535a'}
          strokeWidth={isSelected ? 3 : 2}
          rx="2"
        />
      </g>;
    })}

    {groundFurniture.map((item) => {
      const x = px(item.x - item.w / 2);
      const y = pz(item.z - item.d / 2);
      const width = item.w * 42;
      const height = item.d * 42;
      const isBed = item.kind === 'bed';
      const isCar = item.kind === 'car';
      return <g key={item.id} pointerEvents="none">
        <rect x={x} y={y} width={width} height={height} rx={isCar ? 11 : 3} fill={item.color} stroke="#75847e" strokeWidth=".8" />
        {isBed && <rect x={x + 4} y={item.head === 'south' ? y + height - 16 : y + 4} width={width - 8} height="12" rx="3" fill="#fffaf0" />}
        {isCar && <>
          <rect x={x + 9} y={y + 22} width={width - 18} height={height - 44} rx="8" fill="#dbe5ea" stroke="#728087" />
          {[y + 22, y + height - 29].map((wheelY) => <g key={wheelY}>
            <rect x={x - 3} y={wheelY} width="7" height="18" rx="3" fill="#283238" />
            <rect x={x + width - 4} y={wheelY} width="7" height="18" rx="3" fill="#283238" />
          </g>)}
        </>}
      </g>;
    })}

    {groundDoors.map((door) => <g key={door.id} pointerEvents="none" transform={`translate(${px(door.x)},${pz(door.z)}) rotate(${door.axis === 'z' ? 90 : 0})`}>
      <line x1={-door.width * 21} x2={door.width * 21} stroke="#f6f4ed" strokeWidth="5" />
      {!door.open && <>
        <line x1={-door.width * 21} y1="0" x2={-door.width * 21} y2={door.width * 42} stroke="#6b3b1e" strokeWidth="2" />
        <path d={`M ${door.width * 21} 0 A ${door.width * 42} ${door.width * 42} 0 0 1 ${-door.width * 21} ${door.width * 42}`} fill="none" stroke="#6b3b1e" strokeWidth="1" />
      </>}
    </g>)}

    <g id="ground-stair-flight" pointerEvents="none">
      {[middleLanding, topLanding].map((slab, index) => <rect
        key={`landing-${index}`}
        x={px(slab.x - slab.args[0] / 2)}
        y={pz(slab.z - slab.args[2] / 2)}
        width={slab.args[0] * 42}
        height={slab.args[2] * 42}
        fill="#f4c892"
        fillOpacity=".42"
        stroke="#b45309"
        strokeWidth="1.2"
      />)}
      {[...lowerSteps, ...upperSteps].map((step, index) => <rect
        key={`step-${index}`}
        x={px(step.x - step.args[0] / 2)}
        y={pz(step.z - step.args[2] / 2)}
        width={step.args[0] * 42}
        height={step.args[2] * 42}
        fill="#e6c398"
        fillOpacity=".72"
        stroke="#78350f"
        strokeWidth=".7"
      />)}
      <defs>
        <marker id="ground-stair-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 1 L10 5 L0 9Z" fill="#a43a32" /></marker>
        <marker id="ground-entry-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#164f56" /></marker>
      </defs>
      <path d={stairRoute.map(([x, z], index) => `${index === 0 ? 'M' : 'L'} ${px(x)} ${pz(z)}`).join(' ')} fill="none" stroke="#a43a32" strokeWidth="2.4" strokeLinejoin="round" markerEnd="url(#ground-stair-arrow)" />
      <path d={`M ${px(-1.2)} ${pz(5.45)} V ${pz(3.35)} H ${px(1.8)} V ${pz(.42)} H ${px(2.82)}`} fill="none" stroke="#164f56" strokeWidth="1.8" strokeDasharray="5 3" markerEnd="url(#ground-entry-arrow)" />
    </g>

    {rooms.map((room) => {
      const [x, z] = groundRoomLabels[room.id] || [room.x, room.z];
      const small = room.w < 1.6 || room.d < 1.5;
      const displayName = groundRoomDisplayNames[room.id] || room.name;
      return <g key={`label-${room.id}`} pointerEvents="none">
        <text x={px(x)} y={pz(z)} textAnchor="middle" fontSize={small ? 7.2 : 11} fontWeight="700" fill="#17242a" paintOrder="stroke" stroke="#f7faf9" strokeWidth="3" strokeLinejoin="round">{displayName}</text>
        {!small && <text x={px(x)} y={pz(z) + 12} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#42535a" paintOrder="stroke" stroke="#f7faf9" strokeWidth="2.5">{(room.w * room.d).toFixed(1)} m²</text>}
      </g>;
    })}

    <text x={px(3.52)} y={pz(1.27)} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#a43a32">UP TO FIRST FLOOR</text>
  </g>;
}
