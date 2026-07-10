import React from 'react';
import { SharedLayers, TextZone } from './SharedLayers';
import './templates.css';

export default function T6_RoyalFeast({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#0d0b07' }}>
      <SharedLayers tpl={tpl} />
      
      {/* Glow/Dark gradient overlay to ensure text pops */}
      <div className="tpl-6-gradient" />

      {/* Gold Particles Overlay with screen blending */}
      <img src="https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783686525909-gold-particles.jpg?alt=media" className="tpl-6-particles" alt="" crossOrigin="anonymous" />
      
      {/* Main Text Content */}
      <div className="tpl-6-upper">
        <TextZone id="pre" zone={zones.pre} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ marginTop: '30px', marginBottom: '-5px' }} />
        
        <div className="tpl-6-text-block">
          <TextZone id="h1" zone={zones.h1} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ lineHeight: '1.0', marginBottom: '-10px' }} />
          <TextZone id="h2" zone={zones.h2} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ lineHeight: '1.1' }} />
        </div>
        
        {/* Elegant Gold Swirl */}
        <svg className="tpl-6-swirl" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path d="M15,15 Q40,-5 60,15 T90,5" fill="none" stroke="#e8c37d" strokeWidth="0.8" strokeLinecap="round" opacity="0.8"/>
          <path d="M20,16 Q45,-2 58,16" fill="none" stroke="#f6d365" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" filter="drop-shadow(0px 0px 4px rgba(246, 211, 101, 0.8))"/>
          <path d="M40,23 Q60,10 75,22" fill="none" stroke="#e8c37d" strokeWidth="0.5" strokeLinecap="round" opacity="0.5"/>
        </svg>
      </div>
      
      <div className="tpl-6-lower-gradient" />
    </div>
  );
}
