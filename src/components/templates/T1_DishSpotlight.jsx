import React from 'react';
import { SharedLayers, TextZone } from './SharedLayers';
import './templates.css';

export default function T1_DishSpotlight({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#15392D' }}>
      <SharedLayers tpl={tpl} />
      
      <div className="tpl-1-logo">
        <TextZone id="ornament" zone={zones.ornament} className="tpl-1-ornament" selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
        <TextZone id="brandSub" zone={zones.brandSub} className="tpl-1-logo-sub" selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
        <TextZone id="eyebrow" zone={zones.eyebrow} className="tpl-1-logo-name" selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
      
      <div className="tpl-1-text">
        <TextZone id="h1" zone={zones.h1} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginBottom: '6px' }} maxWidth="80%" />
        <TextZone id="h2" zone={zones.h2} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginBottom: '16px' }} maxWidth="80%" />
        <TextZone id="tagline" zone={zones.tagline} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} maxWidth="80%" />
      </div>
      
      <div className="tpl-1-footer">
        <TextZone id="footer" zone={zones.footer} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
    </div>
  );
}
