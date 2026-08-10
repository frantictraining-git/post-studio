import React from 'react';
import './ControlPanel.css';
import { FONT_OPTIONS } from '../../hooks/useStudio';
import { OVERLAYS } from '../../assets/overlays';

function ImageUpload({ label, onUpload, onClear, hasImage }) {
  return (
    <div className="cp-group">
      <div className="cp-row">
        <label className="cp-label">{label}</label>
        {hasImage && <button className="btn-sm" onClick={onClear}>Clear</button>}
      </div>
      <label className="cp-upload-btn">
        {hasImage ? 'Change Image...' : 'Select Image...'}
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              const reader = new FileReader();
              reader.onload = (event) => {
                onUpload(event.target.result);
              };
              reader.readAsDataURL(file);
              e.target.value = null;
            }
          }} 
          hidden 
        />
      </label>
    </div>
  );
}

function ZoneControl({ zoneId, zoneData, onChangeText, onChangeStyle, onRemoveZone }) {
  const isText = zoneData.text !== undefined;
  
  return (
    <div className="cp-zone">
      <div className="cp-zone-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{zoneData.type === 'shape' ? 'SHAPE LAYER' : zoneData.type === 'text' ? 'TEXT LAYER' : zoneId}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onRemoveZone && (
            <button 
              className="btn-sm" 
              style={{ padding: '2px 6px', background: '#333', color: '#ff4444', border: '1px solid #ff4444' }}
              onClick={() => onRemoveZone(zoneId)}
              title="Delete Text Box"
            >
              🗑️
            </button>
          )}
          <label className="toggle" title="Toggle Visibility">
          <input 
            type="checkbox" 
            checked={zoneData.visible !== false} 
            onChange={(e) => onChangeStyle(zoneId, { visible: e.target.checked })} 
          />
          <div className="toggle-track"></div>
        </label>
        </div>
      </div>
      
      {isText && zoneData.visible !== false && (
        <textarea 
          value={zoneData.text}
          onChange={(e) => onChangeText(zoneId, e.target.value)}
          placeholder={`Enter ${zoneId}...`}
        />
      )}
      
      <div className="cp-row" style={{ marginTop: 8 }}>
        <select 
          value={zoneData.family}
          onChange={(e) => onChangeStyle(zoneId, { family: e.target.value })}
          style={{ flex: 2 }}
        >
          {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          <option disabled>──────────</option>
          <option value="var(--primaryFont)">Brand Primary</option>
          <option value="var(--secondaryFont)">Brand Secondary</option>
        </select>

        <select 
          value={zoneData.weight || '400'}
          onChange={(e) => onChangeStyle(zoneId, { weight: e.target.value })}
          style={{ flex: 1.5, marginLeft: 4, marginRight: 4 }}
          title="Font Weight"
        >
          <option value="100">Thin</option>
          <option value="200">Extra Light</option>
          <option value="300">Light</option>
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="600">Semibold</option>
          <option value="700">Bold</option>
          <option value="800">Extra Bold</option>
          <option value="900">Black</option>
        </select>
        
        <input 
          type="number" 
          className="cp-input-sm" 
          value={zoneData.size}
          onChange={(e) => onChangeStyle(zoneId, { size: parseInt(e.target.value) || 12 })}
          style={{ flex: 1 }}
        />
        
        <input 
          type="color" 
          value={zoneData.color}
          onChange={(e) => onChangeStyle(zoneId, { color: e.target.value })}
        />
      </div>
      
      <div className="cp-row" style={{ marginTop: 8 }}>
        <div className="btn-group" style={{ flex: 1 }}>
          <button className={`btn-sm ${zoneData.align === 'left' ? 'active' : ''}`} onClick={() => onChangeStyle(zoneId, { align: 'left' })}>L</button>
          <button className={`btn-sm ${zoneData.align === 'center' ? 'active' : ''}`} onClick={() => onChangeStyle(zoneId, { align: 'center' })}>C</button>
          <button className={`btn-sm ${zoneData.align === 'right' ? 'active' : ''}`} onClick={() => onChangeStyle(zoneId, { align: 'right' })}>R</button>
        </div>
        
        <div style={{ flex: 1.5, display: 'flex', gap: '4px', marginLeft: '4px' }}>
          <button 
            className={`btn-sm ${zoneData.italic ? 'active' : ''}`} 
            onClick={() => onChangeStyle(zoneId, { italic: !zoneData.italic })}
            style={{ padding: '0 10px' }}
            title="Italic"
          >
            I
          </button>
          <select 
            value={zoneData.transform || (zoneData.caps ? 'uppercase' : 'none')}
            onChange={(e) => {
              const val = e.target.value;
              onChangeStyle(zoneId, { transform: val, caps: val === 'uppercase' });
            }}
            style={{ flex: 1, padding: '4px' }}
            title="Text Case"
          >
            <option value="none">Normal</option>
            <option value="sentence-case">Sentence Case</option>
            <option value="uppercase">UPPER</option>
            <option value="lowercase">lower</option>
            <option value="capitalize">Capitalize</option>
            <option value="small-caps">Small Caps</option>
          </select>
        </div>
      </div>

      {zoneData.type === 'shape' && (
        <>
          <div className="cp-row" style={{ marginTop: 8 }}>
            <label className="cp-label" style={{ width: '80px' }}>Blend Mode</label>
            <select 
              value={zoneData.blendMode || 'normal'}
              onChange={(e) => onChangeStyle(zoneId, { blendMode: e.target.value })}
              style={{ flex: 1 }}
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="luminosity">Luminosity</option>
              <option value="color">Color</option>
            </select>
          </div>
          
          <div className="cp-row" style={{ marginTop: 8 }}>
            <label className="cp-label" style={{ width: '80px' }}>Fill Color</label>
            <input 
              type="color" 
              value={zoneData.color || '#FFFFFF'}
              onChange={(e) => onChangeStyle(zoneId, { color: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>

          <div className="cp-row" style={{ marginTop: 8 }}>
            <label className="cp-label" style={{ width: '80px' }}>Radius</label>
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={zoneData.radius || 0}
              onChange={(e) => onChangeStyle(zoneId, { radius: Number(e.target.value) })}
              style={{ flex: 1 }}
            />
          </div>
          
          <div className="cp-row" style={{ marginTop: 8 }}>
            <label className="cp-label" style={{ width: '80px' }}>Size</label>
            <input 
              type="range" 
              min="10" 
              max="400" 
              value={zoneData.width || 100}
              onChange={(e) => onChangeStyle(zoneId, { width: Number(e.target.value), height: Number(e.target.value) })}
              style={{ flex: 1 }}
            />
          </div>
        </>
      )}

      {isText && (
        <div className="cp-row" style={{ marginTop: 8 }}>
          <label className="cp-label" style={{ width: '80px' }}>Blend Mode</label>
          <select 
            value={zoneData.blendMode || 'normal'}
            onChange={(e) => onChangeStyle(zoneId, { blendMode: e.target.value })}
            style={{ flex: 1 }}
          >
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
          </select>
        </div>
      )}

      <div className="cp-row" style={{ marginTop: 8 }}>
        <label className="cp-label">Pos X</label>
        <input type="range" min="0" max="100" step="0.5" value={zoneData.x ?? 50} onChange={(e) => onChangeStyle(zoneId, { x: Number(e.target.value) })} style={{ flex: 1 }} />
      </div>
      <div className="cp-row" style={{ marginTop: 4 }}>
        <label className="cp-label">Pos Y</label>
        <input type="range" min="0" max="100" step="0.5" value={zoneData.y ?? 50} onChange={(e) => onChangeStyle(zoneId, { y: Number(e.target.value) })} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

export default function ControlPanel({ 
  state, activeTpl, setActiveTemplate, 
  setHero, setFg, setLogo, setOverlay, 
  setZoneText, setZoneStyle, setSelectedZoneId,
  addTextZone, addShapeZone, removeTextZone,
  setBrandTheme, saveClient, loadClient,
  TEMPLATE_DEFAULTS, onOpenBrandManager, toggleSnap
}) {
  const { hero, fg, logo, grade, zones } = activeTpl;
  const { brandTheme, selectedZoneId, snapEnabled } = state;
  const [clientProfilesExpanded, setClientProfilesExpanded] = React.useState(false);

  return (
    <aside className="cp-sidebar">
      <div className="cp-header">
        <h1>East Eatery</h1>
        <p>Post Studio</p>
      </div>

      <div className="cp-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="cp-section-title" style={{ margin: 0 }}>Template</h2>
          <label className="toggle" title="Snap to Guides" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', color: 'var(--ui-text-muted)' }}>
            Snap
            <input type="checkbox" checked={snapEnabled} onChange={toggleSnap} />
            <div className="toggle-track"></div>
          </label>
        </div>
        <div className="tpl-grid" style={{ marginTop: '12px' }}>
          <div className="tpl-btn active" style={{ cursor: 'default' }}>
            <span className="tpl-icon">{activeTpl.icon}</span>
            {activeTpl.label}
          </div>
        </div>
      </div>

      <div className="cp-scroll-area">
        
        {/* Client Profiles */}
        <div className="cp-section">
          <div 
            className="cp-section-title" 
            style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => setClientProfilesExpanded(!clientProfilesExpanded)}
          >
            <h2>Client Profiles</h2>
            <span>{clientProfilesExpanded ? '▲' : '▼'}</span>
          </div>
          
          {clientProfilesExpanded && (
            <div style={{ marginTop: '12px' }}>
              <div className="cp-row" style={{ marginBottom: 8 }}>
                <select 
                  value={state.activeClient}
                  onChange={(e) => loadClient(e.target.value)}
                  style={{ flex: 1 }}
                >
                  {Object.keys(state.clients || {}).map(clientName => (
                    <option key={clientName} value={clientName}>{clientName}</option>
                  ))}
                </select>
              </div>
              <button 
                className="btn-sm" 
                style={{ width: '100%', marginTop: '4px', padding: '8px' }}
                onClick={onOpenBrandManager}
              >
                Manage Brands
              </button>
            </div>
          )}
        </div>
        

        
        {/* Background / Hero */}
        <div className="cp-section">
          <h2 className="cp-section-title">Background Image</h2>
          <ImageUpload 
            label="Base Photo" 
            hasImage={!!hero.url}
            onUpload={(url) => setHero({ url })}
            onClear={() => setHero({ url: null })}
          />
          {hero.url && (
            <>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Blur</label>
                  <span className="cp-val">{hero.blur}px</span>
                </div>
                <input type="range" min="0" max="20" step="1" value={hero.blur} onChange={(e) => setHero({ blur: Number(e.target.value) })} />
              </div>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Scale</label>
                  <span className="cp-val">{hero.scale.toFixed(2)}x</span>
                </div>
                <input type="range" min="1" max="2.5" step="0.05" value={hero.scale} onChange={(e) => setHero({ scale: Number(e.target.value) })} />
              </div>
              <div className="cp-row" style={{ marginTop: 8 }}>
                <label className="cp-label">Mirror Image</label>
                <label className="toggle">
                  <input type="checkbox" checked={hero.mirror} onChange={(e) => setHero({ mirror: e.target.checked })} />
                  <div className="toggle-track"></div>
                </label>
              </div>
              <div className="cp-row" style={{ marginTop: 8 }}>
                <label className="cp-label">Lock Position</label>
                <label className="toggle">
                  <input type="checkbox" checked={hero.locked} onChange={(e) => setHero({ locked: e.target.checked })} />
                  <div className="toggle-track"></div>
                </label>
              </div>
              
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>Filters</h3>
                <div className="cp-group">
                  <div className="cp-row">
                    <label className="cp-label">Brightness</label>
                    <span className="cp-val">{hero.filters?.brightness || 0}</span>
                  </div>
                  <input type="range" min="-1" max="1" step="0.05" value={hero.filters?.brightness || 0} onChange={(e) => setHero({ filters: { ...hero.filters, brightness: Number(e.target.value) } })} />
                </div>
                <div className="cp-group">
                  <div className="cp-row">
                    <label className="cp-label">Contrast</label>
                    <span className="cp-val">{hero.filters?.contrast || 0}</span>
                  </div>
                  <input type="range" min="-1" max="1" step="0.05" value={hero.filters?.contrast || 0} onChange={(e) => setHero({ filters: { ...hero.filters, contrast: Number(e.target.value) } })} />
                </div>
                <div className="cp-group">
                  <div className="cp-row">
                    <label className="cp-label">Saturation</label>
                    <span className="cp-val">{hero.filters?.saturation || 0}</span>
                  </div>
                  <input type="range" min="-1" max="1" step="0.05" value={hero.filters?.saturation || 0} onChange={(e) => setHero({ filters: { ...hero.filters, saturation: Number(e.target.value) } })} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Overlay Layer */}
        <div className="cp-section">
          <h2 className="cp-section-title">Overlay Layer</h2>
          <div className="cp-row" style={{ marginBottom: 12 }}>
            <select 
              value={state.templates[state.activeTemplate].overlay.id} 
              onChange={(e) => {
                const overlayId = e.target.value;
                const overlayDef = window.getOverlayById ? window.getOverlayById(overlayId) : { default_opacity: 100 }; // Wait, we need to import OVERLAYS
                // For now just set the ID, useStudio handles opacity manually but we might want to auto-set opacity.
                // Let's just set the ID.
                setOverlay({ id: overlayId });
              }}
              style={{ flex: 1 }}
            >
              {OVERLAYS.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          
          <div className="cp-group">
            <div className="cp-row">
              <label className="cp-label">Opacity</label>
              <span className="cp-val">{state.templates[state.activeTemplate].overlay.opacity}%</span>
            </div>
            <input type="range" min="0" max="100" step="1" value={state.templates[state.activeTemplate].overlay.opacity} onChange={(e) => setOverlay({ opacity: Number(e.target.value) })} />
          </div>
        </div>

        {/* Foreground / Overlay */}
        <div className="cp-section">
          <h2 className="cp-section-title">Foreground Layer</h2>
          <ImageUpload 
            label="Overlay Element (optional)" 
            hasImage={!!fg.url}
            onUpload={(url) => setFg({ url })}
            onClear={() => setFg({ url: null })}
          />
          {fg.url && (
            <>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Blend Mode</label>
                </div>
                <select value={fg.blendMode} onChange={(e) => setFg({ blendMode: e.target.value })}>
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="luminosity">Luminosity</option>
                  <option value="color">Color</option>
                </select>
              </div>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Clip Shape</label>
                </div>
                <select value={fg.clipPath || 'none'} onChange={(e) => setFg({ clipPath: e.target.value })}>
                  <option value="none">None</option>
                  <option value="circle">Circle</option>
                </select>
              </div>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Opacity</label>
                  <span className="cp-val">{fg.opacity}%</span>
                </div>
                <input type="range" min="0" max="100" step="1" value={fg.opacity} onChange={(e) => setFg({ opacity: Number(e.target.value) })} />
              </div>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Scale</label>
                  <span className="cp-val">{fg.scale.toFixed(2)}x</span>
                </div>
                <input type="range" min="0.1" max="3" step="0.05" value={fg.scale} onChange={(e) => setFg({ scale: Number(e.target.value) })} />
              </div>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Position X</label>
                  <span className="cp-val">{fg.x.toFixed(0)}%</span>
                </div>
                <input type="range" min="-200" max="300" step="1" value={fg.x} onChange={(e) => setFg({ x: Number(e.target.value) })} />
              </div>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Position Y</label>
                  <span className="cp-val">{fg.y.toFixed(0)}%</span>
                </div>
                <input type="range" min="-200" max="300" step="1" value={fg.y} onChange={(e) => setFg({ y: Number(e.target.value) })} />
              </div>
            </>
          )}
        </div>

        {/* Unified Layers */}
        <div className="cp-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 className="cp-section-title" style={{ margin: 0 }}>Template Layers</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-sm" 
                style={{ padding: '4px 12px', background: '#333', color: '#fff', border: '1px solid #555' }}
                onClick={() => addShapeZone('rect')}
              >
                ⬛ Add Shape
              </button>
              <button 
                className="btn-sm" 
                style={{ padding: '4px 12px', background: '#00f0ff', color: '#000', fontWeight: 'bold' }}
                onClick={() => addTextZone()}
              >
                ➕ Add Text
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
            <div 
              onClick={() => setSelectedZoneId('logo')}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: selectedZoneId === 'logo' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: selectedZoneId === 'logo' ? '1px solid #00f0ff' : '1px solid transparent',
                borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
              }}
            >
              <span style={{ fontWeight: selectedZoneId === 'logo' ? 600 : 400, color: '#fff' }}>
                LOGO
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLogo({ url: logo?.url ? null : brandTheme.logoWhiteUrl });
                }}
                style={{
                  background: 'none', border: 'none', color: logo?.url ? '#fff' : '#666',
                  cursor: 'pointer', fontSize: '14px', padding: 0
                }}
              >
                {logo?.url ? '👁' : '🚫'}
              </button>
            </div>
            
            {Object.entries(zones).map(([zId, zData]) => (
              <div 
                key={zId}
                onClick={() => setSelectedZoneId(zId)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: selectedZoneId === zId ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: selectedZoneId === zId ? '1px solid #00f0ff' : '1px solid transparent',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                }}
              >
                <span style={{ fontWeight: selectedZoneId === zId ? 600 : 400, color: '#fff' }}>
                  {zData.type === 'text' ? (zData.text || 'TEXT LAYER').substring(0, 15) + ((zData.text || '').length > 15 ? '...' : '') : zId.toUpperCase()}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoneStyle(zId, { visible: zData.visible === false ? true : false });
                  }}
                  style={{
                    background: 'none', border: 'none', color: zData.visible !== false ? '#fff' : '#666',
                    cursor: 'pointer', fontSize: '14px', padding: 0
                  }}
                >
                  {zData.visible !== false ? '👁' : '🚫'}
                </button>
              </div>
            ))}
          </div>

          <h2 className="cp-section-title">Layer Properties</h2>
          {!selectedZoneId ? (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
              Select a layer above or click text on the image to edit.
            </div>
          ) : selectedZoneId === 'logo' ? (
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Select Logo from Profile</label>
                </div>
                <select 
                  value={logo?.url === brandTheme.logoWhiteUrl ? 'white' : (logo?.url === brandTheme.logoColoredUrl ? 'colored' : 'none')} 
                  onChange={(e) => {
                    if (e.target.value === 'white') setLogo({ url: brandTheme.logoWhiteUrl });
                    else if (e.target.value === 'colored') setLogo({ url: brandTheme.logoColoredUrl });
                    else setLogo({ url: null });
                  }}
                  style={{ width: '100%', marginBottom: '8px' }}
                >
                  <option value="none">No Logo</option>
                  {brandTheme.logoWhiteUrl && <option value="white">White Logo</option>}
                  {brandTheme.logoColoredUrl && <option value="colored">Colored Logo</option>}
                </select>
              </div>
              {logo?.url && (
                <>
                  <div className="cp-group">
                    <div className="cp-row">
                      <label className="cp-label">Blend Mode</label>
                    </div>
                    <select value={logo.blendMode} onChange={(e) => setLogo({ blendMode: e.target.value })}>
                      <option value="normal">Normal</option>
                      <option value="multiply">Multiply</option>
                      <option value="screen">Screen</option>
                      <option value="overlay">Overlay</option>
                      <option value="luminosity">Luminosity</option>
                      <option value="color">Color</option>
                    </select>
                  </div>
                  <div className="cp-group">
                    <div className="cp-row">
                      <label className="cp-label">Opacity</label>
                      <span className="cp-val">{logo.opacity}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="1" value={logo.opacity} onChange={(e) => setLogo({ opacity: Number(e.target.value) })} />
                  </div>
                  <div className="cp-group">
                    <div className="cp-row">
                      <label className="cp-label">Scale</label>
                      <span className="cp-val">{logo.scale?.toFixed(2)}x</span>
                    </div>
                    <input type="range" min="0.1" max="3" step="0.05" value={logo.scale} onChange={(e) => setLogo({ scale: Number(e.target.value) })} />
                  </div>
                  <div className="cp-group">
                    <div className="cp-row">
                      <label className="cp-label">Position X</label>
                      <span className="cp-val">{Number.isFinite(logo.x) ? logo.x.toFixed(1) : 50}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="0.5" value={Number.isFinite(logo.x) ? logo.x : 50} onChange={(e) => setLogo({ x: Number(e.target.value) })} />
                  </div>
                  <div className="cp-group">
                    <div className="cp-row">
                      <label className="cp-label">Position Y</label>
                      <span className="cp-val">{Number.isFinite(logo.y) ? logo.y.toFixed(1) : 15}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="0.5" value={Number.isFinite(logo.y) ? logo.y : 15} onChange={(e) => setLogo({ y: Number(e.target.value) })} />
                  </div>
                </>
              )}
            </div>
          ) : (
            zones[selectedZoneId] ? (
              <ZoneControl 
                zoneId={selectedZoneId} 
                zoneData={zones[selectedZoneId]} 
                onChangeText={setZoneText} 
                onChangeStyle={setZoneStyle} 
                onRemoveZone={removeTextZone}
              />
            ) : (
              <div style={{ fontSize: '12px', color: '#888' }}>Zone not available in this template.</div>
            )

          )}
        </div>

      </div>
    </aside>
  );
}
