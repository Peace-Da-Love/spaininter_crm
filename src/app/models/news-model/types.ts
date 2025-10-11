import { IResponse } from "@/app/types";

export interface IGetNewsParams {
	languageCode: string;
	id: number;
}

interface NewsItem {
	newsId: number;
	posterLink: string;
	city: string;
	title: string;
	description: string;
	content: string;
	link: string;
	categoryId: number;
	categoryName: string;
	categoryLink: string;
	views: number;
	adLink: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface IGetNewsResponse extends IResponse {
	data: {
		news: NewsItem;
	};
}

export interface UpdateNewsDto {
	languageId: number;
	title?: string | undefined;
	description?: string | undefined;
	content?: string | undefined;
	adLink?: string | null | undefined;
}
// For updating translations - only changed fields
export interface UpdateTranslationDto {
	languageId: number;
	title?: string;
	description?: string;
	content?: string;
	adLink?: string | null;
}
