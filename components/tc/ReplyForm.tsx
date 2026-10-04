"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { mailto } from "./contact";

/* The form asks the exact question from the short DM opener, because that
 * question is what fixed read-without-reply: it costs a founder one sentence
 * and agrees to nothing (00-THE-MESSAGE.md, "The short opener").
 *
 * It posts to the shared /api/partner route, which writes a row to the
 * Supabase `partnerships` table and answers 201, 400 or 500. Each of those has
 * its own state here, and the founder's words survive every failure. */

type Status = "idle" | "sending" | "sent" | "failed";
type Field = "answer" | "name" | "email" | "company";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// The API requires a description of at least 10 characters. Asking for that
// here, with a sentence saying so, beats a 400 the founder cannot read.
const MIN_ANSWER = 10;

export default function ReplyForm({
  company,
}: {
  company?: { name: string; slug: string };
}) {
  const id = useId();
  const [values, setValues] = useState({
    answer: "",
    name: "",
    email: "",
    company: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const refs = {
    answer: useRef<HTMLTextAreaElement>(null),
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    company: useRef<HTMLInputElement>(null),
  };
  const doneRef = useRef<HTMLHeadingElement>(null);

  const orgName = company?.name ?? values.company.trim();

  function validate(): Partial<Record<Field, string>> {
    const next: Partial<Record<Field, string>> = {};
    if (values.answer.trim().length < MIN_ANSWER) {
      next.answer = "One real sentence is plenty. Ten characters at least.";
    }
    if (!values.name.trim())
      next.name = "Your name, so the reply has someone to go to.";
    if (!EMAIL.test(values.email.trim()))
      next.email = "An email we can answer, like you@company.com.";
    if (!company && !values.company.trim())
      next.company = "Which company is this for?";
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    const first = (["answer", "name", "email", "company"] as Field[]).find(
      (f) => found[f],
    );
    if (first) {
      refs[first].current?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName,
          contactName: values.name.trim(),
          email: values.email.trim(),
          partnerType: "Client Project",
          description: `[T Combinator${company ? `, /tc/for/${company.slug}` : ", /tc"}] ${values.answer.trim()}`,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      // Focus follows the content, or a screen reader never hears it landed.
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      setStatus("failed");
    }
  }

  function set(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  if (status === "sent") {
    return (
      <div className="tc-form tc-form--done" role="status">
        <h3 ref={doneRef} tabIndex={-1} className="tc-h3">
          Got it, {values.name.trim().split(" ")[0]}.
        </h3>
        <p>
          Your answer is with us, and the reply goes to{" "}
          <strong>{values.email.trim()}</strong>. If it&apos;s the kind of thing
          we take, the next message has a time for the twenty minutes in it.
        </p>
        <p className="tc-quote">&ldquo;{values.answer.trim()}&rdquo;</p>
      </div>
    );
  }

  const fallback = mailto(
    company ? `T Combinator for ${company.name}` : "T Combinator",
    values.answer.trim() || undefined,
  );

  return (
    <form
      className="tc-form"
      noValidate
      onSubmit={onSubmit}
      aria-describedby={`${id}-hint`}
    >
      <div className="tc-field">
        <label htmlFor={`${id}-answer`} className="tc-label tc-label--q">
          What&apos;s the thing you&apos;d hand off if you had someone to hand
          it to?
        </label>
        <textarea
          ref={refs.answer}
          id={`${id}-answer`}
          name="answer"
          rows={4}
          className="tc-input tc-input--area"
          value={values.answer}
          onChange={(e) => set("answer", e.target.value)}
          aria-invalid={Boolean(errors.answer)}
          aria-describedby={errors.answer ? `${id}-answer-err` : undefined}
          maxLength={1800}
        />
        {errors.answer ? (
          <p id={`${id}-answer-err`} className="tc-err">
            {errors.answer}
          </p>
        ) : null}
      </div>

      <div className="tc-field-pair">
        <div className="tc-field">
          <label htmlFor={`${id}-name`} className="tc-label">
            Your name
          </label>
          <input
            ref={refs.name}
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            className="tc-input"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-err` : undefined}
            maxLength={100}
          />
          {errors.name ? (
            <p id={`${id}-name-err`} className="tc-err">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className="tc-field">
          <label htmlFor={`${id}-email`} className="tc-label">
            Email
          </label>
          <input
            ref={refs.email}
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className="tc-input"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${id}-email-err` : undefined}
            maxLength={200}
          />
          {errors.email ? (
            <p id={`${id}-email-err`} className="tc-err">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      {company ? null : (
        <div className="tc-field">
          <label htmlFor={`${id}-company`} className="tc-label">
            Company
          </label>
          <input
            ref={refs.company}
            id={`${id}-company`}
            name="company"
            autoComplete="organization"
            className="tc-input"
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? `${id}-company-err` : undefined}
            maxLength={200}
          />
          {errors.company ? (
            <p id={`${id}-company-err`} className="tc-err">
              {errors.company}
            </p>
          ) : null}
        </div>
      )}

      {status === "failed" ? (
        <div className="tc-failed" role="alert">
          <p>
            That didn&apos;t send, and nothing you typed is lost. Try once more,
            or{" "}
            <a className="tc-link tc-link--inline" href={fallback}>
              send the same answer by email
            </a>
            .
          </p>
        </div>
      ) : null}

      <div className="tc-actions">
        <button
          type="submit"
          className="tc-btn"
          disabled={status === "sending"}
          aria-busy={status === "sending"}
        >
          {status === "sending"
            ? "Sending"
            : status === "failed"
              ? "Try again"
              : "Send it"}
        </button>
        <p id={`${id}-hint`} className="tc-note-line">
          No call gets booked from this. It&apos;s one answer, and{" "}
          <a className="tc-link tc-link--inline" href={fallback}>
            email works too
          </a>
          .
        </p>
      </div>
    </form>
  );
}

