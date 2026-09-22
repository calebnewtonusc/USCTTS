import { NextResponse, type NextRequest } from "next/server";

/* Two sites, one deployment.
 *
 * usctts.com serves TTS from /. A T Combinator hostname serves the same app
 * from /tc without the prefix ever appearing in the URL, so
 * tcombinator.io/for/baud renders /tc/for/baud.
 *
 * The domain is not bought yet. Until it is, /tc works directly and nothing
 * here fires, so buying it is a DNS change and an entry in this list rather
 * than a code change.
 */
const TC_HOSTS = new Set([
  "tcombinator.io",
  "www.tcombinator.io",
  "tcombinator.org",
  "www.tcombinator.org",
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0] ?? "";
  if (!TC_HOSTS.has(host)) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Already prefixed, or an API route both sites share. Leave it alone;
  // rewriting /tc to /tc/tc is the obvious way to break this.
  if (pathname === "/tc" || pathname.startsWith("/tc/") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/tc" : `/tc${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Static assets and image optimization are shared by both hostnames and must
  // not be rewritten, or the T Combinator host loses every font and image.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|img/|fonts/|video/).*)"],
};
