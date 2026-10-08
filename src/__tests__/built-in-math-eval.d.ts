// `built-in-math-eval` (function-plot's own expression parser) ships no type
// declarations and has no @types package (confirmed: no .d.ts anywhere under
// node_modules/built-in-math-eval). Minimal ambient declaration so
// mathplot-equation.test.ts can import it with real type-checking instead of
// `any`. Scoped to test-only usage — route.ts/MathPlot.tsx never import this
// package directly (MathPlot.tsx goes through function-plot, which already
// ships its own types).
declare module "built-in-math-eval" {
  function evalExpression(
    expr: string,
    scope: Record<string, number>
  ): { eval: (scope: Record<string, number>) => number };
  export default evalExpression;
}
