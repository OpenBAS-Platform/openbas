const rule = require("../../../lib/rules/no-mutable-exports"),
  RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

const tsLanguageOptions = { parser: require("@typescript-eslint/parser") };

ruleTester.run("no-mutable-exports", rule, {
  valid: [
    "export const a = 1;",
    "export function f() {}",
    "export class C {}",
    "const a = 1; export { a };",
    "const a = 1; export { a as b };",
    "const a = 1; export default a;",
    "function f() {} export { f };",
    "class C {} export default C;",
    "export default 1;",
    "export default function () {}",
    "export { a } from './a';",
    "export * from './a';",
    "let a = 1; a += 1; console.log(a);",
    "function f() { let a = 1; return a; } export { f };",
    {
      code: "type T = string; export type { T };",
      languageOptions: tsLanguageOptions,
    },
    {
      code: "interface I { a: string } export { type I };",
      languageOptions: tsLanguageOptions,
    },
  ],

  invalid: [
    {
      code: "export let a = 1;",
      errors: [{ messageId: "mutable", data: { kind: "let" } }],
    },
    {
      code: "export var a = 1;",
      errors: [{ messageId: "mutable", data: { kind: "var" } }],
    },
    {
      code: "let a = 1; export { a };",
      errors: [{ messageId: "mutable", data: { kind: "let" } }],
    },
    {
      code: "var a = 1; export { a as b };",
      errors: [{ messageId: "mutable", data: { kind: "var" } }],
    },
    {
      code: "let a = 1; export default a;",
      errors: [{ messageId: "mutable", data: { kind: "let" } }],
    },
    {
      code: "let a = 1, b = 2; export { a, b };",
      errors: 1,
    },
    {
      code: "let a = 1; const b = 2; export { a, b };",
      errors: 1,
    },
    {
      code: "export let a: string = '';",
      languageOptions: tsLanguageOptions,
      errors: [{ messageId: "mutable", data: { kind: "let" } }],
    },
  ],
});
console.log("All tests passed!");
