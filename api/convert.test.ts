import { describe, it, expect } from 'vitest';
import { parseDataUrl, isRateLimited, ALLOWED_MIME, MAX_BODY_BYTES } from './convert';

describe('parseDataUrl', () => {
    it('parses a valid png data URL', () => {
        expect(parseDataUrl('data:image/png;base64,aGVsbG8=')).toEqual({
            mime: 'image/png',
            base64: 'aGVsbG8=',
        });
    });

    it('parses a valid jpeg data URL', () => {
        expect(parseDataUrl('data:image/jpeg;base64,//9j')).toEqual({
            mime: 'image/jpeg',
            base64: '//9j',
        });
    });

    it('rejects a plain (non-data-URL) string', () => {
        expect(parseDataUrl('not-a-data-url')).toBeNull();
    });

    it('rejects a data URL with no base64 payload', () => {
        expect(parseDataUrl('data:image/png;base64,')).toBeNull();
    });

    it('rejects a data URL for a non-image mime type', () => {
        // regex only matches image/* mimes, so this should fail to parse at all
        expect(parseDataUrl('data:text/html;base64,aGVsbG8=')).toBeNull();
    });

    it('rejects a data URL missing the base64 marker', () => {
        expect(parseDataUrl('data:image/png,aGVsbG8=')).toBeNull();
    });

    it('flags mime types outside the server allow-list even though the URL parses', () => {
        // e.g. image/gif is a valid "image/*" data URL but should never reach the model
        const parsed = parseDataUrl('data:image/gif;base64,aGVsbG8=');
        expect(parsed).not.toBeNull();
        expect(ALLOWED_MIME.includes(parsed!.mime)).toBe(false);
    });

    it('parses mime subtypes containing "+", "." or "-" (e.g. "image/svg+xml"), even though the allow-list still rejects them', () => {
        const parsed = parseDataUrl('data:image/svg+xml;base64,aGVsbG8=');
        expect(parsed).toEqual({ mime: 'image/svg+xml', base64: 'aGVsbG8=' });
        expect(ALLOWED_MIME.includes(parsed!.mime)).toBe(false);
    });

    it('accepts every mime type declared in the server allow-list', () => {
        for (const mime of ALLOWED_MIME) {
            expect(parseDataUrl(`data:${mime};base64,aGVsbG8=`)).toEqual({ mime, base64: 'aGVsbG8=' });
        }
    });
});

describe('MAX_BODY_BYTES', () => {
    it('is set to 4 MB', () => {
        expect(MAX_BODY_BYTES).toBe(4 * 1024 * 1024);
    });
});

describe('isRateLimited', () => {
    it('allows the first request from a fresh IP', () => {
        expect(isRateLimited('ip-fresh-1').limited).toBe(false);
    });

    it('allows repeated requests under the 100/window cap', () => {
        const ip = 'ip-under-cap';
        for (let i = 0; i < 99; i++) {
            expect(isRateLimited(ip).limited).toBe(false);
        }
    });

    it('blocks the 101st request within the same window and reports a retry time', () => {
        const ip = 'ip-over-cap';
        for (let i = 0; i < 100; i++) {
            isRateLimited(ip);
        }
        const result = isRateLimited(ip);
        expect(result.limited).toBe(true);
        expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('tracks each IP independently', () => {
        const busyIp = 'ip-busy';
        for (let i = 0; i < 100; i++) isRateLimited(busyIp);
        expect(isRateLimited(busyIp).limited).toBe(true);
        expect(isRateLimited('ip-quiet').limited).toBe(false);
    });
});
