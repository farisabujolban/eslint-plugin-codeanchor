import type { Rule } from 'eslint';
import type { CodeAnchorRule } from '../types.js';
import type { MemberExpression, Identifier, Literal, MetaProperty } from 'estree';
import { loadEnvKeys } from '../util/env-file.js';

interface Options {
    envFiles?: string[];
    allowDynamic?: boolean;
}

export const envVarDeclared: CodeAnchorRule = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Require process.env.X and import.meta.env.X accesses to be declared in .env.example or .env.sample',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [
            {
                type: 'object',
                properties: {
                    envFiles: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Env file names to check (default: [".env.example", ".env.sample"])',
                    },
                    allowDynamic: {
                        type: 'boolean',
                        description: 'When true, dynamic access like process.env[key] is not flagged',
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            undeclaredEnvVar:
                "'{{name}}' is not declared in {{envFiles}}. Add it to document the required environment variable.",
            dynamicEnvAccess:
                'Dynamic env access is not statically verifiable. Use a named key or set allowDynamic: true.',
        },
    },

    create(context) {
        const options: Options = context.options[0] ?? {};
        const envFiles = options.envFiles ?? ['.env.example', '.env.sample'];
        const allowDynamic = options.allowDynamic ?? false;

        const filename = context.filename;

        function report(node: MemberExpression & Rule.NodeParentExtension, name: string | null) {
            if (name === null) {
                if (!allowDynamic) {
                    context.report({ node, messageId: 'dynamicEnvAccess' });
                }
                return;
            }
            const keys = loadEnvKeys(filename, envFiles);
            if (!keys.has(name)) {
                context.report({
                    node,
                    messageId: 'undeclaredEnvVar',
                    data: { name, envFiles: envFiles.join(', ') },
                });
            }
        }

        function getStaticKey(node: MemberExpression): string | null | undefined {
            // Returns the string key if static, null if dynamic, undefined if not an env access
            if (node.computed) {
                // process.env[key] — dynamic
                return null;
            }
            const prop = node.property;
            if (prop.type === 'Identifier') return (prop as Identifier).name;
            if (prop.type === 'Literal' && typeof (prop as Literal).value === 'string') {
                return (prop as Literal).value as string;
            }
            return null;
        }

        return {
            MemberExpression(node) {
                const expr = node as MemberExpression & Rule.NodeParentExtension;

                // process.env.FOO
                if (
                    node.object.type === 'MemberExpression' &&
                    node.object.object.type === 'Identifier' &&
                    (node.object.object as Identifier).name === 'process' &&
                    node.object.property.type === 'Identifier' &&
                    (node.object.property as Identifier).name === 'env'
                ) {
                    const key = getStaticKey(node);
                    if (key === undefined) return;
                    report(expr, key);
                    return;
                }

                // import.meta.env.FOO
                // AST: MemberExpression{ object: MemberExpression{ object: MetaProperty{ meta: 'import', property: 'meta' }, property: 'env' }, property: 'FOO' }
                if (
                    node.object.type === 'MemberExpression' &&
                    node.object.object.type === 'MetaProperty' &&
                    (node.object.object as MetaProperty).meta.name === 'import' &&
                    (node.object.object as MetaProperty).property.name === 'meta' &&
                    node.object.property.type === 'Identifier' &&
                    (node.object.property as Identifier).name === 'env'
                ) {
                    const key = getStaticKey(node);
                    if (key === undefined) return;
                    report(expr, key);
                }
            },
        };
    },
};
