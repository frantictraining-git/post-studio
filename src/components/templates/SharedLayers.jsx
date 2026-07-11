import React from 'react';

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
    fontSize: `${zone.size}px`,
    fontWeight: zone.weight,
    fontStyle: zone.italic ? 'italic' : 'normal',
    textTransform: zone.caps ? 'uppercase' : 'none',
    color: zone.color,
    textAlign: zone.align,
    letterSpacing: `${zone.tracking || 0}px`,
    marginRight: `-${zone.tracking || 0}px`, // Compensate for trailing letter-spacing to fix alignment
    textShadow,
  };
};

export function TextZone({ id, zone, className, selectedZoneId, onSelect, onTextChange, styleOverrides = {}, maxWidth, as: Component = 'div' }) {
  const ref = React.useRef(null);
  const [scaleFactor, setScaleFactor] = React.useState(1);
  
  React.useLayoutEffect(() => {
    if (ref.current && !ref.current.isContentEditable) {
      // temporarily remove scale to measure natural width
      ref.current.style.transform = 'none';
      const nativeW = ref.current.scrollWidth;
      const maxW = ref.current.parentElement.clientWidth;
      
      if (maxW > 0 && nativeW > maxW) {
        setScaleFactor(maxW / nativeW);
      } else {
        setScaleFactor(1);
      }
    }
  }, [zone.text, zone.size, zone.family, zone.weight, zone.tracking, zone.caps, maxWidth]);

  if (!zone || zone.visible === false) return null;

  const isSelected = selectedZoneId === id;
  const baseStyle = toCSS(zone);
  
  const isEditing = ref.current && ref.current.isContentEditable;
  
  // Wrapper provides the stable outline and takes up layout space.
  const wrapperStyle = {
    outline: isSelected ? '2px solid #00f0ff' : 'none',
    outlineOffset: '4px',
    cursor: 'pointer',
    position: 'relative',
    left: `${zone.x || 0}px`,
    top: `${zone.y || 0}px`,
    display: Component === 'span' ? 'inline-flex' : 'flex',
    flexDirection: 'column',
    width: Component === 'span' ? 'auto' : '100%',
    alignItems: zone.align === 'right' ? 'flex-end' : zone.align === 'center' ? 'center' : 'flex-start',
    ...styleOverrides, // marginBottom, padding etc. apply to wrapper
  };

  // Inner holds the text, expands to fit, and gets scaled down if needed.
  const innerStyle = {
    ...baseStyle,
    display: 'block',
    width: 'max-content',
    textAlign: zone.align,
    whiteSpace: isEditing ? 'pre-wrap' : 'nowrap',
    transform: isEditing ? 'none' : `scale(${scaleFactor})`,
    transformOrigin: zone.align === 'right' ? 'right center' : zone.align === 'center' ? 'center center' : 'left center',
  };

  return (
    <div 
      className={`text-zone-wrapper ${className || ''}`}
      style={wrapperStyle}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
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
          if (e.key === 'Enter') {
            e.preventDefault();
            ref.current.blur();
          }
        }}
        style={innerStyle}
      >
        {zone.text}
      </Component>
    </div>
  );
}

import { getOverlayById } from '../../assets/overlays';

export function SharedLayers({ tpl }) {
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
          style={{
            position: 'absolute',
            left: `${tpl.fg.x}%`,
            top: `${tpl.fg.y}%`,
            transform: `translate(-50%, -50%) scale(${tpl.fg.scale})`,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            mixBlendMode: tpl.fg.blendMode || 'normal',
            opacity: tpl.fg.opacity / 100,
            pointerEvents: 'none'
          }}
          alt="" 
        />
      )}
      
      {/* Logo Layer */}
      {tpl.logo && tpl.logo.url && (
        <img 
          src={tpl.logo.url} 
          className="t-logo-img"
          alt="Logo"
          style={{
            position: 'absolute',
            left: `${tpl.logo.x}%`,
            top: `${tpl.logo.y}%`,
            transform: `translate(-50%, -50%) scale(${tpl.logo.scale})`,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            mixBlendMode: tpl.logo.blendMode || 'normal',
            opacity: tpl.logo.opacity / 100,
            pointerEvents: 'none'
          }}
        />
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
