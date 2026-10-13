// clean up raw model/API output into LaTeX that's safe to show and render
export function sanitizeLatex(text: string): string {
    let clean = text.trim();

    // remove markdown code blocks
    clean = clean.replace(/^```latex\n?/, '').replace(/```$/, '');
    clean = clean.replace(/^```\n?/, '').replace(/```$/, '');

    // strip dollar signs and other wrappers
    if (clean.startsWith('$$') && clean.endsWith('$$')) {
        clean = clean.substring(2, clean.length - 2);
    } else if (clean.startsWith('$') && clean.endsWith('$')) {
        clean = clean.substring(1, clean.length - 1);
    } else if (clean.startsWith('\\(') && clean.endsWith('\\)')) {
        clean = clean.substring(2, clean.length - 2);
    } else if (clean.startsWith('\\[') && clean.endsWith('\\]')) {
        clean = clean.substring(2, clean.length - 2);
    }

    const repeatedPattern = /(.{3,})\1{3,}/;
    if (repeatedPattern.test(clean) && clean.length > 50) {
        return "Recognition unclear. Please try drawing with thinner strokes.";
    }

    if (/\\{4,}/.test(clean)) {
        return "Recognition failed. Please redraw.";
    }

    // remove common trailing artifacts
    clean = clean.replace(/\s*\\?$/g, '').trim();

    return clean.trim();
}
