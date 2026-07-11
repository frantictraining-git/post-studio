import React from 'react';
import { SharedLayers, TextZone, LayoutWrapper } from './SharedLayers';
import './templates.css';

export default function T5_ArtisanFrame({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#0d0d10' }}>
      <SharedLayers tpl={tpl} />
      <LayoutWrapper category={tpl.category}>
      
      <div className="tpl-5-logo">
        <TextZone id="eyebrow" zone={zones.eyebrow} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginBottom: '2px' }} />
        <TextZone id="brandSub" zone={zones.brandSub} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
      
      <div className="tpl-5-bottom-glow" />
      
      <div className="tpl-5-text">
        <TextZone id="h1" zone={zones.h1} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginBottom: '-2px' }} />
        <TextZone id="h2" zone={zones.h2} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
    
      </LayoutWrapper></div>
  );
}
