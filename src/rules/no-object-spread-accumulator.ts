import type { CodeAnchorRule } from '../types.js';
import type {
    CallExpression,
    MemberExpression,
    ArrowFunctionExpression,
    FunctionExpression,
    ObjectExpression,
    SpreadElement,
    Identifier,
    ReturnStatement,
    BlockStatement,
} from 'estree';

function getAccumulatorName(cb: ArrowFunctionExpression | FunctionExpression): string | null {
    const first = cb.params[0];
    return first?.type === 'Identifier' ? (first as Identifier).name : null;
}

function findSpreadNode(body: ArrowFunctionExpression['body'], accName: string): ObjectExpression | null {
    // Arrow expression body: (acc, x) => ({ ...acc, ... })
    if (body.type === 'ObjectExpression') {
        const obj = body as ObjectExpression;
        return obj.properties.some(
            (p) =>
                p.type === 'SpreadElement' &&
                (p as SpreadElement).argument.type === 'Identifier' &&
                ((p as SpreadElement).argument as Identifier).name === accName,
        )
            ? obj
            : null;
    }

    // Block body: look for return { ...acc, ... }
    if (body.type === 'BlockStatement') {
        for (const stmt of (body as BlockStatement).body) {
            if (stmt.type !== 'ReturnStatement') continue;
            const ret = stmt as ReturnStatement;
            if (!ret.argument || ret.argument.type !== 'ObjectExpression') continue;
            const obj = ret.argument as ObjectExpression;
            if (
                obj.properties.some(
                    (p) =>
                        p.type === 'SpreadElement' &&
                        (p as SpreadElement).argument.type === 'Identifier' &&
                        ((p as SpreadElement).argument as Identifier).name === accName,
                )
            )
                return obj;
        }
    }

    return null;
}

export const noObjectSpreadAccumulator: CodeAnchorRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'Disallow object spread of the accumulator inside .reduce() — creates an O(n²) object allocation pattern.',
            recommended: true,
            languages: ['javascript', 'typescript'],
        },
        schema: [],
        messages: {
            spreadAccumulator:
                'Spreading the accumulator inside .reduce() is O(n²). Use Object.fromEntries(), Object.assign(acc, {...}), or a mutable accumulator with a for-loop.',
        },
    },

    create(context) {
        return {
            CallExpression(node: CallExpression) {
                if (node.callee.type !== 'MemberExpression') return;
                const prop = (node.callee as MemberExpression).property;
                if (prop.type !== 'Identifier' || (prop as Identifier).name !== 'reduce') return;
                if (node.arguments.length < 1) return;

                const cb = node.arguments[0];
                if (cb.type !== 'ArrowFunctionExpression' && cb.type !== 'FunctionExpression') return;

                const callback = cb as ArrowFunctionExpression | FunctionExpression;
                const accName = getAccumulatorName(callback);
                if (!accName) return;

                const spreadNode = findSpreadNode(callback.body, accName);
                if (spreadNode) context.report({ node: spreadNode, messageId: 'spreadAccumulator' });
            },
        };
    },
};
