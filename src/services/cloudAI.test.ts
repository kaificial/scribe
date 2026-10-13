import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { convertImageViaCloud } from './cloudAI';

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('convertImageViaCloud', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('returns the latex string on success', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { latex: 'x^2 + 1' }));
        await expect(convertImageViaCloud('data:image/png;base64,abc')).resolves.toBe('x^2 + 1');
    });

    it('returns an empty string when the success response has no latex field', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse(200, {}));
        await expect(convertImageViaCloud('data:image/png;base64,abc')).resolves.toBe('');
    });

    it('maps a 413 status to the friendly "too large" message', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse(413, { error: 'raw server text' }));
        await expect(convertImageViaCloud('x')).rejects.toThrow('Image is too large. Please use a smaller image.');
    });

    it('maps a 429 status to the friendly rate-limit message', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse(429, {}));
        await expect(convertImageViaCloud('x')).rejects.toThrow('Rate limited. Please wait a moment and try again.');
    });

    it('falls back to the server-provided error for an unmapped status code', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse(418, { error: "I'm a teapot" }));
        await expect(convertImageViaCloud('x')).rejects.toThrow("I'm a teapot");
    });

    it('falls back to a generic message when an error response has no JSON body at all', async () => {
        // e.g. a 404/502 from infra in front of the function, not our handler
        vi.mocked(fetch).mockResolvedValue(new Response('<html>not found</html>', { status: 404 }));
        await expect(convertImageViaCloud('x')).rejects.toThrow('Failed to process image.');
    });

    it('never leaks a raw browser/JS exception message to the caller', async () => {
        vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
        await expect(convertImageViaCloud('x')).rejects.toThrow('Failed to process image.');
    });

    it('maps an aborted request to a timeout message', async () => {
        const abortError = new DOMException('The operation was aborted.', 'AbortError');
        vi.mocked(fetch).mockRejectedValue(abortError);
        await expect(convertImageViaCloud('x')).rejects.toThrow('Request timed out. Please try again.');
    });
});
