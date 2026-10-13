import { describe, it, expect } from 'vitest';
import { sanitizeLatex } from './sanitizeLatex';

describe('sanitizeLatex', () => {
    it('trims surrounding whitespace', () => {
        expect(sanitizeLatex('  x^2 + 1  ')).toBe('x^2 + 1');
    });

    it('strips ```latex code fences', () => {
        expect(sanitizeLatex('```latex\nx^2 + 1\n```')).toBe('x^2 + 1');
    });

    it('strips bare ``` code fences', () => {
        expect(sanitizeLatex('```\nx^2 + 1\n```')).toBe('x^2 + 1');
    });

    it('strips $$...$$ display math wrappers', () => {
        expect(sanitizeLatex('$$x^2 + 1$$')).toBe('x^2 + 1');
    });

    it('strips single $...$ inline math wrappers', () => {
        expect(sanitizeLatex('$x^2 + 1$')).toBe('x^2 + 1');
    });

    it('strips \\(...\\) wrappers', () => {
        expect(sanitizeLatex('\\(x^2 + 1\\)')).toBe('x^2 + 1');
    });

    it('strips \\[...\\] wrappers', () => {
        expect(sanitizeLatex('\\[x^2 + 1\\]')).toBe('x^2 + 1');
    });

    it('leaves plain LaTeX untouched', () => {
        expect(sanitizeLatex('\\frac{a}{b}')).toBe('\\frac{a}{b}');
    });

    it('detects long repeated garbage output and returns a friendly message', () => {
        const garbage = 'abc'.repeat(20); // 60 chars, well past the 50-char/4x-repeat threshold
        expect(sanitizeLatex(garbage)).toBe('Recognition unclear. Please try drawing with thinner strokes.');
    });

    it('does not flag short legitimately-repetitive LaTeX as garbage', () => {
        // e.g. a matrix or repeated term - short enough to stay under the 50-char floor
        expect(sanitizeLatex('x + x + x + x')).toBe('x + x + x + x');
    });

    it('detects runaway backslash sequences and returns a friendly message', () => {
        expect(sanitizeLatex('\\\\\\\\\\\\')).toBe('Recognition failed. Please redraw.');
    });

    it('strips a single trailing stray backslash', () => {
        expect(sanitizeLatex('x^2 + 1\\')).toBe('x^2 + 1');
    });

    it('returns an empty string for empty input', () => {
        expect(sanitizeLatex('')).toBe('');
    });

    it('returns an empty string for whitespace-only input', () => {
        expect(sanitizeLatex('   \n  ')).toBe('');
    });
});
