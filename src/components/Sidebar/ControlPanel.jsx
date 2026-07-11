import React from 'react';
import './ControlPanel.css';
import { FONT_OPTIONS, GRADE_PRESETS } from '../../hooks/useStudio';

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
              const url = URL.createObjectURL(e.target.files[0]);
              onUpload(url);
              e.target.value = null;
            }
          }} 
          hidden 
        />
      </label>
    </div>
  );
}

function ZoneControl({ zoneId, zoneData, onChangeText, onChangeStyle }) {
  const isText = zoneData.text !== undefined;
  
  return (
    <div className="cp-zone">
      <div className="cp-zone-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{zoneId === 'eyebrow' ? 'Secondary / Eyebrow Text' : zoneId}</span>
        <label className="toggle" title="Toggle Visibility">
          <input 
            type="checkbox" 
            checked={zoneData.visible !== false} 
            onChange={(e) => onChangeStyle(zoneId, { visible: e.target.checked })} 
          />
          <div className="toggle-track"></div>
        </label>
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
        
        <div className="btn-group" style={{ flex: 1 }}>
          <button className={`btn-sm ${zoneData.italic ? 'active' : ''}`} onClick={() => onChangeStyle(zoneId, { italic: !zoneData.italic })}>I</button>
          <button className={`btn-sm ${zoneData.caps ? 'active' : ''}`} onClick={() => onChangeStyle(zoneId, { caps: !zoneData.caps })}>AA</button>
        </div>
      </div>

      <div className="cp-row" style={{ marginTop: 8 }}>
        <label className="cp-label">Pos X</label>
        <input type="range" min="-1000" max="1000" value={zoneData.x || 0} onChange={(e) => onChangeStyle(zoneId, { x: parseInt(e.target.value) })} style={{ flex: 1 }} />
      </div>
      <div className="cp-row" style={{ marginTop: 4 }}>
        <label className="cp-label">Pos Y</label>
        <input type="range" min="-1000" max="1000" value={zoneData.y || 0} onChange={(e) => onChangeStyle(zoneId, { y: parseInt(e.target.value) })} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

export default function ControlPanel({ 
  state, 
  activeTpl, 
  setActiveTemplate, 
  setHero, 
  setFg, 
  setLogo,
  setGrade, 
  setZoneText, 
  setZoneStyle,
  setSelectedZoneId,
  setBrandTheme,
  saveClient,
  loadClient,
  TEMPLATE_DEFAULTS,
  onOpenBrandManager
}) {
  const { hero, fg, logo, grade, zones } = activeTpl;
  const { brandTheme, selectedZoneId } = state;
  const [clientProfilesExpanded, setClientProfilesExpanded] = React.useState(false);

  return (
    <aside className="cp-sidebar">
      <div className="cp-header">
        <h1>East Eatery</h1>
        <p>Post Studio</p>
      </div>

      <div className="cp-section">
        <h2 className="cp-section-title">Template</h2>
        <div className="tpl-grid">
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
            </>
          )}
        </div>

        {/* Color Grade */}
        <div className="cp-section">
          <h2 className="cp-section-title">Color Grade</h2>
          <div className="cp-row" style={{ marginBottom: 12 }}>
            <select 
              value={grade.preset} 
              onChange={(e) => setGrade({ preset: e.target.value })}
              style={{ flex: 1 }}
            >
              {Object.entries(GRADE_PRESETS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            {grade.preset === 'custom' && (
              <input 
                type="color" 
                value={grade.custom} 
                onChange={(e) => setGrade({ custom: e.target.value })} 
                style={{ marginLeft: 8 }}
              />
            )}
          </div>
          
          <div className="cp-group">
            <div className="cp-row">
              <label className="cp-label">Intensity</label>
              <span className="cp-val">{grade.intensity}%</span>
            </div>
            <input type="range" min="0" max="100" step="1" value={grade.intensity} onChange={(e) => setGrade({ intensity: Number(e.target.value) })} />
          </div>
        </div>

        {/* Logo Controls */}
        <div className="cp-section">
          <h2 className="cp-section-title">Logo Controls</h2>
          <div className="cp-group">
            <div className="cp-row">
              <label className="cp-label">Scale</label>
              <span className="cp-val">{logo.scale.toFixed(2)}x</span>
            </div>
            <input type="range" min="0.1" max="2.0" step="0.05" value={logo.scale} onChange={(e) => setLogo({ scale: Number(e.target.value) })} />
          </div>
          <div className="cp-group">
            <div className="cp-row">
              <label className="cp-label">X Position</label>
              <span className="cp-val">{logo.x}%</span>
            </div>
            <input type="range" min="0" max="100" step="1" value={logo.x} onChange={(e) => setLogo({ x: Number(e.target.value) })} />
          </div>
          <div className="cp-group">
            <div className="cp-row">
              <label className="cp-label">Y Position</label>
              <span className="cp-val">{logo.y}%</span>
            </div>
            <input type="range" min="0" max="100" step="1" value={logo.y} onChange={(e) => setLogo({ y: Number(e.target.value) })} />
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

        {/* Logo Layer */}
        <div className="cp-section">
          <h2 className="cp-section-title">Logo Layer</h2>
          <ImageUpload 
            label="Logo Element" 
            hasImage={!!logo?.url}
            onUpload={(url) => setLogo({ url })}
            onClear={() => setLogo({ url: null })}
          />
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
                  <span className="cp-val">{logo.scale.toFixed(2)}x</span>
                </div>
                <input type="range" min="0.1" max="3" step="0.05" value={logo.scale} onChange={(e) => setLogo({ scale: Number(e.target.value) })} />
              </div>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Position X</label>
                  <span className="cp-val">{logo.x.toFixed(0)}%</span>
                </div>
                <input type="range" min="-200" max="300" step="1" value={logo.x} onChange={(e) => setLogo({ x: Number(e.target.value) })} />
              </div>
              <div className="cp-group">
                <div className="cp-row">
                  <label className="cp-label">Position Y</label>
                  <span className="cp-val">{logo.y.toFixed(0)}%</span>
                </div>
                <input type="range" min="-200" max="300" step="1" value={logo.y} onChange={(e) => setLogo({ y: Number(e.target.value) })} />
              </div>
            </>
          )}
        </div>

        {/* Text Zones */}
        <div className="cp-section">
          <h2 className="cp-section-title">Template Layers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
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
                  {zId.toUpperCase()}
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

          <h2 className="cp-section-title">Text Properties</h2>
          {!selectedZoneId ? (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
              Select a layer above or click text on the image to edit.
            </div>
          ) : (
            zones[selectedZoneId] ? (
              <ZoneControl 
                key={selectedZoneId}
                zoneId={selectedZoneId}
                zoneData={zones[selectedZoneId]}
                onChangeText={setZoneText}
                onChangeStyle={setZoneStyle}
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
