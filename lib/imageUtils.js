/**
 * Helper: Process, resize, and compress an image file directly from user's device.
 * Converts to JPEG dataUrl with canvas scaling.
 * 
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @param {number} quality
 * @returns {Promise<{ dataUrl: string, name: string, sizeKb: number }>}
 */
export function processImageFile(file, maxWidth = 1200, maxHeight = 900, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected.'));
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (PNG, JPG, JPEG, WEBP, SVG).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error reading image file from your device.'));
    reader.onload = (event) => {
      if (file.type === 'image/svg+xml') {
        const svgDataUrl = event.target.result;
        return resolve({
          dataUrl: svgDataUrl,
          name: file.name,
          sizeKb: Math.round((svgDataUrl.length * 0.75) / 1024),
          toString() { return svgDataUrl; },
          valueOf() { return svgDataUrl; }
        });
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const isTransparentType =
          file.type === 'image/png' ||
          file.type === 'image/webp' ||
          file.type === 'image/gif' ||
          file.type === 'image/x-icon';
        const outputMime = isTransparentType ? 'image/png' : 'image/jpeg';
        const dataUrl = isTransparentType
          ? canvas.toDataURL(outputMime)
          : canvas.toDataURL(outputMime, quality);

        resolve({
          dataUrl,
          name: file.name,
          sizeKb: Math.round((dataUrl.length * 0.75) / 1024),
          toString() { return dataUrl; },
          valueOf() { return dataUrl; }
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Removes solid black or white background from an image dataUrl/URL, making it a clean transparent PNG.
 * Perfect for user-uploaded logos exported from Canva/MS Paint with solid black or white rectangles.
 * 
 * @param {string} dataUrl
 * @param {'auto'|'black'|'white'} targetColor
 * @param {number} tolerance
 * @returns {Promise<string>} Transparent PNG dataUrl
 */
export function removeSolidBackground(dataUrl, targetColor = 'auto', tolerance = 42) {
  return new Promise((resolve, reject) => {
    if (!dataUrl) return reject(new Error('No image provided'));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => reject(new Error('Failed to load image for background removal'));
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample corner pixels to determine background color
      const corners = [
        0, // top-left
        (canvas.width - 1) * 4, // top-right
        ((canvas.height - 1) * canvas.width) * 4, // bottom-left
        ((canvas.height * canvas.width) - 1) * 4 // bottom-right
      ];

      let bgR = 0, bgG = 0, bgB = 0;
      if (targetColor === 'black') {
        bgR = 0; bgG = 0; bgB = 0;
      } else if (targetColor === 'white') {
        bgR = 255; bgG = 255; bgB = 255;
      } else {
        // Auto-detect: compute average of corner pixels
        let sampleR = 0, sampleG = 0, sampleB = 0;
        corners.forEach(idx => {
          sampleR += data[idx];
          sampleG += data[idx + 1];
          sampleB += data[idx + 2];
        });
        sampleR = Math.round(sampleR / corners.length);
        sampleG = Math.round(sampleG / corners.length);
        sampleB = Math.round(sampleB / corners.length);

        // If average is dark
        if (sampleR < 60 && sampleG < 60 && sampleB < 60) {
          bgR = sampleR; bgG = sampleG; bgB = sampleB;
        } else if (sampleR > 200 && sampleG > 200 && sampleB > 200) {
          bgR = sampleR; bgG = sampleG; bgB = sampleB;
        } else {
          bgR = data[0]; bgG = data[1]; bgB = data[2];
        }
      }

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        // Euclidean color distance in RGB space
        const dist = Math.sqrt(
          (r - bgR) ** 2 +
          (g - bgG) ** 2 +
          (b - bgB) ** 2
        );

        if (dist <= tolerance) {
          data[i + 3] = 0; // Transparent
        } else if (dist <= tolerance + 16) {
          // Feather antialiasing edge
          const factor = (dist - tolerance) / 16;
          data[i + 3] = Math.round(a * factor);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}


