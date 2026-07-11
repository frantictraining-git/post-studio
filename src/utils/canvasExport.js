/**
 * canvasExport.js
 * Reconstructs the active template on a 1080×1350 Canvas and triggers PNG download.
 * Uses Canvas 2D API — zero dependencies.
 */

import { getOverlayById } from '../assets/overlays';

const W = 1080;
const H = 1350;

// ─── Helpers ──────────────────────────────────────────────────────
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(ctx, img, x, y, w, h, posX = 50, posY = 50, scale = 1, mirror = false) {
  const iAR = img.width / img.height;
  const cAR = w / h;
  let sw, sh;
  if (iAR > cAR) { sh = h * scale; sw = sh * iAR; }
  else            { sw = w * scale; sh = sw / iAR; }
  if (sw < w) { const r = w / sw; sw *= r; sh *= r; }
  if (sh < h) { const r = h / sh; sw *= r; sh *= r; }
  const sx = x + (w - sw) * (posX / 100);
  const sy = y + (h - sh) * (posY / 100);

  ctx.save();
  if (mirror) {
    ctx.translate(x + w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, -(sx - x + w) + x, sy, sw, sh);
  } else {
    ctx.drawImage(img, sx, sy, sw, sh);
  }
  ctx.restore();
}

function drawFree(ctx, img, w, h, xPct, yPct, scale = 1) {
  const iAR = img.width / img.height;
  const cAR = w / h;
  let dw = w;
  let dh = w / iAR;

  // Contain within canvas native bounds
  if (dh > h) {
    dh = h;
    dw = dh * iAR;
  }

  // Apply scaling
  dw *= scale;
  dh *= scale;

  // Calculate center position
  const cx = w * (xPct / 100);
  const cy = h * (yPct / 100);

  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function applyTextShadow(ctx, shadow) {
  if (shadow === 'soft') {
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 2;
  } else if (shadow === 'hard') {
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 6;
  } else if (shadow === 'glow') {
    ctx.shadowColor = 'rgba(162,130,66,0.6)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 0;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
}

function clearShadow(ctx) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function drawText(ctx, text, x, y, zone, maxWPct = 100) {
  if (!text || zone.visible === false) return;
  const display = zone.caps ? text.toUpperCase() : text;
  const size = zone.size * 2; // scale from preview (540wide) to 1080wide
  const tracking = (zone.tracking || 0) * 2;

  let fontFamily = zone.family;
  if (fontFamily === 'var(--primaryFont)') fontFamily = 'Minal'; // Fallback for export if not resolved
  if (fontFamily === 'var(--secondaryFont)') fontFamily = 'Montserrat';

  ctx.font = `${zone.italic ? 'italic ' : ''}${zone.weight} ${size}px '${fontFamily}', serif`;
  ctx.fillStyle = zone.color;
  ctx.textAlign = zone.align === 'right' ? 'right' : zone.align === 'center' ? 'center' : 'left';
  ctx.textBaseline = 'alphabetic';
  applyTextShadow(ctx, zone.shadow);

  // Auto-scaling logic
  const maxW = W * (parseFloat(maxWPct) / 100);
  const chars = [...display];
  const totalW = chars.reduce((acc, ch) => acc + ctx.measureText(ch).width, 0) + tracking * (Math.max(0, chars.length - 1));
  
  let scale = 1;
  if (totalW > maxW && maxW > 0) {
    scale = maxW / totalW;
  }

  // Factor in the custom offsets from the sidebar
  const offsetX = (zone.x || 0) * 2;
  const offsetY = (zone.y || 0) * 2;

  ctx.save();
  ctx.translate(x + offsetX, y + offsetY);
  ctx.scale(scale, scale);

  if (tracking > 0) {
    let startX = 0;
    if (ctx.textAlign === 'center') startX = -totalW / 2;
    else if (ctx.textAlign === 'right') startX = -totalW;
    
    ctx.textAlign = 'left';
    for (const ch of chars) {
      applyTextShadow(ctx, zone.shadow);
      ctx.fillText(ch, startX, 0);
      startX += ctx.measureText(ch).width + tracking;
    }
  } else {
    ctx.fillText(display, 0, 0);
  }
  clearShadow(ctx);
  ctx.restore();
}

function drawGradient(ctx, x, y, w, h, fromColor, toColor) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, fromColor);
  g.addColorStop(1, toColor);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

// ─── Template Painters ─────────────────────────────────────────────

function paintT1(ctx, tpl) {
  const { zones } = tpl;

  // Logo box (centered top)
  const bW = 320, bH = 140, bX = W/2 - bW/2, bY = 56;
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2;
  ctx.strokeRect(bX, bY, bW, bH);

  // Ornament
  if (zones.ornament) {
    drawText(ctx, zones.ornament.text, W/2, bY + 46, { ...zones.ornament });
  }

  // Sub
  if (zones.brandSub) {
    drawText(ctx, zones.brandSub.text, W/2, bY + 76, { ...zones.brandSub, size: zones.brandSub.size });
  }
  // Name
  if (zones.brandName) {
    drawText(ctx, zones.brandName.text, W/2, bY + 116, { ...zones.brandName, size: zones.brandName.size });
  }

  // Text zone: right side mid
  const rX = W - 56, midY = H / 2;
  if (zones.h1)      drawText(ctx, zones.h1.text,      rX, midY - 120, { ...zones.h1 });
  if (zones.h2)      drawText(ctx, zones.h2.text,      rX, midY + 20,  { ...zones.h2 });
  if (zones.tagline) drawText(ctx, zones.tagline.text, rX, midY + 110, { ...zones.tagline });

  // Footer bar
  const fY = H - 96;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, fY, W, 96);
  ctx.strokeStyle = 'rgba(162,130,66,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, fY); ctx.lineTo(W, fY); ctx.stroke();
  if (zones.footer) drawText(ctx, zones.footer.text, W/2, H - 32, { ...zones.footer });
}

function paintT2(ctx, tpl) {
  const { zones } = tpl;
  const topY = H * 0.04;

  // Upper dark gradient overlay
  drawGradient(ctx, 0, 0, W, H * 0.52, '#0d0b07', 'rgba(13,11,7,0)');

  // Pre-word
  if (zones.pre) drawText(ctx, zones.pre.text, W/2, topY + 100, { ...zones.pre });

  // SVG-style swirl arcs in gold
  ctx.save();
  ctx.strokeStyle = '#A28242';
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(W * 0.1,  topY + 170);
  ctx.quadraticCurveTo(W * 0.37, topY + 90,  W * 0.5, topY + 170);
  ctx.quadraticCurveTo(W * 0.63, topY + 250, W * 0.9, topY + 170);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.moveTo(W * 0.14, topY + 178);
  ctx.quadraticCurveTo(W * 0.38, topY + 98,  W * 0.5, topY + 178);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  if (zones.h1) drawText(ctx, zones.h1.text, W/2, topY + 280, { ...zones.h1 });
  if (zones.h2) drawText(ctx, zones.h2.text, W/2, topY + 420, { ...zones.h2 });

  // Bottom gradient
  drawGradient(ctx, 0, H * 0.7, W, H * 0.3, 'rgba(13,11,7,0)', 'rgba(13,11,7,0.5)');
}

function paintT3(ctx, tpl) {
  const { zones } = tpl;

  // Bottom gradient
  drawGradient(ctx, 0, H * 0.55, W, H * 0.45, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.82)');

  // Top bar
  if (zones.handle)    drawText(ctx, zones.handle.text,    48, 72, { ...zones.handle, size: zones.handle.size });
  // Logo badge right
  if (zones.brandName) {
    const bW2 = 200, bH2 = 44, bX2 = W - 48 - bW2, bY2 = 40;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, bX2, bY2, bW2, bH2, 8);
    ctx.fill();
    drawText(ctx, zones.brandName.text, bX2 + bW2/2, bY2 + 28, { ...zones.brandName, align: 'center', size: zones.brandName.size });
  }

  // Bottom text
  if (zones.h1)      drawText(ctx, zones.h1.text,      W/2, H - 130, { ...zones.h1 });
  if (zones.tagline) drawText(ctx, zones.tagline.text, W/2, H - 60,  { ...zones.tagline });
}

function paintT4(ctx, tpl) {
  const { zones } = tpl;

  // Top bar
  if (zones.handle)    drawText(ctx, zones.handle.text,    48, 72, { ...zones.handle, size: zones.handle.size });
  if (zones.brandName) {
    const bW2 = 200, bH2 = 44, bX2 = W - 48 - bW2, bY2 = 40;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, bX2, bY2, bW2, bH2, 8);
    ctx.fill();
    drawText(ctx, zones.brandName.text, bX2 + bW2/2, bY2 + 28, { ...zones.brandName, align: 'center', size: zones.brandName.size });
  }

  // Verse zone: right side, vertical center
  const rX = W - 56, midY = H / 2;
  if (zones.h1)      drawText(ctx, zones.h1.text,      rX, midY - 60, { ...zones.h1 });
  if (zones.h2)      drawText(ctx, zones.h2.text,      rX, midY + 40, { ...zones.h2 });
  if (zones.tagline) drawText(ctx, zones.tagline.text, rX, midY + 90, { ...zones.tagline });
}

function paintT5(ctx, tpl) {
  const { zones } = tpl;

  // Bottom glow gradient
  drawGradient(ctx, 0, H * 0.5, W, H * 0.5, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.7)');

  // Logo top left
  if (zones.brandName) drawText(ctx, zones.brandName.text, 48, 100, { ...zones.brandName });
  if (zones.brandSub)  drawText(ctx, zones.brandSub.text,  48, 136, { ...zones.brandSub });

  // Artisan text lower center
  if (zones.h1) drawText(ctx, zones.h1.text, W/2, H - 220, { ...zones.h1 });
  if (zones.h2) drawText(ctx, zones.h2.text, W/2, H - 130, { ...zones.h2 });
}

const PAINTERS = [paintT1, paintT2, paintT3, paintT4, paintT5];

// ─── Main Export Function ─────────────────────────────────────────
export async function exportToPNG(activeTpl, tplIndex, portrait = true) {
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const { category, overlay } = activeTpl;
  const isArch = category === 'Arch';
  const isEditorial = category === 'Editorial';
  const isGlass = category === 'Glassmorphism';
  const isClassic = category === 'Classic';

  // ── 1. Background Fill (For Editorial Split) ──
  const activeOverlay = getOverlayById(overlay ? overlay.id : 'none');
  ctx.fillStyle = '#0a0a08'; // Default fallback
  if (isEditorial && activeOverlay.type === 'solid') {
    ctx.fillStyle = activeOverlay.css;
  }
  ctx.fillRect(0, 0, W, H);

  // ── 2. Background Image ──
  const { hero } = activeTpl;
  if (hero.url) {
    try {
      const img = await loadImage(hero.url);
      ctx.save();
      
      // Apply structural masks
      if (isArch) {
        // Draw an Arch mask (radius 500 on top corners, rect on bottom)
        ctx.beginPath();
        const ax = W * 0.1, ay = H * 0.15, aw = W * 0.8, ah = H * 0.85;
        const rad = 500;
        ctx.moveTo(ax + rad, ay);
        ctx.lineTo(ax + aw - rad, ay);
        ctx.arcTo(ax + aw, ay, ax + aw, ay + rad, rad);
        ctx.lineTo(ax + aw, ay + ah);
        ctx.lineTo(ax, ay + ah);
        ctx.lineTo(ax, ay + rad);
        ctx.arcTo(ax, ay, ax + rad, ay, rad);
        ctx.closePath();
        ctx.clip();
      } else if (isEditorial) {
        // Draw image only on the right half
        ctx.beginPath();
        ctx.rect(W / 2, 0, W / 2, H);
        ctx.clip();
      }

      if (hero.blur > 0) ctx.filter = `blur(${hero.blur * 2}px)`;
      
      // Draw image to fill its container
      if (isEditorial) {
        drawCover(ctx, img, W / 2, 0, W / 2, H, hero.x, hero.y, hero.scale, hero.mirror);
      } else {
        drawCover(ctx, img, 0, 0, W, H, hero.x, hero.y, hero.scale, hero.mirror);
      }
      
      ctx.filter = 'none';
      ctx.restore();
    } catch (e) { console.warn('Hero image error', e); }
  }

  // ── Overlay Layer ──
  if (overlay) {
    const overlayOpacity = overlay.opacity / 100;

    if (activeOverlay.id !== 'none' && overlayOpacity > 0) {
      ctx.save();
      
      if (isArch) {
        ctx.beginPath();
        const ax = W * 0.1, ay = H * 0.15, aw = W * 0.8, ah = H * 0.85;
        const rad = 500;
        ctx.moveTo(ax + rad, ay);
        ctx.lineTo(ax + aw - rad, ay);
        ctx.arcTo(ax + aw, ay, ax + aw, ay + rad, rad);
        ctx.lineTo(ax + aw, ay + ah);
        ctx.lineTo(ax, ay + ah);
        ctx.lineTo(ax, ay + rad);
        ctx.arcTo(ax, ay, ax + rad, ay, rad);
        ctx.closePath();
        ctx.clip();
      } else if (isEditorial) {
        ctx.beginPath();
        ctx.rect(W / 2, 0, W / 2, H);
        ctx.clip();
      }

      const prevComposite = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = activeOverlay.blend_mode || 'normal';
      ctx.globalAlpha = overlayOpacity;

      if (activeOverlay.type === 'solid') {
        ctx.fillStyle = activeOverlay.css;
      } else if (activeOverlay.id === 'dark-fade-bottom') {
        const grad = ctx.createLinearGradient(0, H, 0, H * 0.3);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
      } else if (activeOverlay.id === 'dark-fade-top') {
        const grad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
        grad.addColorStop(0, 'rgba(0,0,0,0.9)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
      } else if (activeOverlay.id === 'warm-glow-center') {
        const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.7);
        grad.addColorStop(0, 'rgba(255,200,100,0.8)');
        grad.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = grad;
      } else if (activeOverlay.id === 'light-fade-bottom') {
        const grad = ctx.createLinearGradient(0, H, 0, H * 0.3);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = 'transparent';
      }

      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  // ── Glassmorphism Layer ──
  if (isGlass) {
    ctx.save();
    const gx = W * 0.1, gy = H * 0.15, gw = W * 0.8, gh = H * 0.7;
    const rad = 24;
    
    // Create rounded rect path for glass
    ctx.beginPath();
    ctx.moveTo(gx + rad, gy);
    ctx.lineTo(gx + gw - rad, gy);
    ctx.arcTo(gx + gw, gy, gx + gw, gy + rad, rad);
    ctx.lineTo(gx + gw, gy + gh - rad);
    ctx.arcTo(gx + gw, gy + gh, gx + gw - rad, gy + gh, rad);
    ctx.lineTo(gx + rad, gy + gh);
    ctx.arcTo(gx, gy + gh, gx, gy + gh - rad, rad);
    ctx.lineTo(gx, gy + rad);
    ctx.arcTo(gx, gy, gx + rad, gy, rad);
    ctx.closePath();

    // Fill with translucent white
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();

    // Add border
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    ctx.restore();
  }

  // ── Foreground Layer ──
  const { fg } = activeTpl;
  if (fg.url) {
    try {
      const img = await loadImage(fg.url);
      ctx.save();
      ctx.globalCompositeOperation = fg.blendMode || 'normal';
      ctx.globalAlpha = fg.opacity / 100;
      drawFree(ctx, img, W, H, fg.x, fg.y, fg.scale);
      ctx.restore();
    } catch (e) { console.warn('FG image error', e); }
  }

  // ── Logo Layer ──
  const { logo } = activeTpl;
  if (logo && logo.url) {
    try {
      const img = await loadImage(logo.url);
      ctx.save();
      ctx.globalCompositeOperation = logo.blendMode || 'normal';
      ctx.globalAlpha = logo.opacity / 100;
      drawFree(ctx, img, W, H, logo.x, logo.y, logo.scale);
      ctx.restore();
    } catch (e) { console.warn('Logo image error', e); }
  }

  // ── Template Text Layers ──
  const painter = PAINTERS[tplIndex];
  if (painter) painter(ctx, activeTpl);

  // ── Rounded corners for T4 ──
  if (tplIndex === 3) {
    const temp = document.createElement('canvas');
    temp.width = W; temp.height = H;
    const tc = temp.getContext('2d');
    roundRect(tc, 0, 0, W, H, 40);
    tc.clip();
    tc.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(temp, 0, 0);
  }

  // ── Download ──
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `east-eatery-post-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, 'image/png');
}
