import { describe, it, expect } from 'vitest';
import { normalizeCommentText, extractKeyword, hasIssueReference } from '../src/util/comment-text.js';

describe('normalizeCommentText', () => {
    it('trims leading and trailing whitespace', () => {
        expect(normalizeCommentText('  hello  ')).toBe('hello');
    });

    it('returns empty string for whitespace-only input', () => {
        expect(normalizeCommentText('   ')).toBe('');
    });
});

describe('extractKeyword', () => {
    it('finds TODO keyword', () => {
        expect(extractKeyword('TODO: fix this', ['TODO', 'FIXME'])).toBe('TODO');
    });

    it('finds FIXME keyword', () => {
        expect(extractKeyword('FIXME: urgent', ['TODO', 'FIXME'])).toBe('FIXME');
    });

    it('returns null when no keyword found', () => {
        expect(extractKeyword('just a comment', ['TODO', 'FIXME'])).toBeNull();
    });

    it('is case-insensitive', () => {
        expect(extractKeyword('todo: fix this', ['TODO'])).toBe('TODO');
    });
});

describe('hasIssueReference', () => {
    it('detects #123 style references', () => {
        expect(hasIssueReference('TODO: fix #123')).toBe(true);
    });

    it('detects GH-123 style references', () => {
        expect(hasIssueReference('tracked in GH-456')).toBe(true);
    });

    it('detects JIRA-style references', () => {
        expect(hasIssueReference('see PROJ-789')).toBe(true);
    });

    it('detects https:// links', () => {
        expect(hasIssueReference('see https://github.com/issues/1')).toBe(true);
    });

    it('returns false for comments with no reference', () => {
        expect(hasIssueReference('TODO: fix this someday')).toBe(false);
    });
});
