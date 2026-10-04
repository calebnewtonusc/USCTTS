import type { ReactNode } from "react";
import type { Reason } from "./reasoning";

/* The grammar of the whole site: a margin label on the left, the value on the
 * right, one hairline between rows. Below 760px the label stacks above. */
export function Row({
  label,
  children,
  id,
}: {
  label: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div className="tc-row" id={id}>
      <div className="tc-row-label">{label}</div>
      <div className="tc-row-body">{children}</div>
    </div>
  );
}

/* The accent's only job. A Fill is a value read from the founder's own YC
 * listing, and nothing else on the site may use the highlighter, so a founder
 * can see at a glance which words came from them. */
export function Fill({ children }: { children: ReactNode }) {
  return <mark className="tc-fill">{children}</mark>;
}

export function ReasonText({ reason }: { reason: Reason }) {
  return (
    <>
      {reason.lead}
      <Fill>{reason.fill}</Fill>
      {reason.tail}
    </>
  );
}
