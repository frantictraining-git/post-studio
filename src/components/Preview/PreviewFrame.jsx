import React, { useRef, useState } from 'react';
import './PreviewFrame.css';
import FabricCanvas from '../templates/FabricCanvas';
import { exportTemplate, getPreviewImage } from '../../utils/canvasExport';

export default function PreviewFrame({
  state, activeTpl,
  setHero, setFg, setLogo, setSelectedZoneId, setZoneText, setZoneStyle, updateGuides,
  // Project props
  onSave, onOpenProjects, onRenameProject, onNewProject, saveStatus, currentProjectName,
  // Undo/Redo
  undo, redo, canUndo, canRedo,
  removeTextZone
}) {
  const frameRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [fullPreviewSrc, setFullPreviewSrc] = useState(null);
  const [showRulers, setShowRulers] = useState(false);
  
  // Rename state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const nameInputRef = useRef(null);

  const startNameEdit = () => {
    setNameInput(currentProjectName || activeTpl?.zones?.heading?.text || 'Untitled Post');
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const finishNameEdit = () => {
    if (nameInput.trim()) {
      onRenameProject(nameInput.trim());
    }
    setIsEditingName(false);
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      await exportTemplate(activeTpl, format, currentProjectName || activeTpl?.zones?.heading?.text || 'export', state.brandTheme);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export image: " + (err.message || err));
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = async () => {
    setIsExporting(true);
    try {
      const src = await getPreviewImage(activeTpl, state.brandTheme);
      setFullPreviewSrc(src);
    } catch (err) {
      console.error("Preview failed:", err);
      alert("Failed to generate preview: " + (err.message || err));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pv-container">
      <div className="pv-toolbar">
        <div className="pv-toolbar-top">
          <div className="pv-tabs">
            <button className="pv-tab active">Instagram (4:5)</button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="pv-projects-btn"
              onClick={onNewProject}
              title="Start a new blank project"
              style={{ background: '#333' }}
            >
              ➕ New Project
            </button>

            <button
              className="pv-projects-btn"
              onClick={onOpenProjects}
              title="Browse saved projects"
            >
              📂 Open
            </button>

            <button
              className="pv-save-btn"
              onClick={onSave}
              disabled={saveStatus === 'saving'}
              title="Save now"
            >
              💾 Save
            </button>
          </div>
        </div>

        <div className="pv-toolbar-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="pv-project-status" onClick={startNameEdit} style={{ cursor: 'pointer' }}>
            {isEditingName ? (
              <input
                ref={nameInputRef}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={finishNameEdit}
                onKeyDown={e => e.key === 'Enter' && finishNameEdit()}
                style={{ background: '#333', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}
              />
            ) : (
              <span className="pv-project-name" title="Click to rename">
                {currentProjectName || activeTpl?.zones?.heading?.text || 'Untitled Post'} ✎
              </span>
            )}
            {saveStatus === 'saving' && <span className="pv-save-status" style={{color: '#a28242'}}>Saving...</span>}
            {saveStatus === 'saved' && <span className="pv-save-status" style={{color: '#4CAF50'}}>Saved ✓</span>}
            {saveStatus === 'error' && <span className="pv-save-status" style={{color: '#F44336'}}>Save Error ✗</span>}
          </div>

          <div className="pv-header-actions" style={{ display: 'flex', gap: '4px' }}>
            <button 
              className="pv-export-btn" 
              onClick={() => setShowRulers(r => !r)} 
              style={{ backgroundColor: showRulers ? '#a28242' : '#1a1a1a', color: '#fff', border: `1px solid ${showRulers ? '#a28242' : '#333'}`, padding: '10px 12px', marginRight: '8px' }}
              title="Toggle Rulers & Guides"
            >
              📏
            </button>
            <button 
              className="pv-export-btn" 
              onClick={undo} 
              disabled={!canUndo} 
              style={{ backgroundColor: '#1a1a1a', color: canUndo ? '#fff' : '#666', border: '1px solid #333', padding: '10px 12px' }}
              title="Undo"
            >
              ↩️
            </button>
            <button 
              className="pv-export-btn" 
              onClick={redo} 
              disabled={!canRedo} 
              style={{ backgroundColor: '#1a1a1a', color: canRedo ? '#fff' : '#666', border: '1px solid #333', padding: '10px 12px', marginRight: '8px' }}
              title="Redo"
            >
              ↪️
            </button>
            <button className="pv-export-btn" onClick={handlePreview} disabled={isExporting} style={{ backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333' }}>
              {isExporting ? '...' : '🔍 Preview'}
            </button>
            <button className="pv-export-btn" onClick={() => handleExport('png')} disabled={isExporting}>
              PNG
            </button>
            <button className="pv-export-btn" onClick={() => handleExport('jpeg')} disabled={isExporting}>
              JPG
            </button>
            <button className="pv-export-btn" onClick={() => handleExport('pdf')} disabled={isExporting}>
              PDF
            </button>
          </div>
        </div>
      </div>
      
      <div className="pv-workspace">
        <div className="pv-frame" ref={frameRef}>
          <FabricCanvas
            tpl={activeTpl}
            selectedZoneId={state.selectedZoneId}
            onSelectZone={setSelectedZoneId}
            onTextChange={setZoneText}
            setHero={setHero}
            setFg={setFg}
            setLogo={setLogo}
            setZoneStyle={setZoneStyle}
            updateGuides={updateGuides}
            removeTextZone={removeTextZone}
            showRulers={showRulers}
          />
        </div>
        
        <div className="pv-hint">
          Preview is scaled down. Export is full 2000×2500px. 
          {activeTpl.hero?.url && " Drag image to reposition."}
        </div>
      </div>

      {/* Full Screen Preview Modal */}
      {fullPreviewSrc && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => setFullPreviewSrc(null)}
          title="Click anywhere to close"
        >
          <img 
            src={fullPreviewSrc} 
            alt="Full size preview" 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              objectFit: 'contain', 
              boxShadow: '0 0 40px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)'
            }} 
          />
        </div>
      )}
    </div>
  );
}
