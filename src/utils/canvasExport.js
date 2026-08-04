import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

const DEFAULT_EXPORT_WIDTH = 2000;

export async function exportTemplate(activeTpl, format = 'png', filename = 'post', brandTheme = null, targetWidth = DEFAULT_EXPORT_WIDTH) {
  if (!activeTpl) throw new Error('Active template state not provided.');
  
  // Find the preview frame DOM node
  const frameNode = document.querySelector('.pv-frame');
  if (!frameNode) throw new Error('Could not find the preview frame to export.');

  // Deselect any active elements so bounding boxes don't show up in the export
  const originalCursor = frameNode.style.cursor;
  frameNode.style.cursor = 'default';

  // Deselect TransformGizmo boundaries temporarily
  const gizmos = frameNode.querySelectorAll('.transform-gizmo-border, .resize-handle');
  gizmos.forEach(el => el.style.display = 'none');

  try {
    // The preview is 432px wide. We want to export at 2000px wide.
    const originalWidth = frameNode.offsetWidth || 432;
    const scale = targetWidth / originalWidth;

    const options = {
      quality: 0.98,
      pixelRatio: scale,
      skipFonts: false,
    };

    let dataUrl;
    if (format === 'jpeg' || format === 'jpg') {
      dataUrl = await toJpeg(frameNode, options);
    } else {
      dataUrl = await toPng(frameNode, options);
    }

    if (format === 'pdf') {
      const imgProps = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.width, h: img.height });
        img.src = dataUrl;
      });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [imgProps.w, imgProps.h]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgProps.w, imgProps.h);
      pdf.save(`${filename}.pdf`);
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error('Export error:', err);
    throw err;
  } finally {
    frameNode.style.cursor = originalCursor;
    gizmos.forEach(el => el.style.display = '');
  }
}

export async function getPreviewImage(activeTpl, brandTheme) {
  const frameNode = document.querySelector('.pv-frame');
  if (!frameNode) throw new Error('Could not find the preview frame.');
  return await toPng(frameNode, { pixelRatio: 2 }); // Lower resolution for fast on-screen preview
}
