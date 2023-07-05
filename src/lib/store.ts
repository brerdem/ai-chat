import { create } from "zustand";

interface TextState {
  text: string;
  addText: (text: string) => void;
  clearText: () => void;
}

export const useTextStore = create<TextState>((set) => ({
  text: "",
  addText: (text: string) => set(() => ({ text })),
  clearText: () => set({ text: "" }),
}));
