import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './TransformGizmo.css';

function SnapGuideLine({ type, position, gizmoRef }) {
  if (!gizmoRef.current) return null;
  const frame = gizmoRef.current.closest('.pv-frame');
  if (!frame) return null;

  const style = {
    position: 'absolute',
    backgroundColor: '#00f0ff',
    zIndex: 9999,
    pointerEvents: 'none'
  };

  if (type === 'vertical') {
    style.top = 0;
    style.bottom = 0;
    style.width = '1px';
    if (position === 'center') style.left = '50%';
    else if (position === 'left') style.left = '40px';
    else if (position === 'right') style.right = '40px';
  } else {
    style.left = 0;
    style.right = 0;
    style.height = '1px';
    if (position === 'center') style.top = '50%';
    else if (position === 'top') style.top = '40px';
    else if (position === 'bottom') style.bottom = '40px';
  }

  return createPortal(<div style={style} />, frame);
}

export default function TransformGizmo({ isActive, children, onDrag, onScale, onResizeWidth, onClick, styleOverrides, snapEnabled }) {
  const [isScaling, setIsScaling] = useState(false);
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [snapGuides, setSnapGuides] = useState({ x: null, y: null });
  const gizmoRef = useRef(null);
  const dragState = useRef({ startX: 0, startY: 0, accumulatedDx: 0, accumulatedDy: 0, snappedX: false, snappedY: false });

  const callbacksRef = useRef({ onDrag, onScale, onResizeWidth });
  useEffect(() => {
    callbacksRef.current = { onDrag, onScale, onResizeWidth };
  }, [onDrag, onScale, onResizeWidth]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        let dx = e.movementX;
        let dy = e.movementY;
        
        let newGuides = { x: null, y: null };
        
        if (snapEnabled && gizmoRef.current) {
          const frame = gizmoRef.current.closest('.pv-frame');
          if (frame) {
            // We scale by 1.25 in CSS, but movementX is in screen pixels.
            // The bounds are in screen pixels.
            const rect = gizmoRef.current.getBoundingClientRect();
            const frameRect = frame.getBoundingClientRect();
            
            const elemCX = rect.left + rect.width / 2;
            const elemCY = rect.top + rect.height / 2;
            const frameCX = frameRect.left + frameRect.width / 2;
            const frameCY = frameRect.top + frameRect.height / 2;
            
            const SNAP_DIST = 10;
            const MARGIN = 40 * 1.25; // Screen space margin

            let targetDx = null;
            let targetDy = null;

            // Y Snapping (Center and Margins)
            if (Math.abs(elemCY - frameCY) < SNAP_DIST) {
              targetDy = frameCY - elemCY;
              newGuides.y = 'center';
            } else if (Math.abs(rect.top - (frameRect.top + MARGIN)) < SNAP_DIST) {
              targetDy = (frameRect.top + MARGIN) - rect.top;
              newGuides.y = 'top';
            } else if (Math.abs(rect.bottom - (frameRect.bottom - MARGIN)) < SNAP_DIST) {
              targetDy = (frameRect.bottom - MARGIN) - rect.bottom;
              newGuides.y = 'bottom';
            }

            if (targetDy !== null) {
              if (!dragState.current.snappedY) {
                dy = targetDy;
                dragState.current.snappedY = true;
                dragState.current.accumulatedDy = 0;
              } else {
                dragState.current.accumulatedDy += e.movementY;
                if (Math.abs(dragState.current.accumulatedDy) > SNAP_DIST * 2) {
                  dragState.current.snappedY = false;
                  dy = dragState.current.accumulatedDy;
                } else {
                  dy = 0;
                }
              }
            } else {
              dragState.current.snappedY = false;
            }
            
            // X Snapping (Center and Margins)
            if (Math.abs(elemCX - frameCX) < SNAP_DIST) {
              targetDx = frameCX - elemCX;
              newGuides.x = 'center';
            } else if (Math.abs(rect.left - (frameRect.left + MARGIN)) < SNAP_DIST) {
              targetDx = (frameRect.left + MARGIN) - rect.left;
              newGuides.x = 'left';
            } else if (Math.abs(rect.right - (frameRect.right - MARGIN)) < SNAP_DIST) {
              targetDx = (frameRect.right - MARGIN) - rect.right;
              newGuides.x = 'right';
            }

            if (targetDx !== null) {
              if (!dragState.current.snappedX) {
                dx = targetDx; 
                dragState.current.snappedX = true;
                dragState.current.accumulatedDx = 0;
              } else {
                dragState.current.accumulatedDx += e.movementX;
                if (Math.abs(dragState.current.accumulatedDx) > SNAP_DIST * 2) {
                  dragState.current.snappedX = false;
                  dx = dragState.current.accumulatedDx;
                } else {
                  dx = 0; 
                }
              }
            } else {
              dragState.current.snappedX = false;
            }

            // Apply scale inverse because pv-frame is scaled by 1.25
            // So mouse movement of 1px screen = 0.8px in the canvas coordinates
            dx = dx / 1.25;
            dy = dy / 1.25;
          }
        }

        setSnapGuides(newGuides);
        if (callbacksRef.current.onDrag && (dx !== 0 || dy !== 0)) callbacksRef.current.onDrag(dx, dy);
        
      } else if (isScaling) {
        // Move right or up to increase scale
        const ds = (e.movementX - e.movementY) * 0.005;
        if (callbacksRef.current.onScale) callbacksRef.current.onScale(ds);
      } else if (isResizingWidth) {
        // Since the element is centered (-50%, -50%), expanding the width grows it in both directions.
        // To make the right handle follow the mouse, we need to add e.movementX * 2.
        const frame = gizmoRef.current.closest('.pv-frame');
        const frameW = frame ? frame.getBoundingClientRect().width : 432;
        // Convert screen pixels to percentage of frame width
        const dwPct = (e.movementX * 2 / frameW) * 100;
        if (callbacksRef.current.onResizeWidth) callbacksRef.current.onResizeWidth(dwPct);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      dragState.current.snappedX = false;
      dragState.current.snappedY = false;
      setIsScaling(false);
      setIsResizingWidth(false);
      setSnapGuides({ x: null, y: null });
    };

    if (isDragging || isScaling || isResizingWidth) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isScaling, isResizingWidth, snapEnabled]);

  // Map the newGuides state to canvas CSS absolute properties
  const guideStyle = { position: 'absolute', backgroundColor: '#00f0ff', zIndex: 9999, pointerEvents: 'none' };
  
  // Create a React Portal helper in the future if we need it completely outside the gizmo flow,
  // but if the gizmo is a child of pv-frame (which it is), we can just use position: absolute on a wrapper
  // that breaks out of the gizmo's relative positioning.
  // Wait, if TransformGizmo is relative, these absolute divs will be relative to TransformGizmo!
  // We need to render them as children of a DOM node that is NOT the gizmo, OR make the gizmo not relative (but it must be relative for its handles).
  // Actually, we can use a Portal!

  return (
    <>
      {snapGuides.x && (
        <SnapGuideLine type="vertical" position={snapGuides.x} gizmoRef={gizmoRef} />
      )}
      {snapGuides.y && (
        <SnapGuideLine type="horizontal" position={snapGuides.y} gizmoRef={gizmoRef} />
      )}
      
      <div 
        ref={gizmoRef}
        className={`transform-gizmo ${isActive ? 'active' : ''}`}
        style={{ ...styleOverrides, position: styleOverrides?.position || 'relative' }}
        onMouseDown={(e) => {
          if (e.target.closest('.gizmo-handle')) return;
          e.stopPropagation();
          if (onClick) onClick();
          setIsDragging(true);
          dragState.current.startX = e.clientX;
          dragState.current.startY = e.clientY;
        }}
      >
        <div className="gizmo-content">
          {children}
        </div>
        
        {isActive && (
          <>
            <div className="gizmo-border" />
            <div className="gizmo-handle top-right" title="Scale (Height/Size)" onMouseDown={(e) => { e.stopPropagation(); setIsScaling(true); }} />
            {onResizeWidth && (
              <div className="gizmo-handle bottom-right" title="Resize Width" style={{ cursor: 'ew-resize' }} onMouseDown={(e) => { e.stopPropagation(); setIsResizingWidth(true); }} />
            )}
          </>
        )}
      </div>
    </>
  );
}
