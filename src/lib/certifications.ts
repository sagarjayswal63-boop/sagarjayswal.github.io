export interface Certification {
  id: string;
  title: string;
  issuer: string;
  completed: string;
  competencies: string[];
  credentialUrl?: string;
  documentSha256?: string;
  verifiedDate?: string;
}
// The supplied résumé contains no certification records. Keep the public
// section absent until real issuer/completion information is provided.
export const certifications: Certification[] = [];
export function shortestDelta(from: number, to: number) {
  return ((to - from + 540) % 360 + 360) % 360 - 180;
}
export function radiusFor(width: number) { return width <= 660 ? 275 : width <= 980 ? 380 : 480; }
export function frontFacing(degrees: number) { return Math.cos(degrees * Math.PI / 180) > 0; }
export function releaseVelocity(samples: { x: number; time: number }[]) {
  if (samples.length < 2) return 0;
  const first = samples[0], last = samples[samples.length - 1];
  return Math.max(-3, Math.min(3, (last.x - first.x) / Math.max(1, last.time - first.time) * 16.67 * .25));
}
