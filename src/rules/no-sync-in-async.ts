import type { CodeAnchorRule } from '../types.js';

const SYNC_RE = /Sync$/;

export const noSyncInAsync: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Flag synchronous *Sync method calls inside async functions',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            syncInAsync: '"{{method}}" is a blocking call inside an async function. Use the async equivalent instead.',
        },
    },

    create(context) {
        const asyncStack: boolean[] = [];

        function enter(node: { async?: boolean }): void {
            asyncStack.push(node.async === true);
        }
        function exit(): void {
            asyncStack.pop();
        }
        function inAsync(): boolean {
            return asyncStack.length > 0 && asyncStack[asyncStack.length - 1];
        }

        return {
            FunctionDeclaration: enter,
            'FunctionDeclaration:exit': exit,
            FunctionExpression: enter,
            'FunctionExpression:exit': exit,
            ArrowFunctionExpression: enter,
            'ArrowFunctionExpression:exit': exit,

            CallExpression(node) {
                if (!inAsync()) return;
                const { callee } = node;
                if (
                    callee.type === 'MemberExpression' &&
                    !callee.computed &&
                    callee.property.type === 'Identifier' &&
                    SYNC_RE.test(callee.property.name)
                ) {
                    context.report({
                        node,
                        messageId: 'syncInAsync',
                        data: { method: callee.property.name },
                    });
                }
            },
        };
    },
};
