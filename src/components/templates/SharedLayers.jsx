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

export function SharedLayers({ tpl }) {
  const { hero, grade, fg } = tpl;
  
  const gradeColorMap = {
    green: '#15392D', amber: '#564020', noir: '#0a0a08',
    sage: '#2B562A', warm: '#3a2010', custom: grade.custom,
  };
  
  return (
    <>
      {/* Background Hero Image */}
      {hero.url && (
        <img 
          src={hero.url} 
          className="t-bg-img" 
          style={{
            filter: `blur(${hero.blur}px)`,
            transform: `translate(${hero.x - 50}%, ${hero.y - 50}%) scale(${hero.scale}) ${hero.mirror ? 'scaleX(-1)' : ''}`
          }}
          alt="" 
        />
      )}
      
      {/* Color Grade Overlay */}
      {grade.preset !== 'none' && grade.intensity > 0 && (
        <div 
          className="t-grade" 
          style={{
            backgroundColor: gradeColorMap[grade.preset] || grade.custom,
            mixBlendMode: grade.blendMode || 'multiply',
            opacity: grade.intensity / 100,
          }} 
        />
      )}
      
      {/* Foreground Image Layer */}
      {fg.url && (
        <img 
          src={fg.url} 
          className="t-fg-img" 
          style={{
            position: 'absolute',
            left: `${fg.x}%`,
            top: `${fg.y}%`,
            transform: `translate(-50%, -50%) scale(${fg.scale})`,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            mixBlendMode: fg.blendMode || 'normal',
            opacity: fg.opacity / 100,
            pointerEvents: 'none'
          }}
          alt="" 
        />
      )}
      
      {/* 4. Logo Layer */}
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
