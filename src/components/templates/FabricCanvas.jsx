import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { getOverlayById } from '../../assets/overlays';

// ─── Constants ────────────────────────────────────────────────────
const FRAME_W = 432;
const FRAME_H = 540;

// ─── Helpers ─────────────────────────────────────────────────────
const loadFabricImage = (url) =>
  new Promise((resolve) => {
    fabric.Image.fromURL(url, { crossOrigin: 'anonymous' })
      .then(resolve)
      .catch(() => resolve(null));
  });

function buildGradient(overlayId) {
  const gradMap = {
    'dark-fade-bottom': {
      type: 'linear', coords: { x1: 0, y1: 1, x2: 0, y2: 0 },
      colorStops: [{ offset: 0, color: 'rgba(0,0,0,1)' }, { offset: 0.7, color: 'rgba(0,0,0,0)' }],
    },
    'dark-fade-top': {
      type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
      colorStops: [{ offset: 0, color: 'rgba(0,0,0,0.9)' }, { offset: 0.6, color: 'rgba(0,0,0,0)' }],
    },
    'warm-glow-center': {
      type: 'radial',
      coords: { r1: 0, r2: 0.5, x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5 },
      colorStops: [{ offset: 0, color: 'rgba(255,200,100,0.8)' }, { offset: 0.7, color: 'rgba(255,200,100,0)' }],
    },
    'light-fade-bottom': {
      type: 'linear', coords: { x1: 0, y1: 1, x2: 0, y2: 0 },
      colorStops: [{ offset: 0, color: 'rgba(255,255,255,1)' }, { offset: 0.7, color: 'rgba(255,255,255,0)' }],
    },
  };
  const def = gradMap[overlayId];
  return def ? new fabric.Gradient({ ...def, gradientUnits: 'percentage' }) : null;
}

// ─── Core renderer (shared between preview + export) ───────────────
export async function renderTplToFabricCanvas(tpl, canvas, FW, FH, scaleMult = 1) {
  canvas.clear();

  const activeOverlay = getOverlayById(tpl.overlay ? tpl.overlay.id : 'none');

  canvas.add(new fabric.Rect({
    originX: 'left', originY: 'top',
    left: 0, top: 0, width: FW, height: FH,
    fill: tpl.category === 'Editorial'
      ? (activeOverlay.type === 'solid' ? activeOverlay.css : '#000000')
      : '#000000',
    selectable: false, evented: false,
  }));

  // ── 2. Hero image ─────────────────────────────────────────────────
  if (tpl.hero?.url) {
    const img = await loadFabricImage(tpl.hero.url);
    if (img) {
      // Blur: use fabric.filters.Blur (v7 API)
      if (tpl.hero.blur > 0) {
        img.filters = [new fabric.filters.Blur({ blur: (tpl.hero.blur / 100) })];
        img.applyFilters();
      }

      if (tpl.category === 'Arch') {
        const scaleX = (FW * 0.8) / img.width;
        const scaleY = (FH * 0.85) / img.height;
        const scale = Math.max(scaleX, scaleY) * tpl.hero.scale;
        img.set({
          originX: 'center', originY: 'center',
          left: (tpl.hero.x / 100) * FW,
          top:  (tpl.hero.y / 100) * FH,
          scaleX: scale * (tpl.hero.mirror ? -1 : 1),
          scaleY: scale,
          clipPath: new fabric.Rect({
            originX: 'left', originY: 'top',
            left: FW * 0.1, top: FH * 0.15,
            width: FW * 0.8, height: FH * 0.85,
            rx: 500 * scaleMult, ry: 500 * scaleMult,
            absolutePositioned: true,
          }),
          selectable: !tpl.hero.locked, evented: !tpl.hero.locked,
        });
      } else if (tpl.category === 'Editorial') {
        const scaleX = (FW * 0.5) / img.width;
        const scaleY = FH / img.height;
        const scale = Math.max(scaleX, scaleY) * tpl.hero.scale;
        img.set({
          originX: 'center', originY: 'center',
          left: FW * 0.75 + ((tpl.hero.x - 50) / 100) * (FW * 0.5),
          top:  (tpl.hero.y / 100) * FH,
          scaleX: scale * (tpl.hero.mirror ? -1 : 1),
          scaleY: scale,
          clipPath: new fabric.Rect({
            originX: 'left', originY: 'top',
            left: FW * 0.5, top: 0, width: FW * 0.5, height: FH,
            absolutePositioned: true,
          }),
          selectable: !tpl.hero.locked, evented: !tpl.hero.locked,
        });
      } else {
        const scaleX = FW / img.width;
        const scaleY = FH / img.height;
        const baseScale = Math.max(scaleX, scaleY);
        img.set({
          originX: 'center', originY: 'center',
          left: (tpl.hero.x / 100) * FW,
          top:  (tpl.hero.y / 100) * FH,
          scaleX: baseScale * tpl.hero.scale * (tpl.hero.mirror ? -1 : 1),
          scaleY: baseScale * tpl.hero.scale,
          selectable: !tpl.hero.locked, evented: !tpl.hero.locked,
        });
      }
      canvas.add(img);
    }
  }

  // ── 3. Overlay ─────────────────────────────────────────────────────
  if (activeOverlay.id !== 'none' && tpl.overlay?.opacity > 0) {
    const opacity = tpl.overlay.opacity / 100;
    const isEditorial = tpl.category === 'Editorial';
    const isArch = tpl.category === 'Arch';
    const overlayLeft = isEditorial ? FW * 0.5 : 0;
    const overlayWidth = isEditorial ? FW * 0.5 : FW;

    let archClip = undefined;
    if (isArch) {
      archClip = new fabric.Rect({
        originX: 'left', originY: 'top',
        left: FW * 0.1, top: FH * 0.15,
        width: FW * 0.8, height: FH * 0.85,
        rx: 500 * scaleMult, ry: 500 * scaleMult,
        absolutePositioned: true,
      });
    }

    let fill;
    if (activeOverlay.type === 'solid') {
      fill = activeOverlay.css;
    } else {
      fill = buildGradient(activeOverlay.id);
    }

    if (fill) {
      canvas.add(new fabric.Rect({
        originX: 'left', originY: 'top',
        left: overlayLeft, top: 0,
        width: overlayWidth, height: FH,
        fill,
        opacity,
        globalCompositeOperation: activeOverlay.blend_mode || 'source-over',
        clipPath: archClip,
        selectable: false, evented: false,
      }));
    }
  }

  // ── 4. Glassmorphism panel (approximation — Canvas has no backdrop-filter) ──
  if (tpl.category === 'Glassmorphism') {
    // Semi-transparent frosted panel, as close as possible without CSS backdrop-filter
    canvas.add(new fabric.Rect({
      originX: 'left', originY: 'top',
      left: FW * 0.1, top: FH * 0.15,
      width: FW * 0.8, height: FH * 0.7,
      fill: 'rgba(255,255,255,0.15)',
      rx: 24 * scaleMult, ry: 24 * scaleMult,
      stroke: 'rgba(255,255,255,0.3)',
      strokeWidth: 1 * scaleMult,
      selectable: false, evented: false,
    }));
  }

  // ── 5. Foreground image ────────────────────────────────────────────
  if (tpl.fg?.url) {
    const fgImg = await loadFabricImage(tpl.fg.url);
    if (fgImg) {
      const baseScale = Math.min(FW / fgImg.width, FH / fgImg.height);
      fgImg.set({
        id: 'fg',
        originX: 'center', originY: 'center',
        left: (tpl.fg.x / 100) * FW,
        top:  (tpl.fg.y / 100) * FH,
        scaleX: baseScale * tpl.fg.scale,
        scaleY: baseScale * tpl.fg.scale,
        opacity: (tpl.fg.opacity ?? 100) / 100,
        globalCompositeOperation: tpl.fg.blendMode || 'source-over',
        selectable: true, evented: true,
        // Store base scale so we can recover % scale on modify
        _baseScale: baseScale,
      });
      canvas.add(fgImg);
    }
  }

  // ── 6. Logo ────────────────────────────────────────────────────────
  if (tpl.logo?.url) {
    const logoImg = await loadFabricImage(tpl.logo.url);
    if (logoImg) {
      const MAX_W = 200 * scaleMult;
      const MAX_H = 150 * scaleMult;
      const baseScale = Math.min(MAX_W / logoImg.width, MAX_H / logoImg.height);
      logoImg.set({
        id: 'logo',
        originX: 'center', originY: 'center',
        left: ((Number.isFinite(tpl.logo.x) ? tpl.logo.x : 50) / 100) * FW,
        top:  ((Number.isFinite(tpl.logo.y) ? tpl.logo.y : 15) / 100) * FH,
        scaleX: baseScale * (tpl.logo.scale || 1),
        scaleY: baseScale * (tpl.logo.scale || 1),
        opacity: (tpl.logo.opacity ?? 100) / 100,
        globalCompositeOperation: tpl.logo.blendMode || 'source-over',
        selectable: true, evented: true,
        _baseScale: baseScale,
      });
      canvas.add(logoImg);
    }
  }

  // ── 7. Text zones ──────────────────────────────────────────────────
  if (tpl.zones) {
    for (const [zoneId, zone] of Object.entries(tpl.zones)) {
      if (zone.visible === false) continue;

      let text = zone.text || '';
      if (zone.transform === 'sentence-case') {
        text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      } else if (zone.transform === 'uppercase' || zone.caps) {
        text = text.toUpperCase();
      } else if (zone.transform === 'lowercase') {
        text = text.toLowerCase();
      }

      let fontFamily = zone.family;
      if (fontFamily === 'var(--primaryFont)')   fontFamily = 'Minal';
      if (fontFamily === 'var(--secondaryFont)') fontFamily = 'Montserrat';

      let shadow = null;
      if (zone.shadow === 'soft')
        shadow = new fabric.Shadow({ color: 'rgba(0,0,0,0.85)', blur: 28 * scaleMult, offsetX: 0, offsetY: 2 * scaleMult });
      else if (zone.shadow === 'hard')
        shadow = new fabric.Shadow({ color: 'rgba(0,0,0,0.95)', blur: 40 * scaleMult, offsetX: 0, offsetY: 6 * scaleMult });
      else if (zone.shadow === 'glow')
        shadow = new fabric.Shadow({ color: 'rgba(162,130,66,0.6)', blur: 40 * scaleMult, offsetX: 0, offsetY: 0 });

      const textObj = new fabric.Textbox(text, {
        id: zoneId,
        originX: zone.align === 'right' ? 'right' : zone.align === 'center' ? 'center' : 'left',
        originY: 'center',
        left: (zone.x ?? 50) / 100 * FW,
        top:  (zone.y ?? 50) / 100 * FH,
        fontFamily,
        fontSize: zone.size * (zone.scale || 1) * scaleMult,
        fontWeight: zone.weight,
        fontStyle: zone.italic ? 'italic' : 'normal',
        fill: zone.color || '#ffffff',
        textAlign: zone.align,
        charSpacing: (zone.tracking || 0) * 10,
        shadow,
        width: Math.max(zone.width || FW * 0.8, 100) * scaleMult,
        splitByGrapheme: true,
        selectable: true, editable: true,
      });

      canvas.add(textObj);
    }
  }

  canvas.renderAll();
}

// ─── React component ──────────────────────────────────────────────
export default function FabricCanvas({
  tpl,
  selectedZoneId,
  onSelectZone,
  onTextChange,
  setHero,
  setFg,
  setLogo,
  setZoneStyle,
}) {
  const canvasRef      = useRef(null);
  const fabricRef      = useRef(null);
  const isInternal     = useRef(false);
  const tplRef         = useRef(tpl); // keep latest tpl without re-mounting canvas

  // Sync latest tpl into ref so event handlers always see fresh state
  useEffect(() => { tplRef.current = tpl; }, [tpl]);

  // ── Mount canvas once ────────────────────────────────────────────
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: FRAME_W,
      height: FRAME_H,
      preserveObjectStacking: true,
      selection: false,
    });
    fabricRef.current = canvas;

    // Selection → sidebar highlight
    const syncSelection = (e) => {
      const obj = e?.selected?.[0];
      if (obj?.id) onSelectZone(obj.id);
    };
    canvas.on('selection:created', syncSelection);
    canvas.on('selection:updated', syncSelection);
    canvas.on('selection:cleared', () => onSelectZone(null));

    // Text edit exit → update state
    canvas.on('text:editing:exited', (e) => {
      const obj = e.target;
      if (obj?.id && obj.text !== undefined) {
        isInternal.current = true;
        onTextChange(obj.id, obj.text);
        setTimeout(() => { isInternal.current = false; }, 50);
      }
    });

    // Drag / scale / rotate → update state
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (!obj?.id) return;

      isInternal.current = true;

      // Convert absolute canvas coords → percentage state
      // Use originX=center so left/top is the centre point
      const xPct = (obj.left / FRAME_W) * 100;
      const yPct = (obj.top  / FRAME_H) * 100;

      if (obj.id === 'hero') {
        // Hero scale: scaleX already incorporates the cover-fit base.
        // Back-calculate the % scale relative to the cover-fit base.
        const cur = tplRef.current.hero;
        const heroScale = Math.abs(obj.scaleX) / (Math.max(FRAME_W / (obj.width || FRAME_W), FRAME_H / (obj.height || FRAME_H)));
        setHero({ x: xPct, y: yPct, scale: Math.max(0.1, heroScale) });
      } else if (obj.id === 'fg') {
        const baseScale = obj._baseScale || 1;
        const relScale = obj.scaleX / baseScale;
        setFg({ x: xPct, y: yPct, scale: Math.max(0.05, relScale) });
      } else if (obj.id === 'logo') {
        const baseScale = obj._baseScale || 1;
        const relScale = obj.scaleX / baseScale;
        setLogo({ x: xPct, y: yPct, scale: Math.max(0.05, relScale) });
      } else {
        // Text zone — sync position only; font size changes go through the sidebar
        setZoneStyle(obj.id, { x: xPct, y: yPct });
      }

      setTimeout(() => { isInternal.current = false; }, 50);
    });

    return () => canvas.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-render whenever tpl changes ─────────────
  useEffect(() => {
    if (!fabricRef.current || isInternal.current) return;
    const canvas = fabricRef.current;

    renderTplToFabricCanvas(tpl, canvas, FRAME_W, FRAME_H, 1).then(() => {
      // Restore selection after re-render
      if (selectedZoneId) {
        const obj = canvas.getObjects().find(o => o.id === selectedZoneId);
        if (obj) canvas.setActiveObject(obj);
        canvas.requestRenderAll();
      }
    });
  }, [tpl]); // Do NOT include selectedZoneId here!

  // ── Sync sidebar selection to canvas active object ─────────────
  useEffect(() => {
    if (!fabricRef.current || isInternal.current) return;
    const canvas = fabricRef.current;
    
    // Check if the current active object is already the selected one
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.id === selectedZoneId) return; // Prevent infinite loop

    if (selectedZoneId) {
      const obj = canvas.getObjects().find(o => o.id === selectedZoneId);
      if (obj) {
        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
      }
    } else {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  }, [selectedZoneId]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
