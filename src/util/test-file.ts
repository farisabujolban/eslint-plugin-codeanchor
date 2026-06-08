// Language-agnostic test-file detection.
// The extension segment [^./\\]+ accepts any extension (not just .js/.ts),
// so .test.py, .test.go, .spec.rb etc. are treated as test files too.
export function isTestFile(filename: string): boolean {
  return /[./](test|spec)\.[^./\\]+$|[/\\]__tests__[/\\]|[/\\](test|tests|spec|specs)[/\\]/i.test(filename)
}