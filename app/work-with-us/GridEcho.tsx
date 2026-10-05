/* A static echo of home v4's grid of light for the inner pages: the street
 * grid and its points in CSS (.ix-grid), two freeway lines in sky, and USC
 * as one cardinal point, placed where home puts it. No WebGL. */
export default function GridEcho({ usc = { x: 72, y: 46 } }: { usc?: { x: number; y: number } | null }) {
  return (
    <>
      <div className="ix-grid" aria-hidden="true" />
      <svg className="ix-ways" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="ix-way" d="M-5 22 C30 26 52 30 70 38 S96 60 106 64" />
        <path className="ix-way" d="M58 -5 C62 20 66 34 70 48 S78 82 80 106" />
        <path className="ix-way is-thin" d="M-5 70 C20 64 44 58 66 52 S92 40 106 34" />
        {usc && (
          <>
            <ellipse className="ix-usc-halo" cx={usc.x} cy={usc.y} rx="2.2" ry="3.4" />
            <ellipse className="ix-usc" cx={usc.x} cy={usc.y} rx="0.45" ry="0.7" />
          </>
        )}
      </svg>
    </>
  );
}
