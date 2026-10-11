/*
 * Who TTS is, the first thing on home's sheet. The line is Caleb's own
 * description of the club (RUBRIC: "We do everything AI. Automations,
 * teaching, crm, blah blah blah, wtv a company needs!"), global since
 * 2026-10-10. Tyler's voice memo, 2026-10-10 11:54pm, set the rest: students
 * build it and "pass it off" to the client's team; the type smaller, centred
 * and "more professional", with the restraint of the Trojan Investing
 * Society site (one plain declarative paragraph, no accent phrase); and the
 * clay city that sat under it is gone, "too big of a thing to scroll
 * through". Its film (public/tts/home/world) stays on disk for a lower spot.
 */
export default function Statement() {
  return (
    <>
      <h2 id="ld-who-h" className="ld-say" data-reveal="0">
        We build whatever AI a company or nonprofit needs, anywhere in the
        world, from automations and CRMs to outbound and team training.
      </h2>
      <p className="ld-say-sub" data-reveal="1">
        USC students build it, then hand it off to the client&apos;s own team.
      </p>
    </>
  );
}
