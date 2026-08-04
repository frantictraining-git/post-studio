import jsPDF from 'jspdf';

const FRAME_PX = 432; // matches the on-screen .pv-frame width (432x540 = 4:5)
const ASPECT_RATIO = 1350 / 1080; // Instagram portrait 4:5

// Export resolution presets — width in px, height derived from the 4:5 ratio.
export const EXPORT_SIZES = {
  standard: 1080,
  hd: 2000,
};
const DEFAULT_EXPORT_WIDTH = EXPORT_SIZES.hd;

function getDimensions(targetWidth = DEFAULT_EXPORT_WIDTH) {
  const W = Math.round(targetWidth);
  const H = Math.round(W * ASPECT_RATIO);
  const SCALE = W / FRAME_PX; // at the old fixed 1080px export this equals 2.5
  return { W, H, SCALE };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('No image src provided'));
      return;
    }
    const img = new Image();
    // Only set crossOrigin if it's an external http/https URL
    if (typeof src === 'string' && src.startsWith('http')) {
      img.crossOrigin = 'Anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + src));
    img.src = src;
  });
}

function drawCover(ctx, img, w, h, posX = 50, posY = 50, scale = 1, mirror = false) {
  const iAR = img.naturalWidth / img.naturalHeight;
  const cAR = w / h;
  let sWidth, sHeight, sx, sy;

  if (iAR > cAR) { 
    sHeight = img.naturalHeight;
    sWidth = img.naturalHeight * cAR;
    sx = (img.naturalWidth - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = img.naturalWidth;
    sHeight = img.naturalWidth / cAR;
    sx = 0;
    sy = (img.naturalHeight - sHeight) / 2;
  }

  ctx.save();
  const originX = w / 2;
  const originY = h / 2;
  const translateX = w * ((posX - 50) / 100);
  const translateY = h * ((posY - 50) / 100);
  
  ctx.translate(originX + translateX, originY + translateY);
  ctx.scale(scale, scale);
  if (mirror) ctx.scale(-1, 1);
  
  ctx.drawImage(img, sx, sy, sWidth, sHeight, -w/2, -h/2, w, h);
  ctx.restore();
}

function applyTextShadow(ctx, shadow, scale = 2.5) {
  const s = scale / 2.5; // keeps shadow softness proportional at any export resolution
  if (shadow === 'soft') {
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 28 * s;
    ctx.shadowOffsetY = 2 * s;
  } else if (shadow === 'hard') {
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 40 * s;
    ctx.shadowOffsetY = 6 * s;
  } else if (shadow === 'glow') {
    ctx.shadowColor = 'rgba(162,130,66,0.6)';
    ctx.shadowBlur = 40 * s;
    ctx.shadowOffsetY = 0;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
}

function drawText(ctx, zone, brandTheme, dims) {
  if (!zone || zone.visible === false || !zone.text) return;
  const { W, H, SCALE } = dims;

  const text = zone.text;
  let display = text;
  const transform = zone.transform || (zone.caps ? 'uppercase' : 'none');
  if (transform === 'uppercase') display = text.toUpperCase();
  else if (transform === 'lowercase') display = text.toLowerCase();
  else if (transform === 'capitalize') display = text.replace(/\b\w/g, c => c.toUpperCase());
  else if (transform === 'sentence-case') display = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

  let size = (zone.size || 32) * SCALE * (zone.scale || 1); 
  const tracking = (zone.tracking || 0) * SCALE; // Unscaled by zone.scale, matching DOM CSS
  const weight = zone.weight || '400';
  
  let fontFamily = zone.family || 'Minal';
  if (fontFamily === 'var(--primaryFont)') {
    fontFamily = brandTheme?.primaryFont || 'Minal';
  } else if (fontFamily === 'var(--secondaryFont)') {
    fontFamily = brandTheme?.secondaryFont || 'Montserrat';
  }

  const fontVariant = transform === 'small-caps' ? 'small-caps ' : '';
  
  const getW = (str, currentFontSize) => {
    ctx.font = `${fontVariant}${zone.italic ? 'italic ' : ''}${weight} ${currentFontSize}px "${fontFamily}", sans-serif`;
    const chars = [...str];
    if (chars.length === 0) return 0;
    const rawW = chars.reduce((acc, ch) => acc + ctx.measureText(ch).width, 0);
    // letter-spacing adds spacing between chars, but CSS cancels the trailing spacing (marginRight: -tracking)
    return rawW + tracking * Math.max(0, chars.length - 1);
  };

  const lines = display.split('\n');
  let finalLines = [];
  const boxWidth = zone.boxWidth || 0;
  const limitsW = boxWidth > 0 ? (W * boxWidth / 100) : W;

  // Word wrap logic when boxWidth > 0
  if (boxWidth > 0) {
    for (const line of lines) {
      const words = line.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (getW(testLine, size) > limitsW && currentLine) {
          finalLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      finalLines.push(currentLine);
    }
  } else {
    finalLines = lines;
  }

  let maxLineWidth = Math.max(...finalLines.map(l => getW(l, size)));

  // Auto-shrink text size if boxWidth === 0 and maxLineWidth exceeds frame width (matches DOM layoutEffect)
  if (boxWidth === 0 && maxLineWidth > W) {
    const scaleFactor = W / maxLineWidth;
    size = size * scaleFactor;
    maxLineWidth = W;
  }

  const containerWidth = boxWidth > 0 ? limitsW : maxLineWidth;
  
  const x = W * (zone.x ?? 50) / 100;
  const y = H * (zone.y ?? 50) / 100;

  ctx.save();
  ctx.translate(x, y);

  const lineHeight = size * 1.2;
  const totalHeight = finalLines.length * lineHeight;
  // Position first line baseline so text block is vertically centered at (x, y)
  const startY = -(totalHeight / 2) + (size * 0.85);

  ctx.font = `${fontVariant}${zone.italic ? 'italic ' : ''}${weight} ${size}px "${fontFamily}", sans-serif`;
  ctx.fillStyle = zone.color || '#ffffff';
  ctx.textBaseline = 'alphabetic';

  for (let i = 0; i < finalLines.length; i++) {
    const lineText = finalLines[i];
    const lineW = getW(lineText, size);
    let startX = 0;
    
    if (zone.align === 'center') {
      startX = -lineW / 2;
    } else if (zone.align === 'right') {
      startX = (containerWidth / 2) - lineW;
    } else { // left
      startX = -containerWidth / 2;
    }

    applyTextShadow(ctx, zone.shadow, SCALE);
    
    if (tracking > 0) {
      const chars = [...lineText];
      let cx = startX;
      for (let cIdx = 0; cIdx < chars.length; cIdx++) {
        const ch = chars[cIdx];
        ctx.fillText(ch, cx, startY + i * lineHeight);
        cx += ctx.measureText(ch).width + tracking;
      }
    } else {
      ctx.fillText(lineText, startX, startY + i * lineHeight);
    }
    ctx.shadowColor = 'transparent';
  }

  ctx.restore();
}

async function generateCanvas(activeTpl, brandTheme, targetWidth) {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading wait warning:', e);
    }
  }

  const { W, H, SCALE } = getDimensions(targetWidth);

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  
  const { category, overlay } = activeTpl;
  const isArch = category === 'Arch';
  const isEditorial = category === 'Editorial';
  const isGlass = category === 'Glassmorphism';

  // 1. Background Fill
  ctx.fillStyle = '#0a0a08';
  ctx.fillRect(0, 0, W, H);

  // 2. Background Image (Hero)
  const { hero } = activeTpl;
  if (hero && hero.url) {
    try {
      const img = await loadImage(hero.url);
      ctx.save();
      
      if (isArch) {
        ctx.beginPath();
        const ax = W * 0.1, ay = H * 0.15, aw = W * 0.8, ah = H * 0.85;
        const rad = 500 * (W / 1080); // corner radius scales with export resolution
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

      if (hero.blur > 0) ctx.filter = `blur(${hero.blur * SCALE}px)`;
      
      if (isEditorial) {
        ctx.translate(W / 2, 0);
        drawCover(ctx, img, W / 2, H, hero.x, hero.y, hero.scale, hero.mirror);
      } else {
        drawCover(ctx, img, W, H, hero.x, hero.y, hero.scale, hero.mirror);
      }
      
      ctx.filter = 'none';
      ctx.restore();
    } catch (e) {
      console.warn('Hero image draw warning:', e);
    }
  }

  // 3. Overlay Layer
  if (overlay && overlay.id !== 'none' && (overlay.opacity ?? 100) > 0) {
    ctx.save();
    
    if (isArch) {
      ctx.beginPath();
      const ax = W * 0.1, ay = H * 0.15, aw = W * 0.8, ah = H * 0.85;
      const rad = 500 * (W / 1080); // corner radius scales with export resolution
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

    ctx.globalCompositeOperation = overlay.blend_mode || 'normal';
    ctx.globalAlpha = (overlay.opacity ?? 100) / 100;

    if (overlay.type === 'solid') {
      ctx.fillStyle = overlay.css;
    } else if (overlay.id === 'dark-fade-bottom') {
      const grad = ctx.createLinearGradient(0, H, 0, H * 0.3);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
    } else if (overlay.id === 'dark-fade-top') {
      const grad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      grad.addColorStop(0, 'rgba(0,0,0,0.9)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
    } else if (overlay.id === 'warm-glow-center') {
      const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.7);
      grad.addColorStop(0, 'rgba(255,200,100,0.8)');
      grad.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = grad;
    } else if (overlay.id === 'light-fade-bottom') {
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

  // 4. Glassmorphism Layer
  if (isGlass) {
    ctx.save();
    const gx = W * 0.1, gy = H * 0.15, gw = W * 0.8, gh = H * 0.7;
    const rad = 24 * SCALE;
    
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

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();

    ctx.lineWidth = 1 * SCALE;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();
    ctx.restore();
  }

  // 5. Foreground Layer (FG)
  const { fg } = activeTpl;
  if (fg && fg.url) {
    try {
      const img = await loadImage(fg.url);
      ctx.save();
      ctx.globalCompositeOperation = fg.blendMode || 'normal';
      ctx.globalAlpha = (fg.opacity ?? 100) / 100;
      
      const fitScale = Math.min(W / img.naturalWidth, H / img.naturalHeight, 1);
      const fw = img.naturalWidth * fitScale * (fg.scale || 1);
      const fh = img.naturalHeight * fitScale * (fg.scale || 1);
      const fx = (W * ((fg.x ?? 50) / 100)) - (fw / 2);
      const fy = (H * ((fg.y ?? 50) / 100)) - (fh / 2);
      
      ctx.drawImage(img, fx, fy, fw, fh);
      ctx.restore();
    } catch (e) {
      console.warn('FG image draw warning:', e);
    }
  }

  // 6. Logo Layer
  const { logo } = activeTpl;
  if (logo && logo.url) {
    try {
      let finalLogoUrl = logo.url;
      if (finalLogoUrl.includes('1783726767818-dummy_logo.jpg')) {
        finalLogoUrl = '/dummy_logo.jpg';
      }
      const img = await loadImage(finalLogoUrl);
      ctx.save();
      ctx.globalCompositeOperation = logo.blendMode || 'normal';
      ctx.globalAlpha = (logo.opacity ?? 100) / 100;
      
      // DOM CSS: maxWidth: 200px, maxHeight: 150px on 432px frame
      const maxW_DOM = 200;
      const maxH_DOM = 150;
      const fitScale = Math.min(1, maxW_DOM / img.naturalWidth, maxH_DOM / img.naturalHeight);
      
      const lw = img.naturalWidth * fitScale * SCALE * (logo.scale || 1);
      const lh = img.naturalHeight * fitScale * SCALE * (logo.scale || 1);
      const lx = (W * ((logo.x ?? 50) / 100)) - (lw / 2);
      const ly = (H * ((logo.y ?? 15) / 100)) - (lh / 2);
      
      ctx.drawImage(img, lx, ly, lw, lh);
      ctx.restore();
    } catch (e) {
      alert('Logo error: ' + e.message + ' | URL: ' + logo.url.substring(0, 100));
      console.warn('Logo image draw warning:', e);
    }
  }

  // 7. Text Layers
  if (activeTpl.zones) {
    for (const key of Object.keys(activeTpl.zones)) {
      drawText(ctx, activeTpl.zones[key], brandTheme, { W, H, SCALE });
    }
  }

  return canvas;
}

// targetWidth defaults to EXPORT_SIZES.hd (2000px wide / 2500px tall, 4:5).
// Pass EXPORT_SIZES.standard (1080) for the old smaller size if ever needed.
export async function exportTemplate(activeTpl, format = 'png', filename = 'post', brandTheme = null, targetWidth = DEFAULT_EXPORT_WIDTH) {
  if (!activeTpl) throw new Error('Active template state not provided.');
  
  const canvas = await generateCanvas(activeTpl, brandTheme, targetWidth);

  if (format === 'pdf') {
    const dataUrl = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
  } else {
    const mimeType = format === 'jpeg' || format === 'jpg' ? 'image/jpeg' : 'image/png';
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, mimeType, 0.98);
  }
}

// Preview modal stays at the standard size — it's just for on-screen zoom,
// so there's no need to pay the cost of rendering at full export resolution.
export async function getPreviewImage(activeTpl, brandTheme = null, targetWidth = EXPORT_SIZES.standard) {
  if (!activeTpl) throw new Error('Active template state not provided.');
  const canvas = await generateCanvas(activeTpl, brandTheme, targetWidth);
  return canvas.toDataURL('image/jpeg', 0.95);
}
