import type { CodeAnchorRule } from '../types.js';

const CREDENTIAL_RE =
    /^(password|passwd|secret|api[_-]?key|apikey|token|auth[_-]?token|private[_-]?key|access[_-]?key|client[_-]?secret|db[_-]?pass(word)?|database[_-]?pass(word)?|nonce|salt|csrf|session[_-]?id|session[_-]?token)$/i;

function isCredentialName(name: string): boolean {
    return CREDENTIAL_RE.test(name);
}

function containsMathRandom(node: unknown): boolean {
    if (!node || typeof node !== 'object') return false;
    const n = node as Record<string, unknown>;
    if (n.type === 'CallExpression') {
        const callee = n.callee as Record<string, unknown> | undefined;
        if (
            callee?.type === 'MemberExpression' &&
            !(callee.computed as boolean) &&
            (callee.object as Record<string, unknown>)?.type === 'Identifier' &&
            (callee.object as Record<string, unknown>).name === 'Math' &&
            (callee.property as Record<string, unknown>)?.type === 'Identifier' &&
            (callee.property as Record<string, unknown>).name === 'random'
        )
            return true;
    }
    for (const val of Object.values(n)) {
        if (!val || typeof val !== 'object') continue;
        if ((val as Record<string, unknown>).type && containsMathRandom(val)) return true;
        if (
            Array.isArray(val) &&
            val.some(
                (v: unknown) =>
                    v && typeof v === 'object' && (v as Record<string, unknown>).type && containsMathRandom(v),
            )
        )
            return true;
    }
    return false;
}

export const noInsecureRandomForSecret: CodeAnchorRule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow Math.random() for generating security-sensitive values like tokens or secrets',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            insecureRandom:
                '"{{name}}" is security-sensitive — use crypto.randomUUID() or crypto.randomBytes() instead of Math.random().',
        },
    },

    create(context) {
        return {
            VariableDeclarator(node) {
                if (node.id.type !== 'Identifier') return;
                const name = (node.id as { name: string }).name;
                if (!isCredentialName(name)) return;
                if (containsMathRandom(node.init)) {
                    context.report({ node, messageId: 'insecureRandom', data: { name } });
                }
            },
            Property(node) {
                if (node.computed) return;
                const key = node.key;
                const keyName =
                    key.type === 'Identifier'
                        ? (key as { name: string }).name
                        : key.type === 'Literal'
                          ? String((key as { value: unknown }).value)
                          : null;
                if (!keyName || !isCredentialName(keyName)) return;
                if (containsMathRandom(node.value)) {
                    context.report({ node, messageId: 'insecureRandom', data: { name: keyName } });
                }
            },
        };
    },
};
