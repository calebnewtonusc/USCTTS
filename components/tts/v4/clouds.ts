// Written by scripts/cloud-crop.py from the renders of blender/clouds.py.
// Each: the cropped render, its width over height, and the insets the
// render is drawn past its caption's box by (left, top, right, bottom,
// each a share of the box), so the text sits on the cloud's body.
export const CLOUD_DATA: {
  src: string;
  aspect: number;
  inset: [number, number, number, number];
}[] = [
  { src: "/tts/machine/cloud-1.webp", aspect: 3.0863, inset: [0.158, 0.721, 0.158, 0.176] },
  { src: "/tts/machine/cloud-2.webp", aspect: 1.9726, inset: [0.158, 0.525, 0.158, 0.146] },
  { src: "/tts/machine/cloud-3.webp", aspect: 1.6506, inset: [0.158, 0.937, 0.158, 0.185] },
  { src: "/tts/machine/cloud-4.webp", aspect: 2.5874, inset: [0.158, 1.111, 0.158, 0.207] },
  { src: "/tts/machine/cloud-5.webp", aspect: 2.3030, inset: [0.158, 0.893, 0.158, 0.186] },
  { src: "/tts/machine/cloud-6.webp", aspect: 2.2633, inset: [0.158, 0.852, 0.158, 0.183] },
];
