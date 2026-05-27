/**
 * Strips leading/trailing whitespace and comment markers from a raw comment value.
 * ESLint gives us the inner text of comments (without // or /* *\/).
 */
export declare function normalizeCommentText(raw: string): string;
/**
 * Extracts the first matching keyword from a comment line (case-insensitive).
 */
export declare function extractKeyword(text: string, keywords: string[]): string | null;
export declare function hasIssueReference(text: string): boolean;
