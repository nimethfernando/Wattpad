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
      return reject(new Error('Please select an image file (PNG, JPG, JPEG, WEBP).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error reading image file from your device.'));
    reader.onload = (event) => {
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

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          name: file.name,
          sizeKb: Math.round((dataUrl.length * 0.75) / 1024)
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}
