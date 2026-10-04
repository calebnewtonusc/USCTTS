"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/tts/Shell";

const STORAGE_KEY = "tts-meetings-unlocked";
// A speed bump for slides, not security: the slides themselves ship in the
// bundle. Anything private does not belong under /meetings.
const ANSWER = "gravity";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setUnlocked(sessionStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        setUnlocked(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const attempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().toLowerCase() === ANSWER) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* Private mode: the unlock lasts for this page only, which is fine. */
      }
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <Shell>
      <section className="hero col section-head prose" aria-labelledby="gate-title">
        <h1 id="gate-title" className="t-h2">
          Members only.
        </h1>
        <p className="t-lead">Meeting slides live behind a password. Ask anyone running the club if you need it.</p>
      </section>
      <section className="col mt-l" aria-label="Password">
        {unlocked === null ? (
          <p className="label" role="status">
            Checking whether this tab is already unlocked.
          </p>
        ) : (
          <form className="form" onSubmit={attempt} autoComplete="off" noValidate>
            <div className="field">
              <label htmlFor="pw">Password</label>
              <input
                id="pw"
                className="input"
                type="password"
                value={value}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "pw-error" : undefined}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(false);
                }}
              />
              {error && (
                <span className="field-error" id="pw-error" role="alert">
                  That is not it. Check with someone running the club and try again.
                </span>
              )}
            </div>
            <div>
              <button type="submit" className="btn btn-primary">
                Unlock
              </button>
            </div>
          </form>
        )}
      </section>
    </Shell>
  );
}
