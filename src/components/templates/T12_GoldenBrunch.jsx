import React from 'react';
import { SharedLayers, TextZone } from './SharedLayers';
import './templates.css';

export default function T12_GoldenBrunch({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#1a1a1a' }}>
      <SharedLayers tpl={tpl} />
      <div className="tpl-12-gradient" />
      <div className="tpl-12-content">
        <TextZone id="h2" zone={zones.h2} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ alignSelf: 'center', marginBottom: '-10px', zIndex: 2, position: 'relative' }} />
        <TextZone id="h1" zone={zones.h1} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ alignSelf: 'center', position: 'relative', zIndex: 1, lineHeight: 0.9 }} />
        <div className="tpl-12-bottom-row">
          <TextZone id="h3" zone={zones.h3} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginTop: '-20px', marginRight: '10px', zIndex: 2, position: 'relative' }} />
          <TextZone id="tagline" zone={zones.tagline} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ maxWidth: '140px', marginTop: '10px' }} />
        </div>
      </div>
      <div className="tpl-contact-footer">
        <TextZone id="phone" zone={zones.phone} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
        <TextZone id="location" zone={zones.location} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
    </div>
  );
}
