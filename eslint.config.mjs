import tseslint from 'typescript-eslint';
import codeanchorPlugin from '@farisabujolban/eslint-plugin-codeanchor';

export default tseslint.config(tseslint.configs.recommended, codeanchorPlugin.configs['recommended'], {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
});
