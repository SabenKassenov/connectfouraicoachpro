import type { Skin } from "./store";

export type SkinDef = {
  id: Skin;
  name: string;
  price: number;
  boardClass: string; // background of board cells
  frameClass: string; // outer frame
  player: string; // gradient class for player chip
  ai: string; // gradient class for ai chip
  glow: string; // hex/rgba for win glow
};

export const SKINS: SkinDef[] = [
  {
    id: "classic",
    name: "Classic",
    price: 0,
    boardClass: "bg-blue-600/90",
    frameClass: "bg-blue-700",
    player: "bg-gradient-to-br from-red-400 to-red-600",
    ai: "bg-gradient-to-br from-yellow-300 to-yellow-500",
    glow: "rgba(250, 204, 21, 0.9)",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    price: 150,
    boardClass: "bg-slate-900/90",
    frameClass: "bg-gradient-to-br from-fuchsia-700 to-cyan-700",
    player: "bg-gradient-to-br from-cyan-300 to-cyan-500 shadow-[0_0_18px_rgba(34,211,238,0.7)]",
    ai: "bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 shadow-[0_0_18px_rgba(217,70,239,0.7)]",
    glow: "rgba(34, 211, 238, 0.9)",
  },
  {
    id: "golden",
    name: "Golden Luxury",
    price: 300,
    boardClass: "bg-stone-800/90",
    frameClass: "bg-gradient-to-br from-amber-700 to-yellow-900",
    player: "bg-gradient-to-br from-amber-200 to-amber-500",
    ai: "bg-gradient-to-br from-yellow-400 to-yellow-700",
    glow: "rgba(251, 191, 36, 0.95)",
  },
  {
    id: "wooden",
    name: "Wooden Retro",
    price: 100,
    boardClass: "bg-amber-900/90",
    frameClass: "bg-gradient-to-br from-amber-800 to-amber-950",
    player: "bg-gradient-to-br from-red-500 to-red-800",
    ai: "bg-gradient-to-br from-stone-100 to-stone-300",
    glow: "rgba(251, 146, 60, 0.9)",
  },
  {
    id: "space",
    name: "Space Theme",
    price: 200,
    boardClass: "bg-indigo-950/90",
    frameClass: "bg-gradient-to-br from-indigo-900 to-black",
    player: "bg-gradient-to-br from-violet-400 to-violet-700",
    ai: "bg-gradient-to-br from-sky-300 to-sky-600",
    glow: "rgba(167, 139, 250, 0.9)",
  },
];

export function getSkin(id: Skin): SkinDef {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}
