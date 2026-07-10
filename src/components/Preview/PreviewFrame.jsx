import React, { useRef, useState } from 'react';
import './PreviewFrame.css';
import T1_DishSpotlight from '../templates/T1_DishSpotlight';
import T2_RoyalStatement from '../templates/T2_RoyalStatement';
import T3_AmbientMood from '../templates/T3_AmbientMood';
import T4_FloatingVerse from '../templates/T4_FloatingVerse';
import T5_ArtisanFrame from '../templates/T5_ArtisanFrame';
import { exportToPNG } from '../../utils/canvasExport';

const TEMPLATES = [
  T1_DishSpotlight,
  T2_RoyalStatement,
  T3_AmbientMood,
  T4_FloatingVerse,
  T5_ArtisanFrame,
];

const CATEGORIES = ['Minimal', 'Modern', 'Light', 'Dark', 'Gold', 'Green', 'Black'];

export default function PreviewFrame({ state, activeTpl, setHero, setFg, setLogo, setActiveTemplate, setSelectedZoneId, setZoneText, TEMPLATE_DEFAULTS }) {
  const ActiveComponent = TEMPLATES[state.activeTemplate];
  const frameRef = useRef(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [dragLayer, setDragLayer] = useState(null); // 'hero', 'fg', or 'logo'
  const [activeCategory, setActiveCategory] = useState(activeTpl.category || 'Minimal');
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPNG(activeTpl, state.activeTemplate);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export image. Check console for details.");
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
    
    if (dragLayer === 'hero' && activeTpl.hero.url) {
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
          <button 
            className="pv-export-btn" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export High-Res PNG'}
          </button>
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
          style={{ cursor: dragLayer ? 'grabbing' : activeTpl.hero.url ? 'grab' : 'default' }}
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
          Preview is scaled down. Export is full 1080×1350px. 
          {activeTpl.hero.url && " Drag image to reposition."}
        </div>
      </div>
    </div>
  );
}
