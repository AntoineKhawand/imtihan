"use client";

import { useEffect, useRef } from "react";
import functionPlot from "function-plot";

interface MathPlotProps {
  equation: string; // e.g. "x^2", "sin(x)", "y = 2x + 1"
  title?: string;
  width?: number;
  height?: number;
}

export function MathPlot({ equation, title, width = 600, height = 400 }: MathPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // If no equation, just render a grid
    const data = equation.trim() ? [{
      fn: equation.replace(/^(y|f\(x\))\s*=\s*/i, "").trim(),
      sampler: "builtIn" as const,
      graphType: "polyline" as const,
    }] : [];

    try {
      containerRef.current.innerHTML = "";
      functionPlot({
        target: containerRef.current,
        width,
        height,
        title,
        grid: true,
        data,
      });

      // function-plot has no `viewBox`/responsive sizing option (confirmed
      // by reading its source, node_modules/function-plot/dist/chart.js:
      // `drawGraphWrapper()` sets fixed pixel `width`/`height` attributes on
      // the generated <svg class="function-plot"> with no responsive hook
      // at all). Left as-is, a fixed 600x400 canvas gets cropped by this
      // component's own `overflow-hidden` wrapper below 600px — including
      // the 375px breakpoint required by CLAUDE.md §14. Post-process the
      // generated <svg> here instead: give it a `viewBox` matching the
      // coordinate system function-plot already laid out, drop the fixed
      // width/height attributes, and let CSS scale it proportionally.
      const svg = containerRef.current.querySelector<SVGSVGElement>("svg.function-plot");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.style.width = "100%";
        svg.style.height = "auto";
        // Cap growth so this doesn't upscale past its native resolution on
        // a wide card — only ever scale down, never up.
        svg.style.maxWidth = `${width}px`;
      }
    } catch (err) {
      console.error("MathPlot error:", err);
      // `equation` is attacker-controllable (teacher-editable mathPlots entry,
      // or the AI-authored inline [PLOT: equation] tag — both untrusted), and
      // `err`'s message can itself echo back fragments of the offending
      // input (e.g. "unexpected token '<'"). Never interpolate either into
      // innerHTML directly — build the error node with real DOM APIs and
      // set text via textContent so any HTML/script in the string is
      // rendered as inert text, not parsed/executed.
      const container = containerRef.current;
      container.innerHTML = "";
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorEl = document.createElement("div");
      errorEl.className = "p-4 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg";
      errorEl.textContent = `Error plotting "${equation}": ${errorMessage}`;
      container.appendChild(errorEl);
    }
  }, [equation, title, width, height]);

  return (
    <div className="flex flex-col items-center my-6 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      {title && <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">{title}</h3>}

      {!equation.trim() && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/20 text-[var(--accent)] mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Student Workspace</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] italic">Please use the grid below to plot your answer.</p>
        </div>
      )}

      <div ref={containerRef} className="mathplot-canvas max-w-full" />

      {equation.trim() && (
        <p className="mt-2 text-[10px] text-[var(--text-tertiary)] font-mono italic">f(x) = {equation}</p>
      )}

      {/*
        function-plot (see node_modules/function-plot/dist/chart.js /
        node_modules/d3-axis/src/axis.js) draws its axes/grid directly as
        raw SVG with zero CSS-custom-property or dark-mode awareness:
          - d3-axis's own tick/domain generator sets `fill="currentColor"`
            on every tick <text> (so it inherits a real CSS `color`), but
            chart.js's `updateAxes()` then *overrides* the tick lines and
            domain path with a hardcoded `stroke="black"` presentation
            attribute (chart.js ~line 525-529), as well as the two origin
            helper lines (`.x.origin`/`.y.origin`, ~line 384/403).
          - A plain CSS stylesheet rule beats a presentation attribute in
            the cascade regardless of selector specificity, so scoping a
            rule under this instance's own `.mathplot-canvas` wrapper is
            enough to repaint the hardcoded black strokes without touching
            the library at all. Setting `color` on `.function-plot` itself
            covers every `fill="currentColor"` tick label through normal
            CSS inheritance — no per-tick override needed.
          - The plotted curve itself uses `function-plot`'s own named
            palette (globals.js: steelblue/red/#05b378/orange/...), not
            black — confirmed via source, so it was NOT dark-on-dark and
            needed no override. (Not live-verified for contrast — flagging
            for founder's live check per this task's own instructions.)
          - This card is NOT forced to always-light like `/print` — the
            override below was judged a reasonable, scoped fix instead of
            that fallback. Revisit the always-light fallback only if a
            live check finds this CSS insufficient.
      */}
      <style jsx global>{`
        .mathplot-canvas .function-plot {
          color: var(--text-secondary);
        }
        .mathplot-canvas .function-plot .axis path,
        .mathplot-canvas .function-plot .axis line,
        .mathplot-canvas .function-plot .x.origin,
        .mathplot-canvas .function-plot .y.origin {
          stroke: var(--text-tertiary);
        }
        .mathplot-canvas .function-plot text.title {
          fill: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
