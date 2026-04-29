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
    } catch (err) {
      console.error("MathPlot error:", err);
      containerRef.current.innerHTML = `<div class="p-4 text-xs text-red-500 bg-red-50 rounded-lg">Error plotting "${equation}": ${err}</div>`;
    }
  }, [equation, title, width, height]);

  return (
    <div className="flex flex-col items-center my-6 bg-white p-4 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>}
      
      {!equation.trim() && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/20 text-[var(--accent)] mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Student Workspace</span>
          </div>
          <p className="text-xs text-gray-500 italic">Please use the grid below to plot your answer.</p>
        </div>
      )}

      <div ref={containerRef} className="max-w-full" />
      
      {equation.trim() && (
        <p className="mt-2 text-[10px] text-gray-400 font-mono italic">f(x) = {equation}</p>
      )}
    </div>
  );
}
