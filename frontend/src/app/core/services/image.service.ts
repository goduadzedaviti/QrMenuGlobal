import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private readonly directUploadLimitBytes = 1 * 1024 * 1024;

  resizeImage(file: File, maxWidth: number = 1280, maxHeight: number = 1280): Promise<Blob> {
    if (file.size <= this.directUploadLimitBytes) {
      return Promise.resolve(file);
    }

    if ('createImageBitmap' in window) {
      return this.resizeWithImageBitmap(file, maxWidth, maxHeight);
    }

    return this.resizeWithImageElement(file, maxWidth, maxHeight);
  }

  private async resizeWithImageBitmap(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    const bitmap = await createImageBitmap(file);

    try {
      const { width, height } = this.calculateDimensions(bitmap.width, bitmap.height, maxWidth, maxHeight);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context unavailable');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      ctx.drawImage(bitmap, 0, 0, width, height);

      return await this.canvasToBlob(canvas, this.getOutputType(file.type), 0.72);
    } finally {
      bitmap.close();
    }
  }

  private resizeWithImageElement(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight);

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob failed'));
        }, this.getOutputType(file.type), 0.72);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };
    });
  }

  private calculateDimensions(width: number, height: number, maxWidth: number, maxHeight: number) {
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }

    const scale = Math.min(maxWidth / width, maxHeight / height);
    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale)
    };
  }

  private getOutputType(inputType: string): string {
    return inputType === 'image/png' ? 'image/png' : 'image/jpeg';
  }

  private canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('Canvas to Blob failed'));
      }, type, quality);
    });
  }
}
