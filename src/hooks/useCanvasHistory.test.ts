import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasHistory } from './useCanvasHistory';

// a minimal stand-in for HTMLCanvasElement: getImageData returns a distinct
// tagged snapshot each call so we can assert exactly which one gets restored
function createMockCanvas() {
    let snapshotCounter = 0;
    const putImageData = vi.fn();
    const getImageData = vi.fn(() => ({ tag: snapshotCounter++ }));
    const ctx = { getImageData, putImageData };
    const canvas = { getContext: vi.fn(() => ctx) };
    return { canvas: canvas as unknown as HTMLCanvasElement, ctx };
}

describe('useCanvasHistory', () => {
    it('starts with nothing to undo or redo', () => {
        const { canvas } = createMockCanvas();
        const ref = { current: canvas };
        const { result } = renderHook(() => useCanvasHistory(ref));

        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });

    it('save() takes a snapshot and enables undo but not redo', () => {
        const { canvas } = createMockCanvas();
        const ref = { current: canvas };
        const { result } = renderHook(() => useCanvasHistory(ref));

        act(() => result.current.save());
        // only one snapshot exists (index 0) - nothing earlier to undo to
        expect(result.current.canUndo).toBe(false);

        act(() => result.current.save());
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });

    it('undo restores the previous snapshot and enables redo', () => {
        const { canvas, ctx } = createMockCanvas();
        const ref = { current: canvas };
        const { result } = renderHook(() => useCanvasHistory(ref));

        act(() => result.current.save()); // tag 0
        act(() => result.current.save()); // tag 1
        act(() => result.current.undo());

        expect(ctx.putImageData).toHaveBeenCalledWith({ tag: 0 }, 0, 0);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(true);
    });

    it('redo re-applies the snapshot that was undone', () => {
        const { canvas, ctx } = createMockCanvas();
        const ref = { current: canvas };
        const { result } = renderHook(() => useCanvasHistory(ref));

        act(() => result.current.save()); // tag 0
        act(() => result.current.save()); // tag 1
        act(() => result.current.undo());
        act(() => result.current.redo());

        expect(ctx.putImageData).toHaveBeenLastCalledWith({ tag: 1 }, 0, 0);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });

    it('undo is a no-op with nothing to undo', () => {
        const { canvas, ctx } = createMockCanvas();
        const ref = { current: canvas };
        const { result } = renderHook(() => useCanvasHistory(ref));

        act(() => result.current.undo());
        expect(ctx.putImageData).not.toHaveBeenCalled();
    });

    it('saving after an undo discards the redo branch (standard undo/redo semantics)', () => {
        const { canvas, ctx } = createMockCanvas();
        const ref = { current: canvas };
        const { result } = renderHook(() => useCanvasHistory(ref));

        act(() => result.current.save()); // tag 0
        act(() => result.current.save()); // tag 1
        act(() => result.current.undo()); // back to tag 0, redo available
        act(() => result.current.save()); // tag 2, new branch

        expect(result.current.canRedo).toBe(false);
        act(() => result.current.undo());
        expect(ctx.putImageData).toHaveBeenLastCalledWith({ tag: 0 }, 0, 0);
    });

    it('reset() clears history so undo/redo are unavailable again', () => {
        const { canvas } = createMockCanvas();
        const ref = { current: canvas };
        const { result } = renderHook(() => useCanvasHistory(ref));

        act(() => result.current.save());
        act(() => result.current.save());
        act(() => result.current.reset());

        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });
});
