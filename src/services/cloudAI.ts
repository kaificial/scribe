// client-side service for the cloud AI (Claude) path

const API_ENDPOINT = '/api/convert';
const TIMEOUT_MS = 30_000; // 30 second timeout

// user-friendly error messages for each status code
const ERROR_MESSAGES: Record<number, string> = {
    400: 'Invalid image format.',
    413: 'Image is too large. Please use a smaller image.',
    429: 'Rate limited. Please wait a moment and try again.',
    502: 'Cloud AI is temporarily unavailable. Try local mode.',
};

// marks an error as already having a user-safe message, so it can be re-thrown as-is
class UserFacingError extends Error {}

export async function convertImageViaCloud(imageDataUrl: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageDataUrl }),
            signal: controller.signal,
        });

        // response body isn't guaranteed to be JSON (e.g. a gateway error page), so parse defensively
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message = ERROR_MESSAGES[response.status] || data?.error || 'Failed to process image.';
            throw new UserFacingError(message);
        }

        return data?.latex || '';
    } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }
        // re-throw if it's already our formatted error; anything else (network/parse failures) gets a generic message
        if (err instanceof UserFacingError) throw err;
        throw new Error('Failed to process image.');
    } finally {
        clearTimeout(timeout);
    }
}
