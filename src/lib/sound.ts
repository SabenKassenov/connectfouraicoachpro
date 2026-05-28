// Lightweight WebAudio-based sound effects (no asset downloads).
type Kind = "drop" | "win" | "click" | "achievement";

let ctx: AudioContext | null = null;
let muted = false;

if (typeof window !== "undefined") {
  muted = localStorage.getItem("c4_muted") === "1";
}

function ensure() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  return ctx;
}

function tone(freq: number, duration = 0.12, type: OscillatorType = "sine", gain = 0.15, delay = 0) {
  const ac = ensure();
  if (!ac || muted) return;
  const t0 = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  o.connect(g).connect(ac.destination);
  o.start(t0);
  o.stop(t0 + duration + 0.02);
}

export function playSound(kind: Kind) {
  if (muted) return;
  switch (kind) {
    case "drop":
      tone(220, 0.08, "triangle", 0.18);
      tone(140, 0.14, "sine", 0.15, 0.04);
      break;
    case "win":
      tone(523, 0.12, "triangle", 0.18, 0);
      tone(659, 0.12, "triangle", 0.18, 0.12);
      tone(784, 0.2, "triangle", 0.2, 0.24);
      break;
    case "click":
      tone(880, 0.05, "square", 0.08);
      break;
    case "achievement":
      tone(660, 0.1, "sine", 0.16, 0);
      tone(990, 0.18, "sine", 0.18, 0.1);
      break;
  }
}

export function isMuted() {
  return muted;
}
export function setMuted(v: boolean) {
  muted = v;
  if (typeof window !== "undefined") localStorage.setItem("c4_muted", v ? "1" : "0");
}
