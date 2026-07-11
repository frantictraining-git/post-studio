import React from 'react';
import { SharedLayers, TextZone, LayoutWrapper } from './SharedLayers';
import './templates.css';

export default function T14_FuelYourMorning({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#1a1a1a' }}>
      <SharedLayers tpl={tpl} />
      <LayoutWrapper category={tpl.category}>
      <div className="tpl-14-gradient" />
      
      <div className="tpl-14-content">
        <TextZone id="h1" zone={zones.h1} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ lineHeight: 1.1 }} />
        <div style={{ display: 'inline-block', position: 'relative', marginTop: '-5px' }}>
          <TextZone id="h2" zone={zones.h2} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ position: 'relative', zIndex: 2 }} />
          <div style={{ height: '3px', background: '#FFCA28', width: '100%', marginTop: '-15px', position: 'relative', zIndex: 1 }} />
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <TextZone id="h3" zone={zones.h3} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ lineHeight: 1.5 }} />
        </div>
        
        <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TextZone id="h4" zone={zones.h4} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ lineHeight: 1 }} />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFCA28" strokeWidth="1.5" style={{ flexShrink: 0 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </div>
      </div>

      <div className="tpl-14-side">
        <TextZone id="tagline" zone={zones.tagline} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ lineHeight: 1.2, textAlign: 'right' }} />
        <svg style={{ transform: 'rotate(180deg)' }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
      </div>

      <div className="tpl-contact-footer">
        <TextZone id="phone" zone={zones.phone} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
        <TextZone id="location" zone={zones.location} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} />
      </div>
    
      </LayoutWrapper></div>
  );
}
