import { create } from "zustand";
import { ILanguage } from "@/app/types";

type LanguagesStore = {
	languages: ILanguage[];
	setLanguages: (languages: ILanguage[]) => void;
};

export const useLanguagesStore = create<LanguagesStore>(set => ({
	languages: [],
	setLanguages: (languages: ILanguage[]) => set({ languages })
}));
