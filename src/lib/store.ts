import * as React from "react";

export type Skin = "classic" | "cyberpunk" | "golden" | "wooden" | "space";

export type MatchRecord = {
  id: string;
  result: "win" | "loss" | "draw";
  difficulty: "easy" | "medium" | "hard";
  movesCount: number;
  summary?: string;
  timestamp: number;
};

export type ProfileState = {
  nickname: string;
  country: string;
  city: string;
  coins: number;
  xp: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  badges: string[];
  ownedSkins: Skin[];
  selectedSkin: Skin;
  history: MatchRecord[];
  isPro: boolean;
};

const KEY = "c4_profile_v1";

function randomGuestName() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `Guest${n}`;
}

const defaultState = (): ProfileState => ({
  nickname: randomGuestName(),
  country: "Kazakhstan",
  city: "Almaty",
  coins: 100,
  xp: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
  badges: [],
  ownedSkins: ["classic"],
  selectedSkin: "classic",
  history: [],
  isPro: false,
});

function loadState(): ProfileState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<ProfileState>;
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function saveState(s: ProfileState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignore quota errors
  }
}

type Listener = (s: ProfileState) => void;

class Store {
  state: ProfileState = defaultState();
  listeners = new Set<Listener>();
  hydrated = false;

  hydrate() {
    if (this.hydrated) return;
    this.state = loadState();
    this.hydrated = true;
    this.emit();
  }
  emit() {
    saveState(this.state);
    for (const l of this.listeners) l(this.state);
  }
  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  update(fn: (s: ProfileState) => ProfileState) {
    this.state = fn(this.state);
    this.emit();
  }
}

const store = new Store();

export function useProfile() {
  const [s, setS] = React.useState<ProfileState>(store.state);
  React.useEffect(() => {
    store.hydrate();
    setS(store.state);
    const unsub = store.subscribe(setS);
    return () => {
      unsub();
    };
  }, []);
  return s;
}

export const profileActions = {
  setNickname: (nickname: string) =>
    store.update((s) => ({ ...s, nickname: nickname.trim() || s.nickname })),
  setCountry: (country: string) => store.update((s) => ({ ...s, country })),
  setCity: (city: string) => store.update((s) => ({ ...s, city })),
  setSkin: (skin: Skin) => store.update((s) => ({ ...s, selectedSkin: skin })),
  buySkin: (skin: Skin, price: number) =>
    store.update((s) => {
      if (s.ownedSkins.includes(skin)) return { ...s, selectedSkin: skin };
      if (s.coins < price) return s;
      return {
        ...s,
        coins: s.coins - price,
        ownedSkins: [...s.ownedSkins, skin],
        selectedSkin: skin,
      };
    }),
  addMatch: (m: Omit<MatchRecord, "id" | "timestamp">) =>
    store.update((s) => {
      const rec: MatchRecord = { ...m, id: crypto.randomUUID(), timestamp: Date.now() };
      const wins = s.wins + (m.result === "win" ? 1 : 0);
      const losses = s.losses + (m.result === "loss" ? 1 : 0);
      const draws = s.draws + (m.result === "draw" ? 1 : 0);
      const currentStreak = m.result === "win" ? s.currentStreak + 1 : 0;
      const bestStreak = Math.max(s.bestStreak, currentStreak);
      const earned =
        (m.result === "win" ? 25 : m.result === "draw" ? 8 : 2) +
        (m.difficulty === "hard" ? 15 : m.difficulty === "medium" ? 7 : 0);
      const xp = s.xp + (m.result === "win" ? 30 : 10);
      const coins = s.coins + earned;
      const history = [rec, ...s.history].slice(0, 100);
      const badges = [...s.badges];
      if (wins === 1 && !badges.includes("first_win")) badges.push("first_win");
      if (currentStreak >= 3 && !badges.includes("streak_3")) badges.push("streak_3");
      if (m.difficulty === "hard" && m.result === "win" && !badges.includes("hard_win"))
        badges.push("hard_win");
      return { ...s, wins, losses, draws, currentStreak, bestStreak, coins, xp, history, badges };
    }),
  addCoins: (n: number) => store.update((s) => ({ ...s, coins: s.coins + n })),
  setPro: (v: boolean) => store.update((s) => ({ ...s, isPro: v })),
};
