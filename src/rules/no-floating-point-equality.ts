import type { CodeAnchorRule } from '../types.js';
import type { BinaryExpression, Node } from 'estree';

function isFloatLiteral(node: Node): boolean {
    if (node.type === 'Literal' && typeof (node as { value: unknown }).value === 'number') {
        const v = (node as { value: number }).value;
        return isFinite(v) && !Number.isInteger(v);
    }
    if (
        node.type === 'UnaryExpression' &&
        ((node as { operator: string }).operator === '-' || (node as { operator: string }).operator === '+')
    ) {
        return isFloatLiteral((node as { argument: Node }).argument);
    }
    return false;
}

export const noFloatingPointEquality: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow exact equality comparisons with floating-point literals (CWE-1339, IEEE 754).',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            floatEquality:
                'Exact equality comparison with a floating-point literal. IEEE 754 arithmetic makes this unreliable — use an epsilon/tolerance check instead.',
        },
    },

    create(context) {
        return {
            BinaryExpression(node: BinaryExpression) {
                if (!['==', '===', '!=', '!=='].includes(node.operator)) return;
                if (isFloatLiteral(node.left) || isFloatLiteral(node.right)) {
                    context.report({ node, messageId: 'floatEquality' });
                }
            },
        };
    },
};
