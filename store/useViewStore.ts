import { create } from "zustand";

type ViewStore = {
  multiViewState: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  setTargetLanguage: (target: string) => void;
  setSourceLanguage: (source: string) => void;
  setView: (isMulti: boolean) => void;
  reset: () => void;
};

export const useViewStore = create<ViewStore>((set) => ({
  multiViewState: true,
  sourceLanguage: "english",
  targetLanguage: "spanish",
  setView: (isMulti) => set(() => ({ multiViewState: isMulti })),
  setTargetLanguage: (target) => set(() => ({ targetLanguage: target })),
  setSourceLanguage: (source) => set(() => ({ sourceLanguage: source })),
  reset: () => set({ multiViewState: true }),
}));
