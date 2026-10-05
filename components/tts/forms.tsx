"use client";

import { useState } from "react";

/* Shared pieces for the three TTS forms (/apply, /work-with-us/form,
 * /partner). Errors sit next to the field they belong to, never in colour
 * alone, and the visitor's input is always kept. */

export type Errors<K extends string> = Partial<Record<K, string>>;

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <span className="hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {children}
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

/** aria wiring for an input inside <Field>. */
export function describe(id: string, hint: boolean, error?: string) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": ids || undefined,
  } as const;
}

export function Choices<V extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  multiple = false,
  selected = [],
}: {
  name: string;
  legend: string;
  options: { value: V; label: string }[];
  value?: V | "";
  onChange: (v: V) => void;
  error?: string;
  multiple?: boolean;
  selected?: V[];
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend>{legend}</legend>
      <div className="choices">
        {options.map((o) => (
          <label key={o.value} className="choice">
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={o.value}
              checked={
                multiple ? selected.includes(o.value) : value === o.value
              }
              onChange={() => onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <span className="field-error" id={`${name}-error`}>
          {error}
        </span>
      )}
    </fieldset>
  );
}

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST JSON and turn any failure into a sentence a person can act on. */
export async function postJson(
  url: string,
  body: unknown,
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return null;
    if (res.status === 400)
      return "Something in the form did not pass the server's check. Look over each field and send it again.";
    return "It did not go through on our end. Your answers are still here, so try again in a minute.";
  } catch {
    return "It did not go through, which usually means the connection dropped. Your answers are still here, so try again.";
  }
}

export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const set = <K extends keyof T>(k: K, v: T[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));
  return { values, set };
}

/** After a failed submit, move focus to the first field that needs fixing. */
export function focusFirstError() {
  requestAnimationFrame(() => {
    document
      .querySelector<HTMLElement>('form [aria-invalid="true"], form fieldset[aria-describedby] input')
      ?.focus();
  });
}

/* Where to go when the form itself cannot deliver. On 2026-10-04 the live
 * database was paused and the deployment had no database env, so every submit
 * failed; the lead is fixing that, and this keeps a failure from being a dead
 * end. No usctts.com mailbox exists yet (docs/EMAIL.md: Workspace not bought),
 * so an address only appears once NEXT_PUBLIC_TTS_CONTACT_EMAIL names one that
 * is read. Until then the fallback is the club's two working public channels.
 * [NEED: a monitored contact address] */
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_TTS_CONTACT_EMAIL ?? "";

export function FormFailure({ message, subject, body }: { message: string; subject: string; body: string }) {
  const mailto = CONTACT_EMAIL
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : "";
  return (
    <div className="form-alert" role="alert">
      <p>{message}</p>
      <p className="mt-s">
        {mailto ? (
          <>
            Or send the same answers by email:{" "}
            <a className="link" href={mailto}>
              open an email with them filled in
            </a>
            .
          </>
        ) : (
          <>
            If it keeps failing, message us on{" "}
            <a className="link" href="https://www.instagram.com/trojantechsolutions" rel="noreferrer" target="_blank">
              Instagram
            </a>{" "}
            or{" "}
            <a className="link" href="https://www.linkedin.com/company/trojan-tech-solutions/" rel="noreferrer" target="_blank">
              LinkedIn
            </a>{" "}
            and we&apos;ll take it from there. Your answers stay in the form.
          </>
        )}
      </p>
    </div>
  );
}

/** A form's answers as plain text, for the email fallback. */
export function asText(values: Record<string, unknown>) {
  return Object.entries(values)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v ?? "")}`)
    .join("\n");
}


export type FormState = "idle" | "sending" | "sent" | "failed";

/* The live figure beside each form: one row per answer, lit in the accent
 * once the same check the form runs on submit passes, because that verdict
 * was just computed in the visitor's browser. The wires gather at one node,
 * and the line out of it shows what the send actually did: flowing while it
 * sends, solid when it landed, broken when it did not. */
export function FormFigure({
  rows,
  ok,
  dest,
  caption,
}: {
  rows: { key: string; label: string }[];
  ok: Record<string, boolean>;
  dest: string;
  caption: string;
}) {
  const top = 10;
  const step = 10;
  const h = top + rows.length * step + 34;
  const nodeY = top + ((rows.length - 1) * step) / 2 + 2.5;
  const done = rows.filter((r) => ok[r.key]).length;
  return (
    <figure className="pg-form-fig">
      <div className="pg-figure">
        <svg className="f" viewBox={`0 0 100 ${h}`} role="img" aria-label={`${done} of ${rows.length} answers ready`}>
          <text className="f-label" x="6" y="5.5">
            {done} of {rows.length} ready
          </text>
          {rows.map((r, i) => {
            const y = top + i * step;
            return (
              <g key={r.key} className={`fr${ok[r.key] ? " is-ok" : ""}`}>
                <rect className="fr-box" x="6" y={y} width="5" height="5" rx="0.6" />
                <text className="f-label" x="15" y={y + 3.9}>
                  {r.label}
                </text>
                <path className="fr-wire" d={`M46 ${y + 2.5} C66 ${y + 2.5} 66 ${nodeY} 80 ${nodeY}`} />
              </g>
            );
          })}
          <path className="fo-out" d={`M84 ${nodeY + 4} L84 ${h - 12}`} />
          <circle className="fo-node" cx="84" cy={nodeY} r="4" />
          <g className="fo-break">
            <path className="f-ink" d={`M81 ${h - 24} L87 ${h - 18} M87 ${h - 24} L81 ${h - 18}`} />
          </g>
          <text className="f-label f-label-ink" x="94" y={h - 5} textAnchor="end">
            {dest}
          </text>
          <text className="f-label fo-sent" x="90" y={nodeY + 1}>
            Sent
          </text>
        </svg>
      </div>
      <figcaption className="pg-fig-cap">{caption}</figcaption>
    </figure>
  );
}
