import type { CodeAnchorRule } from '../types.js';
import { normalizeCommentText, extractKeyword, hasIssueReference } from '../util/comment-text.js';

interface Options {
    tags?: string[];
    pattern?: string;
}

const DEFAULT_TAGS = ['TODO', 'FIXME', 'HACK'];

export const todoRequiresIssue: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Require TODO/FIXME/HACK comments to include an issue reference',
            recommended: true,
            languages: ['*'],
        },
        schema: [
            {
                type: 'object',
                properties: {
                    tags: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Comment tags to enforce (default: TODO, FIXME, HACK)',
                    },
                    pattern: {
                        type: 'string',
                        description: 'Custom regex pattern that counts as an issue reference',
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            missingIssue: '{{tag}} comment must include an issue reference (#123, GH-123, PROJ-123, or a URL).',
        },
    },

    create(context) {
        const options: Options = context.options[0] ?? {};
        const tags = options.tags ?? DEFAULT_TAGS;
        const customPattern = options.pattern ? new RegExp(options.pattern) : null;

        function commentHasRef(text: string): boolean {
            if (customPattern && customPattern.test(text)) return true;
            return hasIssueReference(text);
        }

        return {
            Program() {
                const comments = context.sourceCode.getAllComments();
                for (const comment of comments) {
                    const text = normalizeCommentText(comment.value);
                    const tag = extractKeyword(text, tags);
                    if (!tag) continue;
                    if (commentHasRef(text)) continue;
                    context.report({
                        loc: comment.loc!,
                        messageId: 'missingIssue',
                        data: { tag },
                    });
                }
            },
        };
    },
};
