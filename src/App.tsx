import { useEffect, useRef, useState } from 'react';
import {
  House,
  Rotate3D,
  Layers3,
  Download,
  Upload,
  Eye,
  EyeOff,
  Info,
  Ruler,
  Menu,
  X,
  AlertTriangle,
  Lock
} from 'lucide-react';
import House3D, { type ViewPreset } from './House3D';
import { useHouse, type Layout } from './store';
import { UpperPlan } from './UpperFloor';
import { roomArea, overlapArea } from './planning';
import { lowerSteps, upperSteps, middleLanding, topLanding, stairRoute } from './stairGeometry';
import { captureView, downloadImage, downloadPdf } from './exports';

function Plan2D({ activeFloor, setFloor }: { activeFloor: 0 | 1; setFloor: (f: 0 | 1) => void }) {
  const { layout, selected, setSelected } = useHouse();
  const rooms = layout.rooms.filter((r) => r.floor === activeFloor);

  return (
    <div className="plan">
      <div className="plan-label" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span>{activeFloor === 0 ? 'EXISTING GROUND FLOOR' : 'PROPOSED FIRST FLOOR · V3.9'}</span>
        <div style={{ display: 'inline-flex', gap: '4px' }}>
          <button
            style={{
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '6px',
              border: activeFloor === 0 ? '1px solid #164f56' : '1px solid #dce4e3',
              background: activeFloor === 0 ? '#164f56' : '#fff',
              color: activeFloor === 0 ? '#fff' : '#4b6068'
            }}
            onClick={() => setFloor(0)}
          >
            Ground
          </button>
          <button
            style={{
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '6px',
              border: activeFloor === 1 ? '1px solid #164f56' : '1px solid #dce4e3',
              background: activeFloor === 1 ? '#164f56' : '#fff',
              color: activeFloor === 1 ? '#fff' : '#4b6068'
            }}
            onClick={() => setFloor(1)}
          >
            First
          </button>
        </div>
      </div>
      <svg viewBox={activeFloor===1?'40 55 520 530':'0 0 600 650'} role="group" aria-label="Top down conceptual room arrangement">
        {activeFloor === 1 && <UpperPlan />}
        {activeFloor === 0 && rooms.map((r) => {
          const isSelected = selected === r.id;
          const x = 300 + (r.x - r.w / 2) * 42;
          const y = 320 + (r.z - r.d / 2) * 42;
          const width = r.w * 42;
          const height = r.d * 42;
          const centerX = 300 + r.x * 42;
          const centerY = 320 + r.z * 42;

          return (
            <g key={r.id} onClick={() => setSelected(r.id)} style={{ cursor: 'pointer' }}>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx="4"
                fill={isSelected ? '#fde047' : r.color}
                stroke={isSelected ? '#2563eb' : '#42535a'}
                strokeWidth={isSelected ? '3' : '2'}
              />
              <text
                x={centerX}
                y={height > 35 ? centerY - 5 : centerY}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#1e293b"
              >
                {r.name.length > 18 ? r.name.slice(0, 17) + '…' : r.name}
              </text>
              {height > 35 && (
                <text
                  x={centerX}
                  y={centerY + 10}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="#475569"
                >
                  {r.w.toFixed(1)} × {r.d.toFixed(1)}m
                </text>
              )}
            </g>
          );
        })}

        {/* User's Exact Stair Direction Overlay */}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
          </marker>
        </defs>

        {activeFloor === 0 && (
          <g id="stair-flight-overlay" pointerEvents="none">
            {[middleLanding, topLanding].map((slab, i) => (
              <rect key={i}
                x={300 + (slab.x - slab.args[0] / 2) * 42}
                y={320 + (slab.z - slab.args[2] / 2) * 42}
                width={slab.args[0] * 42} height={slab.args[2] * 42}
                fill="#f4c892" fillOpacity="0.32" stroke="#b45309" strokeWidth="1.5"
              />
            ))}
            {[...lowerSteps, ...upperSteps].map((step, i) => (
              <rect key={i}
                x={300 + (step.x - step.args[0] / 2) * 42}
                y={320 + (step.z - step.args[2] / 2) * 42}
                width={step.args[0] * 42} height={step.args[2] * 42}
                fill="#e6c398" fillOpacity="0.5" stroke="#78350f" strokeWidth="1"
              />
            ))}
            <path
              d={stairRoute.map(([x, z], i) => `${i === 0 ? 'M' : 'L'} ${300 + x * 42} ${320 + z * 42}`).join(' ')}
              fill="none" stroke="#dc2626" strokeWidth="3" strokeLinejoin="round"
              markerEnd="url(#arrow)"
            />
            <text x={300 + 2.9 * 42} y={320 + 1.23 * 42} fontSize="9" fill="#b91c1c">
              HALL ENTRY →
            </text>
          </g>
        )}
      </svg>
      <div className="plan-label">↑ REAR &nbsp; · &nbsp; FRONT / COURTYARD ↓</div>
    </div>
  );
}

function Editor() {
  const { layout, selected, updateRoom, presentation } = useHouse();
  const r = layout.rooms.find((item) => item.id === selected);

  if (!r) {
    return (
      <div className="empty">
        <Ruler size={28} />
        <h3>Select a room</h3>
        <p>Select a room to review its dimensions, area and design notes.</p>
      </div>
    );
  }

  // Calculate real-time overlaps on the same floor
  const overlaps = layout.rooms
    .filter((other) => other.id !== r.id && other.floor === r.floor)
    .map((other) => {
      const area = overlapArea(r, other);
      return area > 0.01 ? {name:other.name,area} : null;
    })
    .filter(Boolean);

  const x1 = (r.x - r.w / 2).toFixed(2);
  const x2 = (r.x + r.w / 2).toFixed(2);
  const z1 = (r.z - r.d / 2).toFixed(2);
  const z2 = (r.z + r.d / 2).toFixed(2);

  const isLocked = true;

  return (
    <div className="editor">
      <div className="tag editor-kicker">
        {isLocked && <Lock size={12} />}
        <span>{r.floor === 0 ? 'Existing Ground Floor (Locked)' : r.id==='stairs' ? 'Existing stair (Locked)' : 'Proposed First Floor'}</span>
      </div>
      <h3 className="editor-title">{r.name}</h3>
      <p className="editor-description">{r.notes}</p>

      {isLocked && (
        <div className="locked-note">
          <Lock size={15} />
          <span>Geometry fixed · dimensions for review</span>
        </div>
      )}

      {overlaps.length > 0 && (
        <div className="alert-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
            <AlertTriangle size={15} />
            <span>Boundary Overlap Detected:</span>
          </div>
          {overlaps.map((o, idx) => (
            <div key={idx}>
              Collides with <strong>{o!.name}</strong> by {o!.area.toFixed(1)} m²
            </div>
          ))}
        </div>
      )}

      {!presentation && r.floor===1 && r.id!=='stairs' && <label>Plan finish <input aria-label="Plan finish" type="color" value={r.color} onChange={e=>updateRoom(r.id,{color:e.target.value})}/></label>}
      {!presentation && <div className="fields">
        <label>
          Width (m)
          <input
            type="number"
            min=".5"
            max="15"
            step=".05"
            value={r.w}
            disabled={isLocked}
            style={{ opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'auto' }}
            onChange={(e) => {
              if (isLocked) return;
              const v = Number(e.target.value);
              if (v >= 0.5 && v <= 15) updateRoom(r.id, { w: v });
            }}
          />
        </label>
        <label>
          Depth (m)
          <input
            type="number"
            min=".5"
            max="15"
            step=".05"
            value={r.d}
            disabled={isLocked}
            style={{ opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'auto' }}
            onChange={(e) => {
              if (isLocked) return;
              const v = Number(e.target.value);
              if (v >= 0.5 && v <= 15) updateRoom(r.id, { d: v });
            }}
          />
        </label>
        <label>
          Position X (m)
          <input
            type="number"
            min="-10"
            max="10"
            step=".05"
            value={r.x}
            disabled={isLocked}
            style={{ opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'auto' }}
            onChange={(e) => {
              if (isLocked) return;
              const v = Number(e.target.value);
              if (v >= -10 && v <= 10) updateRoom(r.id, { x: v });
            }}
          />
        </label>
        <label>
          Position Z (m)
          <input
            type="number"
            min="-10"
            max="10"
            step=".05"
            value={r.z}
            disabled={isLocked}
            style={{ opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'auto' }}
            onChange={(e) => {
              if (isLocked) return;
              const v = Number(e.target.value);
              if (v >= -10 && v <= 10) updateRoom(r.id, { z: v });
            }}
          />
        </label>
      </div>}

      <div className="bounds-pill">
        <div>
          <strong>X bounds:</strong> {x1}m to {x2}m
        </div>
        <div>
          <strong>Z bounds:</strong> {z1}m to {z2}m
        </div>
      </div>

      <p className="small">
        Approx. area: {roomArea(r).toFixed(1)} m²
      </p>
    </div>
  );
}

function App() {
  const { mode, setMode, roof, setRoof, before, setBefore, layout, importLayout, presentation, setPresentation, setSelected } = useHouse();
  const [exportImage,setExportImage]=useState('');
  const [exportError,setExportError]=useState('');
  const [exportStatus,setExportStatus]=useState('');
  const [pdfUrl,setPdfUrl]=useState('');
  useEffect(()=>()=>{if(pdfUrl)URL.revokeObjectURL(pdfUrl);},[pdfUrl]);
  async function savePdf() {
    try {setExportError('');setExportStatus('Preparing PDF…');setPdfUrl(await downloadPdf(await captureView(),`${mode==='ground'?'Ground floor':mode==='first'?'First floor':'Both floors'} - ${view==='2d'?'Plan':'3D view'}`));setExportStatus('PDF prepared. Check your browser downloads.');}
    catch(error){setExportStatus('');setExportError(error instanceof Error?error.message:'PDF export failed.');}
  }
  async function exportVisual(print=false) {
    try {setExportError('');setExportStatus('Preparing image…');const data=await captureView();setExportImage(data);if(print){requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));}else downloadImage(data,`mangalam-house-${mode}-${view}-v3.png`);setExportStatus('Image prepared. Check your browser downloads.');}
    catch(e){setExportStatus('');setExportError(e instanceof Error?e.message:'Export failed.');}
  }
  const [view, setView] = useState<'3d' | '2d'>('3d');
  const [viewPreset, setViewPreset] = useState<ViewPreset>('front');
  const [planFloor, setPlanFloor] = useState<0 | 1>(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  function download() {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mangalam-house-v3.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function upload(f?: File) {
    if (!f) return;
    try {
      const p = JSON.parse(await f.text()) as Layout;
      if (!Array.isArray(p.rooms) || typeof p.width !== 'number') throw new Error();
      importLayout(p);
    } catch (error) {
      setExportError(error instanceof Error?error.message:'Invalid layout JSON file.');
    }
  }

  const activeFloor = mode === 'ground' ? 0 : mode === 'first' ? 1 : planFloor;

  return (
    <div className="app">
      <header>
        <div className="brand">
          <span className="logo">
            <House size={22} />
          </span>
          <div>
            <strong>
              MANGALAM HOUSE <em>3D</em>
            </strong>
            <small>Kerala residence · Client design review</small>
          </div>
        </div>
        <button aria-label="Open actions" aria-expanded={mobileMenu} className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X /> : <Menu />}
        </button>
        <div className={'header-actions ' + (mobileMenu ? 'show' : '')}>
          <span className="pill">● Design review · V3.9</span>
          <button onClick={()=>setPresentation(!presentation)}>{presentation?'Presentation mode':'Finish review'}</button>
          <button onClick={()=>exportVisual()}>Save image</button>
          <button onClick={savePdf}>Save PDF</button>
          {!presentation && <button onClick={()=>exportVisual(true)}>Print</button>}
          {!presentation && <button onClick={download}>
            <Download size={16} /> Export layout
          </button>}
          {!presentation && <button onClick={() => file.current?.click()}>
            <Upload size={16} /> Import layout
          </button>}
          <input
            ref={file}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </div>
      </header>

      <main>
        <section className="viewport">
          <div className="toolbar">
            <div className="segmented">
              <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>
                <Rotate3D size={16} /> 3D
              </button>
              <button className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}>
                <Layers3 size={16} /> Floor plan
              </button>
            </div>
            <div className="segmented">
              {(view==='2d'?['ground','first'] as const:['both', 'ground', 'first'] as const).map((m) => (
                <button
                  key={m}
                  className={mode === m ? 'active' : ''}
                  onClick={() => {
                    setMode(m);
                    if(m!=='ground')setBefore(false);
                    setSelected(null);
                    if (m === 'ground') setPlanFloor(0);
                    if (m === 'first') setPlanFloor(1);
                  }}
                >
                  {m === 'both' ? 'Both floors' : m === 'ground' ? 'Ground' : 'First'}
                </button>
              ))}
            </div>
            {view === '3d' && (
              <div className="bottom-controls model-controls">
                <button className={roof ? 'toggled' : ''} onClick={() => setRoof(!roof)}>
                  {roof ? <Eye size={16} /> : <EyeOff size={16} />} Roof {roof ? 'on' : 'off'}
                </button>
                <button
                  className={before ? 'toggled' : ''}
                  onClick={() => {
                    setBefore(!before);
                    setMode(before ? 'both' : 'ground');
                    setSelected(null);
                  }}
                >
                  <Layers3 size={16} />
                  {before ? 'Existing house' : 'Proposed extension'}
                </button>
              </div>
            )}
            {view === '3d' && (
              <div className="segmented view-presets" aria-label="3D camera view">
                {(['isometric', 'front', 'top'] as const).map((preset) => (
                  <button
                    key={preset}
                    className={viewPreset === preset ? 'active' : ''}
                    onClick={() => setViewPreset(preset)}
                  >
                    {preset === 'isometric' ? 'Isometric' : preset === 'front' ? 'Front' : 'Top'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="scene">
            {view === '3d' ? <House3D viewPreset={viewPreset} /> : <Plan2D activeFloor={activeFloor} setFloor={f=>{setPlanFloor(f);setMode(f===0?'ground':'first');if(f===1)setBefore(false);setSelected(null);}} />}
            <div className="scene-note">
              {view === '3d'
                ? 'Drag to orbit · Scroll to zoom · Click a room · Use standard view presets'
                : 'Select a room · Dimensions in metres · Door swings and furniture on first floor'}
            </div>
          </div>

          {exportError && <p role="alert" className="alert-box">{exportError}</p>}
          {exportStatus && <p role="status" className="export-status">{exportStatus}</p>}
          {pdfUrl && <a className="export-status" href={pdfUrl} download="mangalam-house-v3-review.pdf">Download prepared PDF</a>}
          {exportImage && <details className="export-preview"><summary>Exported image preview</summary><img src={exportImage} alt="Exported design view"/><a href={exportImage} download="mangalam-house-review.png">Download this image</a></details>}
          {mode!=='ground' && !before && roof && view==='3d' && <p className="roof-note">The existing tiled roof remains one continuous trapezium. A separate triangular sit-out canopy projects forward toward the courtyard; the first-floor top remains a modern concrete flat roof.</p>}
        </section>

        <aside>
          <div className="aside-heading">
            <div>
              <span className="eyebrow">MANGALAM HOUSE · PROJECT OVERVIEW</span>
              <h2>{mode==='ground'?'Existing house':'First-floor proposal'}</h2>
            </div>
            <span className="status-chip"><span /> Ready for review</span>
          </div>

          <div className="project-card">
            <p className="project-summary">Ground-floor bathroom positions guide the revised upstairs wet area, with two bedrooms and the existing stair connection.</p>
            <div className="project-stats">
              <div><strong>2</strong><span>Floors</span></div>
              <div><strong>{layout.rooms.length}</strong><span>Spaces</span></div>
              <div><strong>V3.9</strong><span>Revision</span></div>
            </div>
            <div className="rules-heading"><span>Design intent</span><span>01</span></div>
            <ul>
              <li>Ground floor retained as the approved existing layout.</li>
              <li>Existing stair endpoint opens directly into the family hall.</li>
              <li>The attached bathroom occupies the rear-right corner of the master bedroom.</li>
              <li>A short concealed rear chase returns the bathroom waste line to the proposed drop above Bathroom 2.</li>
              <li>A separate triangular sit-out canopy projects in front of the continuous trapezium roof; the first-floor top uses a modern concrete slab.</li>
              <li>The upper exterior uses a white box frame, large picture window, recessed door, glass balcony and concealed soffit lights.</li>
              <li>The marked stair area is included as a recessed right-side tower with a tall window and continuous concrete roof.</li>
            </ul>
          </div>

          <div className="flow-note">
            <span className="eyebrow">FIRST-FLOOR ARRIVAL</span>
            <strong>Fixed landing <span>→</span> Family hall <span>→</span> Two bedrooms</strong>
          </div>

          <div className="inspector-heading">
            <div>
              <span className="eyebrow">ROOM INSPECTOR</span>
              <h3>Dimensions &amp; boundaries</h3>
            </div>
            <span className="mode-chip">{mode === 'ground' ? 'Ground' : mode === 'first' ? 'First' : 'Both floors'}</span>
          </div>
          <Editor />

          <div className="disclaimer">
            <Info size={18} />
            <p>
              <b>Conceptual design.</b> Confirm dimensions, structure, roof and foundations with measured drawings
              and a qualified professional before construction.
            </p>
          </div>
        </aside>
      </main>
      <section className="print-sheet"><h1>Mangalam House</h1><p>V3.9 · {mode==='ground'?'Existing ground floor':mode==='first'?'Proposed first floor':'Combined review'} · {view==='2d'?'Floor plan':'3D view'}</p>{exportImage && <img src={exportImage} alt="Mangalam House design review"/>}<p>Concept proposal · Traditional lower roofs retained · Modern framed upper exterior and enclosed stair tower under one concrete roof.</p></section>
    </div>
  );
}

export default App;
