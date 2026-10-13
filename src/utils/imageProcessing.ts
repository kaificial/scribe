// pure pixel/geometry math used to prep a drawing before it's sent off for recognition

// thresholds pixels to pure black/white in place, based on luminance
export function thresholdPixels(data: Uint8ClampedArray, threshold = 180): void {
    for (let i = 0; i < data.length; i += 4) {
        const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const v = luminance < threshold ? 0 : 255;
        data[i] = v; data[i + 1] = v; data[i + 2] = v;
    }
}

export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export interface PixelBuffer {
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

// finds the bounding box of all non-transparent pixels, padded and clamped to image bounds
export function findContentBoundingBox(image: PixelBuffer, padding = 40): BoundingBox | null {
    const { data, width, height } = image;
    let minX = width, minY = height, maxX = 0, maxY = 0, found = false;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] > 0) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }

    if (!found) return null;

    return {
        minX: Math.max(0, minX - padding),
        minY: Math.max(0, minY - padding),
        maxX: Math.min(width, maxX + padding),
        maxY: Math.min(height, maxY + padding),
    };
}

// scales width/height down to fit within maxDim, preserving aspect ratio; leaves untouched if already within bounds
export function computeScaledDimensions(width: number, height: number, maxDim: number): { width: number; height: number } {
    if (width <= maxDim && height <= maxDim) {
        return { width, height };
    }
    const ratio = Math.min(maxDim / width, maxDim / height);
    return {
        width: Math.floor(width * ratio),
        height: Math.floor(height * ratio),
    };
}
