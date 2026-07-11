import React from 'react';
import { SharedLayers, TextZone, LayoutWrapper } from './SharedLayers';
import './templates.css';

export default function T3_AmbientMood({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#0a1a12' }}>
      <SharedLayers tpl={tpl} />
      <LayoutWrapper category={tpl.category}>
      
      <div className="tpl-3-top">
        <TextZone id="handle" as="span" zone={zones.handle} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} maxWidth="90%" />
        {zones.eyebrow && zones.eyebrow.visible !== false && (
          <div className="tpl-3-badge">
            <TextZone id="eyebrow" as="span" zone={zones.eyebrow} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
          </div>
        )}
      </div>
      
      <div className="tpl-3-bottom">
        <TextZone id="h1" zone={zones.h1} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginBottom: '8px' }} />
        <TextZone id="tagline" zone={zones.tagline} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
    
      </LayoutWrapper></div>
  );
}
