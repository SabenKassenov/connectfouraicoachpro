import type { Board } from "./game";
import type { Lang } from "./i18n";
import { ROWS, COLS } from "./game";

// Letters matrix is parallel to the board: null when no chip, otherwise a single letter (uppercase).
export type Letters = (string | null)[][];

export const emptyLetters = (): Letters =>
  Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));

// Letter pools per language — kept short and game-friendly.
const POOLS: Record<Lang, string[]> = {
  en: ["A", "I", "G", "M", "E", "C", "O", "D", "W", "N", "P", "L", "Y", "T", "R", "S"],
  ru: ["И", "Г", "Р", "А", "К", "О", "Д", "Х", "В", "Н", "С", "Т", "Л", "М"],
  kz: ["О", "Й", "Ы", "Н", "К", "О", "Д", "Ж", "Е", "Ң", "І", "С", "А", "Р"],
};

// Small per-language dictionary used to detect bonus words.
const DICTS: Record<Lang, string[]> = {
  en: ["AI", "GAME", "CODE", "WIN", "PLAY", "PRO", "TOP", "ACE", "NET", "ONE", "TEN", "DAY"],
  ru: ["ИИ", "ИГРА", "КОД", "ХОД", "СЕТ", "ТОН", "ВОЛ"],
  kz: ["ОЙЫН", "КОД", "ЖЕҢІС", "ЕС", "СӨЗ"],
};

export function randomLetter(lang: Lang): string {
  const pool = POOLS[lang] ?? POOLS.en;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getDictionary(lang: Lang): string[] {
  return DICTS[lang] ?? DICTS.en;
}

// Detect all dictionary words formed by consecutive cells horizontally, vertically,
// or diagonally — in either direction. Returns word + the cells composing it.
export function detectWords(
  letters: Letters,
  lang: Lang,
): { word: string; cells: [number, number][] }[] {
  const dict = new Set(getDictionary(lang).map((w) => w.toUpperCase()));
  if (dict.size === 0) return [];
  const maxLen = Math.max(...Array.from(dict).map((w) => w.length));
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  const found = new Map<string, { word: string; cells: [number, number][] }>();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!letters[r][c]) continue;
      for (const [dr, dc] of dirs) {
        let str = "";
        const cells: [number, number][] = [];
        for (let k = 0; k < maxLen; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          const ch = letters[nr][nc];
          if (!ch) break;
          str += ch.toUpperCase();
          cells.push([nr, nc]);
          if (str.length >= 2 && dict.has(str)) {
            const key = `${str}:${r}:${c}:${dr}:${dc}`;
            found.set(key, { word: str, cells: [...cells] });
          }
          // also check reverse (so right-to-left etc.)
          const rev = str.split("").reverse().join("");
          if (rev !== str && rev.length >= 2 && dict.has(rev)) {
            const key = `${rev}:${r}:${c}:${dr}:${dc}:rev`;
            found.set(key, { word: rev, cells: [...cells] });
          }
        }
      }
    }
  }
  return Array.from(found.values());
}
