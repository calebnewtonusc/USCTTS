/* The one thing the world tells the rest of the page: where its
 * qualification station is on screen, so the seam into the run panels can
 * grow the readout out of it. Set by WorldScene once the world exists. */
export const worldBridge: { qualify: null | (() => { x: number; y: number }) } = {
  qualify: null,
};
