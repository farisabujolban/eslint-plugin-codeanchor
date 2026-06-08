import type { Rule } from 'eslint'

export type LanguageTier = '*' | 'javascript' | 'typescript'

export interface CodeAnchorRuleDocs {
  description: string
  recommended: boolean
  languages: LanguageTier[]
}

type BaseMeta = Omit<NonNullable<Rule.RuleModule['meta']>, 'docs'>

export interface CodeAnchorRule extends Omit<Rule.RuleModule, 'meta'> {
  meta: BaseMeta & { docs: CodeAnchorRuleDocs }
}