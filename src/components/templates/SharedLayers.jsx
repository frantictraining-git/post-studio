import React from 'react';
import TransformGizmo from './TransformGizmo';

// Helper to convert zone style object to inline CSS for preview
export const toCSS = (zone) => {
  if (!zone) return {};
  
  let textShadow = 'none';
  if (zone.shadow === 'soft') textShadow = '0px 2px 28px rgba(0,0,0,0.85)';
  else if (zone.shadow === 'hard') textShadow = '0px 6px 40px rgba(0,0,0,0.95)';
  else if (zone.shadow === 'glow') textShadow = '0px 0px 40px rgba(162,130,66,0.6)';

  // Handle global brand theme mapping (fallback to specific font)
  let fontFamily = zone.family;
  if (fontFamily === 'var(--primaryFont)') fontFamily = 'var(--brand-primary, Minal)';
  else if (fontFamily === 'var(--secondaryFont)') fontFamily = 'var(--brand-secondary, Montserrat)';

  return {
    fontFamily: `"${fontFamily}", sans-serif`,
    fontSize: `${zone.size * (zone.scale || 1)}px`,
    fontWeight: zone.weight,
    fontStyle: zone.italic ? 'italic' : 'normal',
    textTransform: (zone.transform === 'small-caps' || zone.transform === 'sentence-case') ? 'none' : (zone.transform || (zone.caps ? 'uppercase' : 'none')),
    fontVariant: zone.transform === 'small-caps' ? 'small-caps' : 'normal',
    color: zone.color || '#ffffff',
    textAlign: zone.align,
    letterSpacing: `${zone.tracking || 0}px`,
    marginRight: `-${zone.tracking || 0}px`, // Compensate for trailing letter-spacing to fix alignment
    textShadow,
  };
};

export function TextZone({ id, zone, className, selectedZoneId, onSelect, onTextChange, setZoneStyle, styleOverrides = {}, maxWidth, snapEnabled, as: Component = 'div' }) {
  const ref = React.useRef(null);
  const [scaleFactor, setScaleFactor] = React.useState(1);
  
  React.useLayoutEffect(() => {
    if (ref.current && !ref.current.isContentEditable) {
      ref.current.style.transform = 'none';
      const nativeW = ref.current.scrollWidth;
      const maxW = ref.current.parentElement.clientWidth;
      
      if (maxW > 0 && nativeW > maxW) {
        setScaleFactor(maxW / nativeW);
      } else {
        setScaleFactor(1);
      }
    }
  }, [zone.text, zone.size, zone.family, zone.weight, zone.tracking, zone.caps, zone.transform, maxWidth]);

  if (!zone || zone.visible === false) return null;

  const isSelected = selectedZoneId === id;
  const baseStyle = toCSS(zone);
  
  const isEditing = ref.current && ref.current.isContentEditable;
  
  // The UI frame is 432x540px (before 1.25x CSS scale).
  // We convert drag pixels to percentages so the coordinate system matches canvasExport.
  const FRAME_W = 432;
  const FRAME_H = 540;

  const wrapperStyle = {
    cursor: 'pointer',
    pointerEvents: 'auto',
    display: Component === 'span' ? 'inline-flex' : 'flex',
    flexDirection: 'column',
    width: (zone.boxWidth || 0) > 0 ? `${zone.boxWidth}%` : 'max-content',
    alignItems: zone.align === 'right' ? 'flex-end' : zone.align === 'center' ? 'center' : 'flex-start',
    // Absolute position using percentage coordinates (same system as canvasExport)
    // Position props come last so they always win even if styleOverrides tries to override
    ...styleOverrides,
    position: 'absolute',
    left: `${zone.x ?? 50}%`,
    top: `${zone.y ?? 50}%`,
    transform: 'translate(-50%, -50%)',
  };

  const innerStyle = {
    ...baseStyle,
    display: 'block',
    width: (zone.boxWidth || 0) > 0 ? '100%' : 'max-content',
    textAlign: zone.align,
    whiteSpace: (zone.boxWidth || 0) > 0 ? 'pre-wrap' : 'pre',
    wordBreak: (zone.boxWidth || 0) > 0 ? 'break-word' : 'normal',
    userSelect: isEditing ? 'auto' : 'none',
    WebkitUserSelect: isEditing ? 'auto' : 'none',
    transform: isEditing ? 'none' : `scale(${scaleFactor})`,
    transformOrigin: zone.align === 'right' ? 'right center' : zone.align === 'center' ? 'center center' : 'left center',
  };

  const handleDrag = (dx, dy) => {
    if (setZoneStyle) setZoneStyle(id, {
      x: (zone.x ?? 50) + (dx / FRAME_W * 100),
      y: (zone.y ?? 50) + (dy / FRAME_H * 100),
    });
  };

  const handleScale = (ds) => {
    if (setZoneStyle) setZoneStyle(id, { scale: Math.max(0.1, (zone.scale || 1) + ds) });
  };

  const handleResizeWidth = (dwPct) => {
    if (setZoneStyle) {
      // If currently auto (0), initialize it based on its current rendered width
      const currentBoxWidth = (zone.boxWidth > 0) ? zone.boxWidth : ((ref.current.getBoundingClientRect().width / FRAME_W) * 100);
      setZoneStyle(id, { boxWidth: Math.max(10, currentBoxWidth + dwPct) });
    }
  };

  return (
    <TransformGizmo 
      isActive={isSelected} 
      onDrag={handleDrag} 
      onScale={handleScale} 
      onResizeWidth={handleResizeWidth}
      onClick={() => onSelect(id)} 
      styleOverrides={wrapperStyle}
      snapEnabled={snapEnabled}
    >
      <div className={`text-zone-wrapper ${className || ''}`}>
      <Component 
        ref={ref}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (ref.current) {
            ref.current.contentEditable = true;
            ref.current.focus();
          }
        }}
        onBlur={(e) => {
          if (ref.current) {
            ref.current.contentEditable = false;
            onTextChange(id, e.target.innerText);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            ref.current.blur();
          }
        }}
        style={innerStyle}
      >
        {zone.transform === 'sentence-case' ? (zone.text?.charAt(0).toUpperCase() + zone.text?.slice(1).toLowerCase()) : zone.text}
      </Component>
      </div>
    </TransformGizmo>
  );
}

import { getOverlayById } from '../../assets/overlays';

export function SharedLayers({ tpl, selectedZoneId, onSelectZone, setLogo, snapEnabled }) {
  const { hero, overlay, category } = tpl;
  
  const activeOverlay = getOverlayById(overlay ? overlay.id : 'none');
  const overlayOpacity = overlay ? overlay.opacity / 100 : 1;
  const overlayCss = activeOverlay.css;

  // Determine layouts
  const isArch = category === 'Arch';
  const isEditorial = category === 'Editorial';
  const isGlass = category === 'Glassmorphism';
  const isClassic = category === 'Classic';

  return (
    <>
      {/* Background Layer: Handles solid color splits for Editorial, or full bleed image */}
      {isEditorial && (
        <div className="t-bg-solid" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: activeOverlay.type === 'solid' ? activeOverlay.css : '#000' }} />
      )}
      
      {/* Hero Image */}
      {hero && hero.url && (
        <div 
          className="t-hero-wrapper"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            overflow: 'hidden',
            clipPath: isArch ? 'polygon(0% 20%, 100% 20%, 100% 100%, 0% 100%)' : (isEditorial ? 'inset(0 0 0 50%)' : 'none'), // Simplified arch to inset
            // Wait, proper Arch clip path:
            ...(isArch && { clipPath: 'path("M100,300 C100,100 980,100 980,300 L980,1350 L100,1350 Z")' }) // We can use border-radius for an arch mask
          }}
        >
          {isArch ? (
            <div style={{
              position: 'absolute',
              top: '15%', left: '10%', right: '10%', bottom: '0%',
              borderRadius: '500px 500px 0 0',
              overflow: 'hidden'
            }}>
              <img 
                src={hero.url} 
                className="t-bg-img" 
                draggable={false}
                style={{
                  filter: `blur(${hero.blur}px)`,
                  transform: `translate(${hero.x - 50}%, ${hero.y - 50}%) scale(${hero.scale}) ${hero.mirror ? 'scaleX(-1)' : ''}`,
                  width: '100%', height: '100%', objectFit: 'cover'
                }}
                alt="" 
              />
            </div>
          ) : (
            <img 
              src={hero.url} 
              className="t-bg-img" 
              draggable={false}
              style={{
                filter: `blur(${hero.blur}px)`,
                transform: `translate(${hero.x - 50}%, ${hero.y - 50}%) scale(${hero.scale}) ${hero.mirror ? 'scaleX(-1)' : ''}`,
                width: isEditorial ? '50%' : '100%', 
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                left: isEditorial ? '50%' : '0'
              }}
              alt="" 
            />
          )}
        </div>
      )}
      
      {/* Overlay Layer */}
      {activeOverlay.id !== 'none' && overlayOpacity > 0 && (
        <div 
          className="t-overlay" 
          style={{
            position: 'absolute',
            top: 0, 
            left: isEditorial ? '50%' : 0, 
            right: 0, 
            bottom: 0,
            background: activeOverlay.css,
            mixBlendMode: activeOverlay.blend_mode || 'normal',
            opacity: overlayOpacity,
            pointerEvents: 'none',
            ...(isArch && {
              top: '15%', left: '10%', right: '10%', bottom: '0%',
              borderRadius: '500px 500px 0 0',
            })
          }} 
        />
      )}

      {/* Glassmorphism Panel */}
      {isGlass && (
        <div style={{
          position: 'absolute',
          top: '15%', left: '10%', right: '10%', bottom: '15%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none'
        }} />
      )}
      
      {/* Foreground Layer */}
      {tpl.fg && tpl.fg.url && (
        <img 
          src={tpl.fg.url} 
          className="t-fg-img" 
          draggable={false}
          style={{
            position: 'absolute',
            left: `${tpl.fg.x}%`,
            top: `${tpl.fg.y}%`,
            transform: `translate(-50%, -50%) scale(${tpl.fg.scale})`,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            mixBlendMode: tpl.fg.blendMode || 'normal',
            opacity: (tpl.fg.opacity ?? 100) / 100,
            pointerEvents: 'none'
          }}
          alt="" 
        />
      )}
      
      {/* Logo Layer */}
      {tpl.logo && tpl.logo.url && (
        <TransformGizmo
          isActive={selectedZoneId === 'logo'}
          snapEnabled={snapEnabled}
          onDrag={(dx, dy) => {
            // Because logo x/y are percentages in App state, 
            // we should convert dx/dy into percentage.
            // But since dx is in pixels, we can approximate:
            // 1% of 1080px is 10.8px. Let's just scale dx down so it doesn't fly off screen.
            const newX = tpl.logo.x + (dx * 0.1);
            const newY = tpl.logo.y + (dy * 0.1);
            if (setLogo) setLogo({ x: newX, y: newY });
          }}
          onScale={(ds) => {
            if (setLogo) setLogo({ scale: Math.max(0.05, tpl.logo.scale + ds) });
          }}
          onClick={() => { if (onSelectZone) onSelectZone('logo'); }}
          styleOverrides={{
            position: 'absolute',
            left: `${tpl.logo.x}%`,
            top: `${tpl.logo.y}%`,
            transform: `translate(-50%, -50%) scale(${tpl.logo.scale})`,
            pointerEvents: 'auto'
          }}
        >
          <img 
            src={tpl.logo.url} 
            className="t-logo-img" 
            draggable={false}
            style={{
              position: 'relative',
              maxWidth: '200px',
              maxHeight: '150px',
              display: 'block',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              mixBlendMode: tpl.logo.blendMode || 'normal',
              opacity: (tpl.logo.opacity ?? 100) / 100,
              pointerEvents: 'none'
            }}
            alt="" 
          />
        </TransformGizmo>
      )}
    </>
  );
}

export function LayoutWrapper({ category, children }) {
  if (category === 'Editorial') {
    return <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', zIndex: 10 }}>{children}</div>;
  }
  if (category === 'Glassmorphism') {
    return <div style={{ position: 'absolute', top: '15%', left: '10%', width: '80%', height: '70%', zIndex: 10 }}>{children}</div>;
  }
  return <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
    <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
      {children}
    </div>
  </div>;
}
