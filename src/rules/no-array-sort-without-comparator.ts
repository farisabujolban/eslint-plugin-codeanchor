import type { CodeAnchorRule } from '../types.js';
import type { CallExpression } from 'estree';

export const noArraySortWithoutComparator: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'Disallow Array.prototype.sort() without a comparator function. Without one, elements are sorted lexicographically — numeric arrays produce wrong order.',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            missingSortComparator:
                'Array.prototype.sort() called without a comparator. Numerics will sort lexicographically (e.g. [10, 9, 2] → [10, 2, 9]). Pass a comparator: .sort((a, b) => a - b).',
        },
    },

    create(context) {
        return {
            CallExpression(node: CallExpression) {
                if (node.callee.type !== 'MemberExpression') return;
                const prop = node.callee.property;
                if (prop.type !== 'Identifier' || prop.name !== 'sort') return;
                if (node.arguments.length !== 0) return;
                context.report({ node, messageId: 'missingSortComparator' });
            },
        };
    },
};
