import React from 'react';
import { SharedLayers, TextZone } from './SharedLayers';
import './templates.css';

export default function T4_FloatingVerse({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap tpl-4-wrap" style={{ backgroundColor: '#0a150e' }}>
      <SharedLayers tpl={tpl} />
      
      <div className="tpl-4-top">
        <TextZone id="handle" as="span" zone={zones.handle} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} maxWidth="90%" />
        {zones.eyebrow && zones.eyebrow.visible !== false && (
          <div className="tpl-4-badge">
            <TextZone id="eyebrow" as="span" zone={zones.eyebrow} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
          </div>
        )}
      </div>
      
      <div className="tpl-4-verse">
        <TextZone id="h1" zone={zones.h1} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginBottom: '8px' }} />
        <TextZone id="h2" zone={zones.h2} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginBottom: '14px' }} />
        <TextZone id="tagline" zone={zones.tagline} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
    </div>
  );
}
