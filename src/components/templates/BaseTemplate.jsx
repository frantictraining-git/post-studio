import React from 'react';
import { SharedLayers, TextZone } from './SharedLayers';
import './templates.css';

export default function BaseTemplate({ tpl, selectedZoneId, onSelectZone, onTextChange, setZoneStyle, setLogo, snapEnabled }) {
  const { zones } = tpl;
  
  return (
    <div className="tpl-wrap" style={{ backgroundColor: '#000000' }}>
      <SharedLayers 
        tpl={tpl} 
        selectedZoneId={selectedZoneId}
        onSelectZone={onSelectZone}
        setLogo={setLogo}
        snapEnabled={snapEnabled}
      />
      
      {/* 
        This is a clean, base layout. 
        It centers the text on the screen, while SharedLayers handles the background image and logo.
      */}
      {/* Text zones position themselves absolutely using zone.x/zone.y percentages */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        
        <TextZone 
          id="heading" 
          zone={zones.heading} 
          selectedZoneId={selectedZoneId} 
          onSelect={onSelectZone} 
          onTextChange={onTextChange} 
          setZoneStyle={setZoneStyle}
          snapEnabled={snapEnabled}
        />
        
        <TextZone 
          id="subheading" 
          zone={zones.subheading} 
          selectedZoneId={selectedZoneId} 
          onSelect={onSelectZone} 
          onTextChange={onTextChange}
          setZoneStyle={setZoneStyle}
          snapEnabled={snapEnabled}
        />
        
      </div>
    </div>
  );
}
