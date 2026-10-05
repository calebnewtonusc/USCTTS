// T Combinator is its own site and its own deployment (rebuild v2,
// 2026-10-04). TTS only ever links to a host we own: /tc on this site, which
// next.config.mjs redirects to the T Combinator deployment.
//
// [NEED: domain] tcombinator.io was the name in the old middleware's host
// list, and on 2026-10-04 whois answered "Domain not found" for it. A link to
// an unregistered domain lets anyone buy it and take the traffic, so it is not
// linked anywhere. Until the deployment's origin is set in
// NEXT_PUBLIC_TC_ORIGIN, TC_URL is null and every mention renders as text.
//
// The lead asked for https://tcombinator-production.up.railway.app as the
// default. On 2026-10-04 that host answered 404 "Application not found"
// (x-railway-fallback: true): no app is deployed there, so the link was dead
// and the subdomain is claimable by any Railway user. It is not the default
// until it serves T Combinator; set NEXT_PUBLIC_TC_ORIGIN to it then.
export const TC_PENDING_ORIGIN = "https://tcombinator-production.up.railway.app";
export const TC_ORIGIN = process.env.NEXT_PUBLIC_TC_ORIGIN ?? "";
export const TC_URL: string | null = TC_ORIGIN ? "/tc" : null;
