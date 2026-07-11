import React from 'react';
import { SharedLayers, TextZone, LayoutWrapper } from './SharedLayers';
import './templates.css';

export default function T13_MorningMood({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#1a1a1a' }}>
      <SharedLayers tpl={tpl} />
      <LayoutWrapper category={tpl.category}>
      <div className="tpl-13-gradient" />
      <div className="tpl-13-content">
        <TextZone id="h1" zone={zones.h1} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ width: '100%', lineHeight: 0.8 }} />
        <TextZone id="tagline" zone={zones.tagline} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ width: '100%', marginTop: '5px' }} />
      </div>
      <div className="tpl-contact-footer">
        <TextZone id="phone" zone={zones.phone} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
        <TextZone id="location" zone={zones.location} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
    
      </LayoutWrapper></div>
  );
}
