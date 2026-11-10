interface Point {
  date: string;
  applications: number;
  jobs: number;
}

/** Bars = applications per day, line = jobs posted per day. Plain SVG, no chart library. */
export default function TrendChart({ data }: { data: Point[] }) {
  const W = 640, H = 220, padL = 34, padR = 8, padT = 12, padB = 26;
  const max = Math.max(4, ...data.map((d) => Math.max(d.applications, d.jobs)));
  const niceMax = Math.ceil(max / 4) * 4;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const step = innerW / Math.max(1, data.length);
  const barW = Math.max(3, step * 0.62);
  const y = (v: number) => padT + innerH - (v / niceMax) * innerH;
  const x = (i: number) => padL + i * step + step / 2;
  const ticks = [0, 1, 2, 3, 4].map((t) => (niceMax / 4) * t);
  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.jobs).toFixed(1)}`).join(" ");
  const label = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Applications and jobs over the last 30 days">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#9ca3af">{Math.round(t)}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <g key={d.date}>
            <rect x={x(i) - barW / 2} y={y(d.applications)} width={barW}
              height={Math.max(0, padT + innerH - y(d.applications))} rx="2" fill="#16a34a" opacity="0.85">
              <title>{`${label(d.date)}: ${d.applications} applications, ${d.jobs} jobs posted`}</title>
            </rect>
            {i % 5 === 0 && (
              <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#9ca3af">{label(d.date)}</text>
            )}
          </g>
        ))}
        <path d={line} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => d.jobs > 0 && <circle key={d.date} cx={x(i)} cy={y(d.jobs)} r="3" fill="#7c3aed" />)}
      </svg>
      <div className="mt-1 flex items-center justify-center gap-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-600"></span>Applications</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 bg-purple-600"></span>Jobs posted</span>
      </div>
    </div>
  );
}
