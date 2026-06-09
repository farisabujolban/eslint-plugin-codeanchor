/**
 * Strips leading/trailing whitespace and comment markers from a raw comment value.
 * ESLint gives us the inner text of comments (without // or /* *\/).
 */
export function normalizeCommentText(raw: string): string {
    return raw.trim();
}

/**
 * Extracts the first matching keyword from a comment line (case-insensitive).
 */
export function extractKeyword(text: string, keywords: string[]): string | null {
    const upper = text.toUpperCase();
    for (const kw of keywords) {
        // Match keyword at start, optionally followed by : or space
        const idx = upper.indexOf(kw);
        if (idx !== -1) {
            const after = upper[idx + kw.length];
            if (
                after === undefined ||
                after === ':' ||
                after === ' ' ||
                after === '\t' ||
                after === '(' ||
                after === '\n'
            ) {
                return kw;
            }
        }
    }
    return null;
}

const ISSUE_REF_RE = /#\d+|GH-\d+|[A-Z]+-\d+|https?:\/\//;

export function hasIssueReference(text: string): boolean {
    return ISSUE_REF_RE.test(text);
}
