import { create } from "zustand";
import { ILanguage, INews } from "@/app/types";

type NewsStore = {
	languages: ILanguage[];
	setLanguages: (languages: ILanguage[]) => void;
	currentLanguageId: number;
	setCurrentLanguageId: (languageId: number) => void;
	news: INews;
	setNews: (news: INews) => void;
};

export const useNewsStore = create<NewsStore>(set => ({
	currentLanguageId: 1,
	setCurrentLanguageId: languageId => set({ currentLanguageId: languageId }),
	languages: [],
	setLanguages: languages => set({ languages }),
	news: {
		category_id: null,
		poster_link: null,
		province: null,
		city: null,
		translations: null
	},
	setNews: news => set({ news })
}));
