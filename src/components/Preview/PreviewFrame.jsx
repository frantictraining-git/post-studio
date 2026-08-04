import React, { useRef, useState } from 'react';
import './PreviewFrame.css';
import BaseTemplate from '../templates/BaseTemplate';
import { exportTemplate, getPreviewImage } from '../../utils/canvasExport';

const TEMPLATES = [BaseTemplate];

const CATEGORIES = ['Editorial', 'Arch', 'Glassmorphism', 'Classic'];

export default function PreviewFrame({
  state, activeTpl,
  setHero, setFg, setLogo, setActiveTemplate, setSelectedZoneId, setZoneText, setZoneStyle,
  TEMPLATE_DEFAULTS,
  // Project props
  onSave, onOpenProjects, onRenameProject, saveStatus, currentProjectName,
}) {
  const ActiveComponent = TEMPLATES[state.activeTemplate] || BaseTemplate;
  const frameRef = useRef(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [dragLayer, setDragLayer] = useState(null); // 'hero', 'fg', or 'logo'
  const [activeCategory, setActiveCategory] = useState(activeTpl.category || 'Editorial');
  const [fullPreviewSrc, setFullPreviewSrc] = useState(null);
  
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

  React.useEffect(() => {
    if (!CATEGORIES.includes(activeCategory)) {
      setActiveCategory('Editorial');
    }
  }, [activeCategory]);
  
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

  const handleMouseDown = (e, layer) => {
    e.preventDefault();
    setDragLayer(layer);
  };
  
  const handleMouseMove = (e) => {
    if (!dragLayer || !frameRef.current) return;
    
    const rect = frameRef.current.getBoundingClientRect();
    const dx = (e.movementX / rect.width) * 100;
    const dy = (e.movementY / rect.height) * 100;
    
    if (dragLayer === 'hero' && activeTpl.hero.url && !activeTpl.hero.locked) {
      setHero({ 
        x: activeTpl.hero.x + dx,
        y: activeTpl.hero.y + dy
      });
    } else if (dragLayer === 'fg' && activeTpl.fg.url) {
      setFg({ 
        x: activeTpl.fg.x + dx,
        y: activeTpl.fg.y + dy
      });
    } else if (dragLayer === 'logo' && activeTpl.logo?.url) {
      setLogo({ 
        x: activeTpl.logo.x + dx,
        y: activeTpl.logo.y + dy
      });
    }
  };
  
  const handleMouseUp = () => {
    setDragLayer(null);
  };

  const templatesInCategory = TEMPLATE_DEFAULTS.map((t, idx) => ({...t, idx})).filter(t => t.category === activeCategory);

  return (
    <div 
      className="pv-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseDown={(e) => {
        // clear text selection if clicking background
        if (!e.target.closest('span[contenteditable]') && !e.target.closest('.t-logo-img') && !e.target.closest('.t-fg-img') && !e.target.closest('.pv-toolbar')) {
           setSelectedZoneId(null);
        }
      }}
    >
      <div className="pv-toolbar">
        <div className="pv-toolbar-top">
          <div className="pv-tabs">
            <button className="pv-tab active">Instagram (4:5)</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="pv-projects-btn"
              onClick={onOpenProjects}
              title="Browse saved projects"
            >
              📂 Projects
            </button>

            <button
              className="pv-save-btn"
              onClick={onSave}
              disabled={saveStatus === 'saving'}
              title="Save now"
            >
              💾 Save
            </button>

            <div className="pv-header-actions" style={{ display: 'flex', gap: '4px' }}>
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
        
        {/* Category Tabs */}
        <div className="pv-categories">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`pv-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Selector for Category */}
        {templatesInCategory.length > 0 ? (
          <div className="pv-templates-row">
            {templatesInCategory.map(t => (
              <button 
                key={t.id}
                className={`pv-tpl-mini-btn ${state.activeTemplate === t.idx ? 'active' : ''}`}
                onClick={() => setActiveTemplate(t.idx)}
              >
                <span className="pv-tpl-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="pv-templates-empty">
            No templates in this category yet.
          </div>
        )}
      </div>
      
      <div className="pv-workspace">
        <div 
          className="pv-frame" 
          ref={frameRef}
          style={{ cursor: dragLayer ? 'grabbing' : (activeTpl.hero.url && !activeTpl.hero.locked) ? 'grab' : 'default' }}
          onMouseDown={(e) => {
             if (e.target.closest('.t-logo-img')) handleMouseDown(e, 'logo');
             else if (e.target.closest('.t-fg-img')) handleMouseDown(e, 'fg');
             else handleMouseDown(e, 'hero');
          }}
        >
          {ActiveComponent && (
            <ActiveComponent 
              tpl={activeTpl} 
              selectedZoneId={state.selectedZoneId}
              onSelectZone={setSelectedZoneId}
              onTextChange={setZoneText}
            />
          )}
        </div>
        
        <div className="pv-hint">
          Preview is scaled down. Export is full 2000×2500px. 
          {activeTpl.hero.url && " Drag image to reposition."}
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
