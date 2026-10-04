"use client";

import type { Dataset } from "./pipeline";

export const DATASET_URL = "/tts/run/portfolio-board-2026-09-15.json";

// One fetch per page view, shared by the intake stream and the run, so the
// two exhibits are reading the same bytes.
let pending: Promise<{ data: Dataset; ms: number }> | null = null;

export function loadDataset() {
  if (!pending) {
    const start = performance.now();
    pending = fetch(DATASET_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Dataset request failed with ${res.status}`);
        return res.json() as Promise<Dataset>;
      })
      .then((data) => ({ data, ms: performance.now() - start }))
      .catch((err: unknown) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}
