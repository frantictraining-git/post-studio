import React from 'react';
import { SharedLayers, TextZone, LayoutWrapper } from './SharedLayers';
import './templates.css';

export default function T7_BreakfastBliss({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#1a1a1a' }}>
      <SharedLayers tpl={tpl} />
      <LayoutWrapper category={tpl.category}>
      
      {/* Top subtle vignette for text legibility */}
      <div className="tpl-7-gradient-top" />

      {/* Main Content Area */}
      <div className="tpl-7-content">
        <div className="tpl-7-typography">
          <TextZone 
            id="eyebrow" 
            zone={zones.eyebrow} 
            selectedZoneId={selectedZoneId} 
            onSelect={onSelectZone} 
            onTextChange={onTextChange} 
            styleOverrides={{ marginBottom: '-30px', zIndex: 2, position: 'relative' }} 
          />
          <TextZone 
            id="h1" 
            zone={zones.h1} 
            selectedZoneId={selectedZoneId} 
            onSelect={onSelectZone} 
            onTextChange={onTextChange} 
            styleOverrides={{ position: 'relative', zIndex: 1 }}
          />
          <div className="tpl-7-bottom-row">
            <TextZone 
              id="h2" 
              zone={zones.h2} 
              selectedZoneId={selectedZoneId} 
              onSelect={onSelectZone} 
              onTextChange={onTextChange} 
              styleOverrides={{ marginTop: '-40px', marginRight: '10px', zIndex: 2, position: 'relative' }} 
            />
            <TextZone 
              id="tagline" 
              zone={zones.tagline} 
              selectedZoneId={selectedZoneId} 
              onSelect={onSelectZone} 
              onTextChange={onTextChange} 
              styleOverrides={{ textAlign: 'left', maxWidth: '140px', lineHeight: '1.2' }} 
            />
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient for Contact Info */}
      <div className="tpl-7-gradient-bottom" />
      
      <div className="tpl-7-footer">
        <TextZone 
          id="phone" 
          zone={zones.phone} 
          selectedZoneId={selectedZoneId} 
          onSelect={onSelectZone} 
          onTextChange={onTextChange} 
        />
        <TextZone 
          id="location" 
          zone={zones.location} 
          selectedZoneId={selectedZoneId} 
          onSelect={onSelectZone} 
          onTextChange={onTextChange} 
        />
      </div>
    
      </LayoutWrapper></div>
  );
}
