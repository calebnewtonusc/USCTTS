import { TC_URL } from "@/components/tts/links";

/* TTS and T Combinator were one deployment with a two-way toggle. T Combinator
 * now lives in its own repo and deployment, so from TTS this is a plain link
 * across, kept as the first thing in the document so the two still read as
 * siblings. */
export default function SiteToggle() {
  return (
    <div className="sitetoggle" role="navigation" aria-label="Sister site">
      <a className="sitetoggle-link" href={TC_URL}>
        <span className="sitetoggle-mark">TC</span>
        <span>Run a YC company? T Combinator is our founder-facing branch</span>
        <span aria-hidden="true">&rarr;</span>
      </a>
    </div>
  );
}
