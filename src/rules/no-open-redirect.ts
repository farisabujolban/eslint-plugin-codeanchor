import type { CodeAnchorRule } from '../types.js';
import type { CallExpression, MemberExpression, Identifier, Node, TemplateLiteral } from 'estree';

const REQ_SOURCES = new Set(['query', 'body', 'params']);
const REQ_OBJECTS = new Set(['req', 'request', 'reply']);

function isReqInput(node: Node): boolean {
    // req.query.x  /  req.body.x  /  req.params.x
    if (node.type === 'MemberExpression') {
        const mem = node as MemberExpression;
        if (mem.object.type === 'MemberExpression') {
            const inner = mem.object as MemberExpression;
            const root = inner.object as Identifier;
            const source = inner.property as Identifier;
            if (
                root.type === 'Identifier' &&
                REQ_OBJECTS.has(root.name) &&
                source.type === 'Identifier' &&
                REQ_SOURCES.has(source.name)
            ) {
                return true;
            }
        }
    }
    // Template literal: `/app${req.query.path}`
    if (node.type === 'TemplateLiteral') {
        return (node as TemplateLiteral).expressions.some((e) => isReqInput(e as Node));
    }
    return false;
}

export const noOpenRedirect: CodeAnchorRule = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow passing unsanitized request input (req.query, req.body, req.params) directly to a redirect call. Allows attackers to redirect users to malicious sites (CWE-601).',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            openRedirect:
                'Open redirect: redirect destination comes from user-controlled input (req.query/body/params). Validate the URL against an allowlist before redirecting.',
        },
    },

    create(context) {
        return {
            CallExpression(node: CallExpression) {
                if (node.callee.type !== 'MemberExpression') return;
                const callee = node.callee as MemberExpression;
                if (callee.computed) return;
                const prop = callee.property as Identifier;
                if (prop.name !== 'redirect') return;

                for (const arg of node.arguments) {
                    if (isReqInput(arg as Node)) {
                        context.report({ node, messageId: 'openRedirect' });
                        return;
                    }
                }
            },
        };
    },
};
