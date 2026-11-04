// A/B experiments through the middleware. Never awaits the network: the page never waits for it.
// Both values come from the site's public environment variables MW_EVENTS_URL and MW_KEY, read the way
// this framework reads them (NEXT_PUBLIC_); never write the values here. Unset: the control is shown and nothing is sent.
// The variant is assigned in the browser. A server render has no per-visitor storage, so it returns the control and sends nothing.

const MW_EVENTS = process.env.NEXT_PUBLIC_MW_EVENTS_URL ?? "";
const MW_KEY = process.env.NEXT_PUBLIC_MW_KEY ?? "";

let mwId: string | null = null;
let mwOff = !MW_EVENTS || !MW_KEY;

function mwVisitor(): string {
  if (mwId) return mwId;
  try {
    mwId = localStorage.getItem("mw_visitor");
  } catch {
    // Storage can throw (private mode, disabled). A new id is assigned below.
  }
  if (!mwId) {
    const bytes = new Uint8Array(16);
    try {
      crypto.getRandomValues(bytes);
    } catch {
      for (let i = 0; i < 16; i++) bytes[i] = Math.random() * 256;
    }
    mwId = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    try {
      localStorage.setItem("mw_visitor", mwId);
    } catch {
      // Storage can throw. The id still applies for this page load.
    }
  }
  return mwId;
}

function mwBucket(
  experiment: string,
  visitorId: string,
  variants: ReadonlyArray<readonly [string, number]>,
): string | undefined {
  let h = 0x811c9dc5;
  const s = `${experiment}:${visitorId}`;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h = (h ^ (h >>> 16)) >>> 0;
  let n = h % variants.reduce((sum, [, w]) => sum + w, 0);
  for (const [key, w] of variants) if ((n -= w) < 0) return key;
  return undefined;
}

export type MwVariantWeight = readonly [string, number];

export type MwEvent = {
  event: "exposure" | "conversion";
  experiment: string;
  variant: string;
  goal?: string;
};

// The variant to render, at once and locally. variants exactly as defined on the middleware, in order:
// [['control', 50], ['b', 50]]. On any error: the control (the first), or undefined if there is none.
export function mwVariant(
  experiment: string,
  variants: ReadonlyArray<MwVariantWeight>,
): string | undefined {
  if (typeof window === "undefined") return variants?.[0]?.[0];
  try {
    return mwBucket(experiment, mwVisitor(), variants) ?? variants[0][0];
  } catch {
    return variants?.[0]?.[0];
  }
}

// Fire and forget: returns nothing, never throws, never waits. Do not await it or chain on it.
export function mwSend(event: MwEvent): void {
  if (typeof window === "undefined") return;
  if (mwOff) return;
  try {
    const body = JSON.stringify({ key: MW_KEY, visitor_id: mwVisitor(), ...event });
    if (navigator.sendBeacon?.(MW_EVENTS, body)) return;
    const signal =
      typeof AbortSignal !== "undefined" && AbortSignal.timeout
        ? AbortSignal.timeout(3000)
        : undefined;
    fetch(MW_EVENTS, {
      method: "POST",
      body,
      keepalive: true,
      credentials: "omit",
      signal,
    }).catch(() => {
      mwOff = true;
    });
  } catch {
    mwOff = true;
  }
}
