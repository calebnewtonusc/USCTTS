import TcLink from "@/components/tts/TcLink";
import { TC_URL } from "@/components/tts/links";

/* TTS and T Combinator were one deployment with a two-way toggle. T Combinator
 * now has its own deployment, so from TTS this is a plain link across to /tc
 * (redirected in next.config.mjs), kept first in the document so the two
 * still read as siblings. Until that deployment exists it is plain text. */
export default function SiteToggle() {
  // Plain text serves neither reader, so the banner waits for a live deploy.
  if (!TC_URL) return null;
  return (
    <div className="sitetoggle" role="navigation" aria-label="Sister site">
      <TcLink className="sitetoggle-link">
        <span className="sitetoggle-mark">TC</span>
        <span>T Combinator is our founder-facing branch, for YC companies</span>
        {TC_URL && <span aria-hidden="true">&rarr;</span>}
      </TcLink>
    </div>
  );
}
