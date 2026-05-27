declare const plugin: {
    meta: {
        name: string;
        version: string;
    };
    rules: {
        'todo-requires-issue': import("eslint").Rule.RuleModule;
        'temp-comment-requires-condition': import("eslint").Rule.RuleModule;
        'no-commented-out-code': import("eslint").Rule.RuleModule;
        'env-var-declared': import("eslint").Rule.RuleModule;
    };
    configs: Record<string, unknown>;
};
export default plugin;
