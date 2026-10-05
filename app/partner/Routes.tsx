/* Three routes out of the club, drawn on the grid: the visual says what the
 * page offers, so the line above it can stay short. A fourth, dashed route
 * points businesses to the project form instead. */
const ROUTES = [
  { y: 34, code: "sponsor", label: "Back the club" },
  { y: 94, code: "speak", label: "Talk at a meeting" },
  { y: 154, code: "recruit", label: "Hire from the club" },
];

export default function Routes() {
  return (
    <svg className="ix-routes" viewBox="0 0 420 220" role="img" aria-label="Three ways to partner: sponsor the club, speak at a meeting, or recruit from it.">
      {ROUTES.map((r, i) => (
        <g key={r.code}>
          <path
            className="ix-route draw"
            pathLength={1}
            style={{ ["--i" as string]: i }}
            d={`M40 94 C110 94 120 ${r.y} 190 ${r.y} L230 ${r.y}`}
          />
          <circle className="ix-stop" cx="236" cy={r.y} r="5" />
          <text className="ix-lab" x="250" y={r.y - 4}>
            {r.code}
          </text>
          <text className="ix-lab-2" x="250" y={r.y + 16}>
            {r.label}
          </text>
        </g>
      ))}
      <path className="ix-route is-dash" d="M40 94 C70 94 80 204 140 204 L230 204" />
      <text className="ix-lab" x="250" y="208" opacity="0.6">
        or a project
      </text>
      <circle className="ix-node" cx="40" cy="94" r="7" />
      <text className="ix-lab" x="40" y="76" textAnchor="middle">
        TTS
      </text>
    </svg>
  );
}
