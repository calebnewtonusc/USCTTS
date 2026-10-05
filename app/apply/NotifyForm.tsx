"use client";

import { useState } from "react";
import { EMAIL } from "@/components/tts/forms";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "added"; email: string }
  | { kind: "error"; message: string };

/* Applications are closed, so the one thing a student can do is ask to hear
 * when they open. Posts to /api/notify, which writes to email_signups and
 * answers the same way whether or not the address was already on the list. */
export default function NotifyForm() {
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (res.ok) {
        setState({ kind: "added", email: value });
      } else if (res.status === 400) {
        setInvalid(true);
        setState({ kind: "idle" });
      } else {
        setState({
          kind: "error",
          message: "That didn't go through on our end. Your email is still in the box, so try again in a minute.",
        });
      }
    } catch {
      setState({
        kind: "error",
        message: "That didn't go through, which usually means the connection dropped. Your email is still in the box, so try again.",
      });
    }
  };

  if (state.kind === "added") {
    return (
      <div className="nf-done" role="status">
        <p>
          {`You're on the list. We'll email ${state.email} when applications open.`}
        </p>
      </div>
    );
  }

  return (
    <form className="nf" onSubmit={submit} noValidate>
      <label htmlFor="nf-email" className="nf-label">
        Your email
      </label>
      <div className="nf-row">
        <input
          id="nf-email"
          className="input"
          type="email"
          autoComplete="email"
          placeholder="tommy@usc.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "nf-error" : undefined}
        />
        <button type="submit" className="btn btn-primary" disabled={state.kind === "sending"}>
          {state.kind === "sending" ? "Adding you" : "Tell me when it opens"}
        </button>
      </div>
      {invalid && (
        <span className="field-error" id="nf-error">
          Add an email we can reach you at, like tommy@usc.edu.
        </span>
      )}
      {state.kind === "error" && (
        <div className="form-alert" role="alert">
          <p>{state.message}</p>
        </div>
      )}
    </form>
  );
}
