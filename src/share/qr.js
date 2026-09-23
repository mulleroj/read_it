import { qrcode } from '../vendor/qrcode-generator.mjs';

/**
 * @param {string} text
 * @param {number} [size] cell size in px
 */
export function generateQrMatrix(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr;
}

/**
 * @param {string} text
 * @param {number} [size]
 * @returns {HTMLCanvasElement}
 */
export function renderQrToCanvas(text, size = 6) {
  const qr = generateQrMatrix(text);
  const moduleCount = qr.getModuleCount();
  const canvas = document.createElement('canvas');
  const margin = 2;
  const dim = (moduleCount + margin * 2) * size;
  canvas.width = dim;
  canvas.height = dim;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas není k dispozici.');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, dim, dim);
  ctx.fillStyle = '#111827';

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (qr.isDark(row, col)) {
        ctx.fillRect((col + margin) * size, (row + margin) * size, size, size);
      }
    }
  }

  return canvas;
}

/**
 * @param {string} text
 * @param {number} [size]
 */
export async function generateQrDataUrl(text, size = 6) {
  const canvas = renderQrToCanvas(text, size);
  return canvas.toDataURL('image/png');
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 */
export function downloadQrCanvas(canvas, filename = 'readit-lesson-qr.png') {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * Node/test helper – returns matrix dimensions without DOM.
 * @param {string} text
 */
export function getQrModuleCount(text) {
  return generateQrMatrix(text).getModuleCount();
}
