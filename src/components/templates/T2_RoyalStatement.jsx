import React from 'react';
import { SharedLayers, TextZone, LayoutWrapper } from './SharedLayers';
import './templates.css';

export default function T2_RoyalStatement({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#0d0b07' }}>
      <SharedLayers tpl={tpl} />
      <LayoutWrapper category={tpl.category}>
      
      <div className="tpl-2-upper">
        <TextZone id="pre" zone={zones.pre} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginTop: '30px', marginBottom: '-5px' }} maxWidth="90%" />
        
        <svg className="tpl-2-swirl" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path d="M10,20 Q37,0 50,20 T90,20" fill="none" stroke="#A28242" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
          <path d="M14,21 Q38,2 50,21" fill="none" stroke="#A28242" strokeWidth="0.5" strokeLinecap="round" opacity="0.3"/>
        </svg>
        
        <div className="tpl-2-text">
          <TextZone id="h1" zone={zones.h1} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ lineHeight: '1.1' }} maxWidth="90%" />
          <TextZone id="h2" zone={zones.h2} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ lineHeight: '1.1' }} maxWidth="90%" />
        </div>
      </div>
      
      <div className="tpl-2-lower-gradient" />
    
      </LayoutWrapper></div>
  );
}
