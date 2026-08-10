import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { renderTplToFabricCanvas } from '../components/templates/FabricCanvas';

const PREVIEW_W = 432;
const PREVIEW_H = 540;
const EXPORT_W  = 2000;
const EXPORT_H  = 2500;
const SCALE     = EXPORT_W / PREVIEW_W; // ~4.63

// ── Export (PNG / JPG / PDF) at full 2000×2500 ────────────────────
export async function exportTemplate(activeTpl, format = 'png', filename = 'post') {
  if (!activeTpl) throw new Error('No template state provided.');

  // Offscreen canvas element
  const el = document.createElement('canvas');
  el.width  = EXPORT_W;
  el.height = EXPORT_H;

  const canvas = new fabric.StaticCanvas(el, {
    width:  EXPORT_W,
    height: EXPORT_H,
    enableRetinaScaling: false,
  });

  await renderTplToFabricCanvas(activeTpl, canvas, EXPORT_W, EXPORT_H, SCALE);

  const dataUrl = canvas.toDataURL({
    format: format === 'jpg' || format === 'jpeg' ? 'jpeg' : 'png',
    quality: 0.98,
    multiplier: 1,
  });

  canvas.dispose();

  if (format === 'pdf') {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [EXPORT_W, EXPORT_H] });
    pdf.addImage(dataUrl, 'PNG', 0, 0, EXPORT_W, EXPORT_H);
    pdf.save(`${filename}.pdf`);
  } else {
    const a = document.createElement('a');
    a.href     = dataUrl;
    a.download = `${filename}.${format === 'jpeg' ? 'jpg' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// ── Preview snapshot (used by the 🔍 Preview button) ──────────────
export async function getPreviewImage(activeTpl) {
  if (!activeTpl) throw new Error('No template state provided.');

  const el = document.createElement('canvas');
  el.width  = PREVIEW_W;
  el.height = PREVIEW_H;

  const canvas = new fabric.StaticCanvas(el, {
    width:  PREVIEW_W,
    height: PREVIEW_H,
    enableRetinaScaling: false,
  });

  await renderTplToFabricCanvas(activeTpl, canvas, PREVIEW_W, PREVIEW_H, 1);

  const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });

  canvas.dispose();
  return dataUrl;
}
