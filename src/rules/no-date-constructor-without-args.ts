import type { CodeAnchorRule } from '../types.js';
import type { NewExpression } from 'estree';

export const noDateConstructorWithoutArgs: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'Disallow new Date() without arguments — it couples code to the system clock, causing non-determinism.',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            noArgDate:
                'new Date() depends on the current system clock — pass an explicit timestamp or date string, or use Date.now() for a numeric value.',
        },
    },

    create(context) {
        return {
            NewExpression(node: NewExpression) {
                if (node.callee.type !== 'Identifier') return;
                if ((node.callee as { name: string }).name !== 'Date') return;
                if (node.arguments.length === 0) {
                    context.report({ node, messageId: 'noArgDate' });
                }
            },
        };
    },
};
