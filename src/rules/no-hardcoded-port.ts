import type { Rule } from 'eslint';
import type { CodeAnchorRule } from '../types.js';

export const noHardcodedPort: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Flag hardcoded port numbers in server listen calls',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allow: { type: 'array', items: { type: 'number' } },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            hardcodedPort: 'Port {{port}} is hardcoded. Use process.env.PORT or a named constant instead.',
        },
    },

    create(context) {
        const options = (context.options[0] ?? {}) as { allow?: number[] };
        const allowList: number[] = options.allow ?? [];

        function reportIfPort(node: Rule.Node, value: unknown): void {
            if (typeof value !== 'number') return;
            if (!allowList.includes(value)) {
                context.report({ node, messageId: 'hardcodedPort', data: { port: String(value) } });
            }
        }

        return {
            CallExpression(node) {
                const { callee, arguments: args } = node;
                if (
                    callee.type !== 'MemberExpression' ||
                    callee.computed ||
                    callee.property.type !== 'Identifier' ||
                    callee.property.name !== 'listen'
                )
                    return;

                const first = args[0];
                if (!first) return;

                // app.listen(3000)
                if (first.type === 'Literal') {
                    reportIfPort(first as Rule.Node, (first as { value: unknown }).value);
                    return;
                }

                // app.listen({ port: 3000 })
                if (first.type === 'ObjectExpression') {
                    for (const prop of (first as { properties: unknown[] }).properties) {
                        const p = prop as {
                            type: string;
                            computed?: boolean;
                            key: { type: string; name?: string; value?: unknown };
                            value: { type: string; value?: unknown };
                        };
                        if (p.type !== 'Property' || p.computed) continue;
                        const keyName =
                            p.key.type === 'Identifier'
                                ? p.key.name
                                : p.key.type === 'Literal'
                                  ? String(p.key.value)
                                  : null;
                        if (keyName !== 'port') continue;
                        if (p.value.type === 'Literal') reportIfPort(prop as Rule.Node, p.value.value);
                    }
                }
            },
        };
    },
};
