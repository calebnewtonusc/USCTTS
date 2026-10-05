import { TC_URL } from "./links";

/** A link to T Combinator when its deployment exists, plain text until then. */
export default function TcLink({
  className,
  children,
  hideWhenPending = false,
}: {
  className?: string;
  children: React.ReactNode;
  /** For button-shaped uses, where plain text would look clickable and is not. */
  hideWhenPending?: boolean;
}) {
  if (!TC_URL && hideWhenPending) return null;
  if (!TC_URL) return <span className={className ? `${className} is-pending` : "is-pending"}>{children}</span>;
  return (
    <a className={className} href={TC_URL}>
      {children}
    </a>
  );
}
