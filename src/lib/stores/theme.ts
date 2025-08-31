// src/lib/stores/theme.ts
import { writable } from "svelte/store";

export type Theme = "light" | "dark" | "cupcake"
  | "bumblebee"| "emerald" | "corporate"
  | "synthwave" | "retro" | "cyberpunk"
  | "valentine" | "halloween" | "garden"
  | "forest" | "aqua" | "lofi"
  | "pastel" | "fantasy" | "wireframe"
  | "black" | "luxury" | "dracula"
  | "cmyk" | "autumn" | "business"
  | "acid" | "lemonade" | "night"
  | "coffee" | "winter" | "dim"
  | "nord" | "sunset" | "caramellatte"
  | "abyss" | "silk" | "auto";
const defaultTheme: Theme = "auto";

// Detect system preference (only in browser)
function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

const resolveTheme = (theme: Theme): Exclude<Theme, "auto"> => {
  if (theme === "auto") {
    return systemPrefersDark() ? "dark" : "light";
  }
  return theme;
}

const storedTheme =
  typeof localStorage !== "undefined"
    ? (localStorage.getItem("theme") as Theme | null)
    : null;

export const theme = writable<Theme>(storedTheme || defaultTheme);

// Apply theme whenever it changes
theme.subscribe((value) => {
  if (typeof document !== "undefined") {
    const applied = resolveTheme(value);
    document.documentElement.setAttribute("data-theme", applied);
    localStorage.setItem("theme", value);
  }
});

// React to system changes if theme = auto
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (getStoredTheme() === "auto") {
        const applied = systemPrefersDark() ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", applied);
      }
    });
}

const getStoredTheme = (): Theme => {
  return (
    (typeof localStorage !== "undefined" &&
      (localStorage.getItem("theme") as Theme | null)) ||
    defaultTheme
  );
};
