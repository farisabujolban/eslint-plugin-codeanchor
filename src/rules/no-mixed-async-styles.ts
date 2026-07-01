import type { CodeAnchorRule } from '../types.js';
import type {
    FunctionDeclaration,
    FunctionExpression,
    ArrowFunctionExpression,
    CallExpression,
    MemberExpression,
    Identifier,
} from 'estree';

type Node = FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;

interface ScopeFrame {
    node: Node;
    isAsync: boolean;
    hasAwait: boolean;
    hasThen: boolean;
}

export const noMixedAsyncStyles: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'Disallow mixing .then()/.catch() promise chaining with await in the same async function body. Mixed styles make error propagation hard to reason about.',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            mixedAsyncStyles:
                'Async function mixes await with .then()/.catch() chaining. Use one style consistently: either async/await throughout or .then()/.catch() throughout.',
        },
    },

    create(context) {
        const scopeStack: ScopeFrame[] = [];

        function enterScope(node: Node, isAsync: boolean) {
            scopeStack.push({ node, isAsync, hasAwait: false, hasThen: false });
        }

        function exitScope() {
            const frame = scopeStack.pop();
            if (!frame) return;
            if (frame.isAsync && frame.hasAwait && frame.hasThen) {
                context.report({ node: frame.node, messageId: 'mixedAsyncStyles' });
            }
        }

        return {
            FunctionDeclaration(node: FunctionDeclaration) {
                enterScope(node, node.async === true);
            },
            'FunctionDeclaration:exit': exitScope,
            FunctionExpression(node: FunctionExpression) {
                enterScope(node, node.async === true);
            },
            'FunctionExpression:exit': exitScope,
            ArrowFunctionExpression(node: ArrowFunctionExpression) {
                enterScope(node, node.async === true);
            },
            'ArrowFunctionExpression:exit': exitScope,
            AwaitExpression() {
                if (scopeStack.length > 0) {
                    scopeStack[scopeStack.length - 1].hasAwait = true;
                }
            },
            CallExpression(node: CallExpression) {
                if (scopeStack.length === 0) return;
                if (node.callee.type !== 'MemberExpression') return;
                const callee = node.callee as MemberExpression;
                if (callee.computed) return;
                const prop = callee.property as Identifier;
                if (prop.name === 'then' || prop.name === 'catch') {
                    scopeStack[scopeStack.length - 1].hasThen = true;
                }
            },
        };
    },
};
