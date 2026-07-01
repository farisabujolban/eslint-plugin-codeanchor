import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noArraySortWithoutComparator } from '../src/rules/no-array-sort-without-comparator.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
    languageOptions: { parser: await import('@typescript-eslint/parser') },
});

tester.run('no-array-sort-without-comparator', noArraySortWithoutComparator, {
    valid: [
        { code: `[1, 2, 3].sort((a, b) => a - b)` },
        { code: `arr.sort((a, b) => a.localeCompare(b))` },
        { code: `[].sort(compareFn)` },
        { code: `arr.sort(Intl.Collator().compare)` },
        { code: `arr.reverse()` },
        { code: `arr.filter(x => x > 0)` },
    ],
    invalid: [
        {
            code: `[1, 2, 3].sort()`,
            errors: [{ messageId: 'missingSortComparator' }],
        },
        {
            code: `arr.sort()`,
            errors: [{ messageId: 'missingSortComparator' }],
        },
        {
            code: `numbers.sort()`,
            errors: [{ messageId: 'missingSortComparator' }],
        },
        {
            code: `const sorted = items.sort()`,
            errors: [{ messageId: 'missingSortComparator' }],
        },
        {
            code: `return arr.sort()`,
            errors: [{ messageId: 'missingSortComparator' }],
        },
    ],
});
