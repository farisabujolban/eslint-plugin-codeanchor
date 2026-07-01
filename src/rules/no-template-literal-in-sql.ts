import type { CodeAnchorRule } from '../types.js';
import type { CallExpression, MemberExpression, Identifier, TemplateLiteral } from 'estree';

const SQL_METHODS = new Set(['query', 'execute', 'raw', 'sql', 'exec', 'run', 'prepare', 'all', 'get']);

export const noTemplateLiteralInSql: CodeAnchorRule = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow template literals with expressions in SQL method calls. Interpolating values directly into SQL strings is a SQL injection vulnerability — use parameterized queries instead.',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            templateInSql:
                'SQL query built with a template literal containing expressions. Use parameterized queries (e.g. db.query("SELECT ... WHERE id = $1", [id])) to prevent SQL injection.',
        },
    },

    create(context) {
        return {
            CallExpression(node: CallExpression) {
                if (node.callee.type !== 'MemberExpression') return;
                const callee = node.callee as MemberExpression;
                if (callee.computed) return;
                const prop = callee.property as Identifier;
                if (!SQL_METHODS.has(prop.name)) return;

                const firstArg = node.arguments[0];
                if (!firstArg || firstArg.type !== 'TemplateLiteral') return;
                const tpl = firstArg as TemplateLiteral;
                if (tpl.expressions.length === 0) return; // static template, no injection risk

                context.report({ node: firstArg, messageId: 'templateInSql' });
            },
        };
    },
};
