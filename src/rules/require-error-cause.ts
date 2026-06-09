import type { CodeAnchorRule } from '../types.js';
import type { CatchClause, ThrowStatement, NewExpression, ObjectExpression, Identifier, Property } from 'estree';

const ERROR_CTORS = new Set([
    'Error',
    'TypeError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'URIError',
    'EvalError',
]);

function hasCauseProp(opts: ObjectExpression): boolean {
    return opts.properties.some((p) => {
        if (p.type !== 'Property') return false;
        const key = (p as Property).key;
        return (
            (key.type === 'Identifier' && (key as Identifier).name === 'cause') ||
            (key.type === 'Literal' && (key as { value: unknown }).value === 'cause')
        );
    });
}

export const requireErrorCause: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'Require throw new Error() inside catch blocks to pass { cause: err } so the original error is not silently dropped.',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            missingCause:
                'throw new Error() inside catch ({{param}}) should include { cause: {{param}} } to preserve the error chain.',
        },
    },

    create(context) {
        // Stack of caught variable names; null = catch {} without binding
        const catchStack: Array<string | null> = [];

        return {
            CatchClause(node: CatchClause) {
                const param = node.param;
                catchStack.push(param?.type === 'Identifier' ? (param as Identifier).name : null);
            },
            'CatchClause:exit'() {
                catchStack.pop();
            },

            ThrowStatement(node: ThrowStatement) {
                if (catchStack.length === 0) return;
                const catchParam = catchStack[catchStack.length - 1];
                // No binding (catch {}) — intentional sanitization, skip
                if (!catchParam) return;

                const arg = node.argument;
                if (!arg || arg.type !== 'NewExpression') return;
                const ctor = (arg as NewExpression).callee;
                if (ctor.type !== 'Identifier' || !ERROR_CTORS.has((ctor as Identifier).name)) return;

                const newExpr = arg as NewExpression;
                if (newExpr.arguments.length >= 2) {
                    const opts = newExpr.arguments[1];
                    if (opts.type === 'ObjectExpression' && hasCauseProp(opts as ObjectExpression)) return;
                }

                context.report({ node, messageId: 'missingCause', data: { param: catchParam } });
            },
        };
    },
};
