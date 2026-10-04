/* Every address and outbound link on the T Combinator site, in one place so a
 * change is one line.
 *
 * NEED: a working inbox. docs/EMAIL.md (2026-09-28) records MX for usctts.com
 * pointed at Google but the Workspace seat not bought, so mail to this
 * address may bounce until step 2 there is done. The reply form does not
 * depend on it: it writes to the partnerships table through /api/partner. */
export const CONTACT_EMAIL = "hello@usctts.com";

export function mailto(subject: string, body?: string): string {
  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${CONTACT_EMAIL}?${params.join("&")}`;
}

export const YC_OSS_URL = "https://yc-oss.github.io/";
