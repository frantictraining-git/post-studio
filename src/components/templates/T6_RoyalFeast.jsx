import React from 'react';
import { SharedLayers, TextZone, LayoutWrapper } from './SharedLayers';
import './templates.css';

export default function T6_RoyalFeast({ tpl, selectedZoneId, onSelectZone, onTextChange }) {
  const { zones } = tpl;
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#000000' }}>
      <SharedLayers tpl={tpl} />
      <LayoutWrapper category={tpl.category}>
      
      {/* Deep cinematic gradient mask */}
      <div className="tpl-6-gradient" />

      {/* Magical glowing sparks via Firebase */}
      <img src="https://firebasestorage.googleapis.com/v0/b/post-studio-1508a.firebasestorage.app/o/assets%2F1783686943337-glowing_golden_sparks.jpg?alt=media" className="tpl-6-particles" alt="" crossOrigin="anonymous" />
      
      {/* Main Text Content */}
      <div className="tpl-6-upper">
        <TextZone id="pre" zone={zones.pre} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ fontSize: '18px', marginBottom: '0px', marginTop: '10px' }} />
        
        <div className="tpl-6-text-block">
          {/* Elegant Glowing Swoosh (Placed behind text) */}
          <svg className="tpl-6-swirl" viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path d="M10,40 C50,15 150,15 190,40" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" strokeLinecap="round" filter="url(#glow)" opacity="0.9"/>
            <path d="M30,48 C80,30 120,30 170,48" fill="none" stroke="url(#goldGrad)" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#aa771c" />
              <stop offset="50%" stopColor="#fff5d1" />
              <stop offset="100%" stopColor="#aa771c" />
            </linearGradient>
          </svg>

          <TextZone id="h1" zone={zones.h1} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ fontSize: '85px', marginTop: '-10px', marginBottom: '-5px' }} />
          <TextZone id="h2" zone={zones.h2} selectedZoneId={selectedZoneId} onSelect={onSelectZone} onTextChange={onTextChange} styleOverrides={{ fontSize: '32px' }} />
        </div>
      </div>
      
      <div className="tpl-6-lower-gradient" />
    
      </LayoutWrapper></div>
  );
}
