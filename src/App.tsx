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
import { GroundPlan } from './GroundFloor';
import { roomArea, overlapArea } from './planning';
import { captureView, downloadImage, downloadPdf } from './exports';

function Plan2D({ activeFloor, setFloor }: { activeFloor: 0 | 1; setFloor: (f: 0 | 1) => void }) {
  return (
    <div className="plan">
      <div className="plan-label" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span>{activeFloor === 0 ? 'EXISTING GROUND FLOOR · V4.8' : 'PROPOSED FIRST FLOOR · V4.8'}</span>
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
      <svg viewBox="40 55 520 530" role="group" aria-label="Top down conceptual room arrangement">
        {activeFloor === 1 && <UpperPlan />}
        {activeFloor === 0 && <GroundPlan />}
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
          <span className="pill">● Design review · V4.8</span>
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
                : activeFloor === 0
                  ? 'Existing ground floor · Furniture, door swings, circulation and stair route'
                  : 'Proposed first floor · Furniture, door swings and stair arrival'}
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
            <p className="project-summary">{mode === 'ground'
              ? 'Approved existing ground floor with two bedrooms, kitchen, work area, two bathrooms, prayer room, main hall, sit-out, car porch and the existing stair.'
              : 'Upper floor layout with a central Family Hall, the retained rear blank area, an additional large front free area, a Master Suite on the left and Bedroom 2 on the right.'}</p>
            <div className="project-stats">
              <div><strong>2</strong><span>Floors</span></div>
              <div><strong>{layout.rooms.length}</strong><span>Spaces</span></div>
              <div><strong>V4.8</strong><span>Revision</span></div>
            </div>
            <div className="rules-heading"><span>Design intent</span><span>01</span></div>
            {mode === 'ground' ? <ul>
              <li>All approved ground-floor room boundaries and dimensions remain unchanged.</li>
              <li>The sit-out enters the Main Hall from its left corner; the hall remains the central circulation spine.</li>
              <li>The rear work area is entered through the kitchen; Bathroom 2 remains beside the rear bedroom.</li>
              <li>Bedroom 1 and the Prayer Room retain direct Main Hall access on the left.</li>
              <li>The sink passage and common Bathroom 1 remain beside the existing staircase.</li>
              <li>The car porch and traditional sit-out remain aligned with the existing front elevation.</li>
              <li>Ground-floor bathrooms remain the reference for first-floor plumbing coordination.</li>
            </ul> : <ul>
              <li>Ground floor retained as the approved existing layout.</li>
              <li>Existing stair endpoint opens directly into the family hall.</li>
              <li>The black-marked central zone is the 24.7 m² Family Hall and receives the existing stair arrival.</li>
              <li>The red-marked 24.0 m² front zone is an additional open free area.</li>
              <li>The original 2.2 m² rear blank area remains behind the walk-in closet and attached bathroom.</li>
              <li>Spacious Bedroom 2 on the right with direct family hall access.</li>
              <li>A separate triangular sit-out canopy projects in front of the continuous trapezium roof; the first-floor top uses a modern concrete slab.</li>
              <li>The upper exterior uses a white box frame, large picture window, recessed door, glass balcony and concealed soffit lights.</li>
              <li>The marked stair area is included as a recessed right-side tower with a tall window and continuous concrete roof.</li>
            </ul>}
          </div>

          <div className="flow-note">
            <span className="eyebrow">{mode === 'ground' ? 'GROUND-FLOOR ROUTE' : 'FIRST-FLOOR ARRIVAL'}</span>
            <strong>{mode === 'ground'
              ? <>Sit-out <span>→</span> Main hall <span>→</span> Existing stair</>
              : <>Fixed landing <span>→</span> Family hall <span>→</span> Two bedrooms</>}</strong>
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
      <section className="print-sheet"><h1>Mangalam House</h1><p>V4.8 · {mode==='ground'?'Existing ground floor':mode==='first'?'Proposed first floor':'Combined review'} · {view==='2d'?'Floor plan':'3D view'}</p>{exportImage && <img src={exportImage} alt="Mangalam House design review"/>}<p>Concept proposal · Traditional lower roofs retained · Modern framed upper exterior and enclosed stair tower under one concrete roof.</p></section>
    </div>
  );
}

export default App;
