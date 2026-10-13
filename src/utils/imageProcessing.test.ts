import { describe, it, expect } from 'vitest';
import { thresholdPixels, findContentBoundingBox, computeScaledDimensions } from './imageProcessing';

describe('thresholdPixels', () => {
    it('turns dark pixels pure black and light pixels pure white', () => {
        // one dark gray pixel (luminance well under 180), one light gray pixel (over 180)
        const data = new Uint8ClampedArray([20, 20, 20, 255, 220, 220, 220, 255]);
        thresholdPixels(data);
        expect([data[0], data[1], data[2]]).toEqual([0, 0, 0]);
        expect([data[4], data[5], data[6]]).toEqual([255, 255, 255]);
    });

    it('leaves the alpha channel untouched', () => {
        const data = new Uint8ClampedArray([0, 0, 0, 128]);
        thresholdPixels(data);
        expect(data[3]).toBe(128);
    });

    it('respects a custom threshold', () => {
        // luminance ~150: below a threshold of 200, at/above a threshold of 100
        const data = new Uint8ClampedArray([150, 150, 150, 255]);
        thresholdPixels(data, 200);
        expect(data[0]).toBe(0);

        const data2 = new Uint8ClampedArray([150, 150, 150, 255]);
        thresholdPixels(data2, 100);
        expect(data2[0]).toBe(255);
    });
});

describe('findContentBoundingBox', () => {
    function makeBuffer(width: number, height: number, opaquePixels: [number, number][]) {
        const data = new Uint8ClampedArray(width * height * 4); // alpha 0 everywhere by default
        for (const [x, y] of opaquePixels) {
            data[(y * width + x) * 4 + 3] = 255;
        }
        return { data, width, height };
    }

    it('returns null when the canvas is fully transparent (nothing drawn)', () => {
        const buffer = makeBuffer(20, 20, []);
        expect(findContentBoundingBox(buffer)).toBeNull();
    });

    it('finds a tight box around a single opaque pixel, padded and clamped to the image', () => {
        const buffer = makeBuffer(100, 100, [[50, 50]]);
        const box = findContentBoundingBox(buffer, 10);
        expect(box).toEqual({ minX: 40, minY: 40, maxX: 60, maxY: 60 });
    });

    it('clamps padding at the image edges instead of going negative or out of bounds', () => {
        const buffer = makeBuffer(30, 30, [[0, 0], [29, 29]]);
        const box = findContentBoundingBox(buffer, 40);
        expect(box).toEqual({ minX: 0, minY: 0, maxX: 30, maxY: 30 });
    });

    it('spans multiple scattered marks', () => {
        const buffer = makeBuffer(100, 100, [[10, 10], [80, 60]]);
        const box = findContentBoundingBox(buffer, 0);
        expect(box).toEqual({ minX: 10, minY: 10, maxX: 80, maxY: 60 });
    });
});

describe('computeScaledDimensions', () => {
    it('leaves dimensions unchanged when already within maxDim', () => {
        expect(computeScaledDimensions(300, 200, 512)).toEqual({ width: 300, height: 200 });
    });

    it('leaves dimensions unchanged when exactly at maxDim', () => {
        expect(computeScaledDimensions(512, 512, 512)).toEqual({ width: 512, height: 512 });
    });

    it('downscales the larger dimension to maxDim, preserving aspect ratio', () => {
        // 1024x512 -> should scale by 0.5 to 512x256
        expect(computeScaledDimensions(1024, 512, 512)).toEqual({ width: 512, height: 256 });
    });

    it('downscales a portrait image correctly', () => {
        // 400x2000 -> ratio 512/2000 = 0.256 -> width = floor(400*0.256) = 102
        expect(computeScaledDimensions(400, 2000, 512)).toEqual({ width: 102, height: 512 });
    });
});
