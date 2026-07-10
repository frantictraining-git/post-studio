import React from 'react';
import { SharedLayers, TextZone } from './SharedLayers';
import './templates.css';

export default function T10_PerfectHarmony({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#1a1a1a' }}>
      <SharedLayers tpl={tpl} />
      
      <div className="tpl-10-gradient" />

      <div className="tpl-10-content">
        <TextZone id="eyebrow" zone={zones.eyebrow} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
        
        <div style={{ position: 'relative', marginTop: '20px' }}>
          <TextZone 
            id="h2" 
            zone={zones.h2} 
            selectedZoneId={selectedZoneId} 
            onSelect={onSelectZone} 
            onTextChange={onTextChange} 
            styleOverrides={{ position: 'absolute', top: '-40px', left: '0', right: '0', zIndex: 2 }}
          />
          <TextZone 
            id="h1" 
            zone={zones.h1} 
            selectedZoneId={selectedZoneId} 
            onSelect={onSelectZone} 
            onTextChange={onTextChange} 
            styleOverrides={{ zIndex: 1, position: 'relative' }}
          />
        </div>
        
        <div className="tpl-10-box">
          <TextZone id="tagline" zone={zones.tagline} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
        </div>
        
        <TextZone id="website" zone={zones.website} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginTop: '20px' }} />
      </div>

      <div className="tpl-contact-footer-center">
        <TextZone id="phone" zone={zones.phone} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
        <TextZone id="location" zone={zones.location} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
    </div>
  );
}
