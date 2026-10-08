"use client";

// Lightweight inline SVG area chart — no charting library. Keeps the admin
// bundle small and matches how MathPlot already renders charts in this repo
// without pulling in recharts/d3 (shadcn's dashboard examples use recharts;
// this repo's own design system is custom components only, per CLAUDE.md §3).

interface AreaChartPoint {
  label: string;
  value: number;
}

export function AdminAreaChart({
  data,
  height = 160,
}: {
  data: AreaChartPoint[];
  height?: number;
}) {
  const width = 640;
  const padTop = 12;
  const padBottom = 28;
  const padX = 4;
  const max = Math.max(1, ...data.map((d) => d.value));
  const innerHeight = height - padTop - padBottom;
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padX + i * stepX,
    y: padTop + innerHeight - (d.value / max) * innerHeight,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x.toFixed(1)},${(padTop + innerHeight).toFixed(1)} L${points[0].x.toFixed(1)},${(padTop + innerHeight).toFixed(1)} Z`
      : "";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="New educators per week"
    >
      <defs>
        <linearGradient id="adminAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent, #1a5e3f)" stopOpacity={0.22} />
          <stop offset="100%" stopColor="var(--accent, #1a5e3f)" stopOpacity={0.01} />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line
        x1={padX}
        y1={padTop + innerHeight}
        x2={width - padX}
        y2={padTop + innerHeight}
        stroke="var(--border)"
        strokeWidth={1}
      />

      {areaPath && <path d={areaPath} fill="url(#adminAreaFill)" />}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke="var(--accent, #1a5e3f)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* No per-point <title> here: React 19 hoists <title> elements into
          <head> as document metadata wherever they render, which fights
          with hydration for repeated SVG tooltips. The chart's own
          aria-label covers accessibility instead. */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--accent, #1a5e3f)" />
      ))}

      {data.map((d, i) => (
        <text
          key={i}
          x={points[i].x}
          y={height - 8}
          textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
          fontSize={10}
          fill="var(--text-tertiary)"
          fontFamily="var(--font-geist-mono, ui-monospace)"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}
