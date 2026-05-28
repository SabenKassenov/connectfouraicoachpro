import * as React from "react";

// Returns: { supported, listening, start, stop }
// Calls onColumn(col) (0-indexed) when a column command is recognized.
type Lang = "en" | "ru" | "kz";

const WORD_NUMS: Record<Lang, Record<string, number>> = {
  en: {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
  },
  ru: {
    "один": 1,
    "одна": 1,
    "два": 2,
    "две": 2,
    "три": 3,
    "четыре": 4,
    "пять": 5,
    "шесть": 6,
    "семь": 7,
    "первая": 1,
    "первый": 1,
    "вторая": 2,
    "второй": 2,
    "третья": 3,
    "третий": 3,
    "четвертая": 4,
    "четвертый": 4,
    "пятая": 5,
    "пятый": 5,
    "шестая": 6,
    "шестой": 6,
    "седьмая": 7,
    "седьмой": 7,
  },
  kz: {
    "бір": 1,
    "екі": 2,
    "үш": 3,
    "төрт": 4,
    "бес": 5,
    "алты": 6,
    "жеті": 7,
    "бірінші": 1,
    "екінші": 2,
    "үшінші": 3,
    "төртінші": 4,
    "бесінші": 5,
    "алтыншы": 6,
    "жетінші": 7,
  },
};

function parseColumn(text: string, lang: Lang): number | null {
  const t = text.toLowerCase().trim();
  // Match a digit 1-7
  const m = t.match(/[1-7]/);
  if (m) return parseInt(m[0], 10) - 1;
  for (const [word, num] of Object.entries(WORD_NUMS[lang])) {
    if (t.includes(word)) return num - 1;
  }
  return null;
}

export function useVoiceColumns(lang: Lang, onColumn: (col: number) => void) {
  const [listening, setListening] = React.useState(false);
  const [supported, setSupported] = React.useState(false);
  const recRef = React.useRef<any>(null);

  React.useEffect(() => {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null;
    setSupported(Boolean(SR));
  }, []);

  const start = React.useCallback(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    try {
      const rec = new SR();
      rec.lang = lang === "ru" ? "ru-RU" : lang === "kz" ? "kk-KZ" : "en-US";
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0]?.transcript ?? "";
          const col = parseColumn(transcript, lang);
          if (col !== null && col >= 0 && col < 7) onColumn(col);
        }
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [lang, onColumn]);

  const stop = React.useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  React.useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return { supported, listening, start, stop };
}
