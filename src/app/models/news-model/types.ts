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
	createdAt: string;
	updatedAt: string;
}

export interface IGetNewsResponse extends IResponse {
	data: {
		news: NewsItem;
	};
}

export interface UpdateNewsDto {
	newsId: number;
	languageId: number;
	title?: string | undefined;
	description?: string | undefined;
	content?: string | undefined;
}
