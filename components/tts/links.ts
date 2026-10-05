// T Combinator is its own site and its own deployment (rebuild v2,
// 2026-10-04). TTS only ever links to a host we own: /tc on this site, which
// next.config.mjs redirects to the T Combinator deployment.
//
// [NEED: domain] tcombinator.io was the name in the old middleware's host
// list, and on 2026-10-04 whois answered "Domain not found" for it. A link to
// an unregistered domain lets anyone buy it and take the traffic, so it is not
// linked anywhere. Until the deployment's origin is set in
// NEXT_PUBLIC_TC_ORIGIN, TC_URL is null, every T Combinator mention renders
// as plain text, and nothing redirects.
export const TC_ORIGIN = process.env.NEXT_PUBLIC_TC_ORIGIN ?? "";
export const TC_URL: string | null = TC_ORIGIN ? "/tc" : null;
