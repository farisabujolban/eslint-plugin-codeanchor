import type { CodeAnchorRule } from '../types.js';
import type { NewExpression, Node } from 'estree';

function isNewUrl(node: NewExpression): boolean {
    return node.callee.type === 'Identifier' && (node.callee as { name: string }).name === 'URL';
}

function isInsideTry(ancestors: Node[]): boolean {
    for (let i = ancestors.length - 1; i >= 0; i--) {
        if (ancestors[i].type === 'TryStatement') return true;
    }
    return false;
}

export const noUnguardedUrlConstructor: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Require new URL() to be wrapped in a try/catch block.',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            missingTryCatch: 'new URL() throws TypeError on an invalid string — wrap it in try/catch.',
        },
    },

    create(context) {
        return {
            NewExpression(node: NewExpression) {
                if (!isNewUrl(node)) return;
                // Safe: single string literal argument is a known-valid URL pattern
                if (
                    node.arguments.length > 0 &&
                    node.arguments[0].type === 'Literal' &&
                    typeof (node.arguments[0] as { value: unknown }).value === 'string'
                )
                    return;

                const ancestors: Node[] =
                    (context as { getAncestors?(): Node[] }).getAncestors?.() ??
                    context.sourceCode?.getAncestors?.(node) ??
                    [];

                if (isInsideTry(ancestors)) return;
                context.report({ node, messageId: 'missingTryCatch' });
            },
        };
    },
};
