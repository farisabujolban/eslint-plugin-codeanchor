import type { CodeAnchorRule } from '../types.js';
import type { CallExpression, MemberExpression, Identifier } from 'estree';

const ENTRY_RE = /[\\/](cli|bin)\.(ts|js|mts|mjs|cjs)$|[\\/]bin[\\/]/;

function isEntryPoint(filename: string): boolean {
    return ENTRY_RE.test(filename);
}

function isProcessExit(node: CallExpression): boolean {
    if (node.callee.type !== 'MemberExpression') return false;
    const callee = node.callee as MemberExpression;
    if (callee.computed) return false;
    const obj = callee.object as Identifier;
    const prop = callee.property as Identifier;
    return obj.type === 'Identifier' && obj.name === 'process' && prop.type === 'Identifier' && prop.name === 'exit';
}

export const noProcessExit: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'Disallow process.exit() outside of CLI entry-point files. Calling process.exit() in library or middleware code kills the entire Node.js host process.',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            noProcessExit:
                'process.exit() in a non-entry-point file will terminate the entire Node.js process. Use Error throwing or a graceful shutdown mechanism instead.',
        },
    },

    create(context) {
        return {
            CallExpression(node: CallExpression) {
                if (!isProcessExit(node)) return;
                const filename = context.filename ?? '';
                if (isEntryPoint(filename)) return;
                context.report({ node, messageId: 'noProcessExit' });
            },
        };
    },
};
