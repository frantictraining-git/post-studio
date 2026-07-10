import React from 'react';
import { SharedLayers, TextZone } from './SharedLayers';
import './templates.css';

export default function T9_MorningMood({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#1a1a1a' }}>
      <SharedLayers tpl={tpl} />
      
      <div className="tpl-9-gradient" />

      <div className="tpl-9-content">
        <TextZone 
          id="h1" 
          zone={zones.h1} 
          selectedZoneId={selectedZoneId} 
          onSelect={onSelectZone} 
          onTextChange={onTextChange} 
          styleOverrides={{ lineHeight: 0.8 }}
        />
        <TextZone 
          id="tagline" 
          zone={zones.tagline} 
          selectedZoneId={selectedZoneId} 
          onSelect={onSelectZone} 
          onTextChange={onTextChange} 
          styleOverrides={{ marginTop: '10px' }}
        />
      </div>

      <div className="tpl-contact-footer">
        <TextZone id="phone" zone={zones.phone} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
        <TextZone id="location" zone={zones.location} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
    </div>
  );
}
