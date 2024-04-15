import { IResponse } from "@/app/types";

export interface IGetNewsParams {
	languageCode: string;
	id: number;
}

interface NewsItem {
	news_id: number;
	views: number;
	poster_link: string;
	city: string;
	province: string;
	createdAt: string;
	newsTranslations: NewsTranslation[];
	category: {
		category_id: number;
		categoryTranslations: CategoryTranslation[];
	};
	updatedAt: string;
}

interface NewsTranslation {
	title: string;
	content: string;
	description: string;
	link: string;
}

interface CategoryTranslation {
	category_name: string;
}

export interface IGetNewsResponse extends IResponse {
	data: {
		news: NewsItem;
	};
}
