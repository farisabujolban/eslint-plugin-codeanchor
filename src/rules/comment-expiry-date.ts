import type { CodeAnchorRule } from '../types.js';
import { normalizeCommentText, extractKeyword } from '../util/comment-text.js';

interface Options {
    keywords?: string[];
}

const DEFAULT_KEYWORDS = ['TODO', 'FIXME', 'HACK', 'TEMP', 'TEMPORARY', 'WORKAROUND', 'WIP', 'REMOVE'];

// ISO date: YYYY-MM-DD
const DATE_RE = /\b(\d{4}-\d{2}-\d{2})\b/g;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function findExpiredDate(text: string): string | null {
    DATE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    const now = Date.now();
    while ((m = DATE_RE.exec(text)) !== null) {
        const ts = Date.parse(m[1]);
        if (!isNaN(ts) && ts < now) return m[1];
    }
    return null;
}

function findFarFutureDate(text: string): string | null {
    DATE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    const now = Date.now();
    while ((m = DATE_RE.exec(text)) !== null) {
        const ts = Date.parse(m[1]);
        if (!isNaN(ts) && ts > now + ONE_YEAR_MS) return m[1];
    }
    return null;
}

export const commentExpiryDate: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Flag TODO/TEMP/WORKAROUND comments that contain a past expiry date',
            recommended: true,
            languages: ['*'],
        },
        schema: [
            {
                type: 'object',
                properties: {
                    keywords: {
                        type: 'array',
                        items: { type: 'string' },
                        description:
                            'Comment keywords to check for expired dates (default: TODO, FIXME, HACK, TEMP, TEMPORARY, WORKAROUND, WIP, REMOVE)',
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            expiredDate: '{{keyword}} comment has an expired date ({{date}}). Resolve or extend the deadline.',
            farFutureDate:
                '{{keyword}} comment has a date more than 1 year away ({{date}}) — likely an AI-generated placeholder. Set a realistic deadline.',
        },
    },

    create(context) {
        const options: Options = context.options[0] ?? {};
        const keywords = options.keywords ?? DEFAULT_KEYWORDS;

        return {
            Program() {
                const comments = context.sourceCode.getAllComments();
                for (const comment of comments) {
                    const text = normalizeCommentText(comment.value);
                    const keyword = extractKeyword(text, keywords);
                    if (!keyword) continue;
                    const farFutureDate = findFarFutureDate(text);
                    if (farFutureDate) {
                        context.report({
                            loc: comment.loc!,
                            messageId: 'farFutureDate',
                            data: { keyword, date: farFutureDate },
                        });
                        continue;
                    }
                    const expiredDate = findExpiredDate(text);
                    if (!expiredDate) continue;
                    context.report({
                        loc: comment.loc!,
                        messageId: 'expiredDate',
                        data: { keyword, date: expiredDate },
                    });
                }
            },
        };
    },
};
