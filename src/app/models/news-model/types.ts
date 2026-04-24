import { IResponse } from "@/app/types";

export interface IGetNewsParams {
	languageCode: string;
	id: number;
}

interface NewsItem {
	newsId: number;
	posterLink: string;
	province?: string;
	city: string;
	title: string;
	description: string;
	content: string;
	link: string;
	hashtagId: number;
	hashtagName: string;
	hashtagLink: string;
	hashtags?: NewsHashtag[];
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

export type AdminNewsTranslation = {
	language_id: number;
	title: string;
	description: string;
	content: string;
};

export interface UpdateAdminNewsDto {
	hashtag_id?: number;
	hashtag_name?: string;
	hashtag_names?: string[];
	poster_link?: string;
	province?: string;
	city?: string;
	ad_link?: string | null;
	translations: AdminNewsTranslation[];
}

export type NewsHashtag = {
	hashtagId: number;
	hashtagName: string;
	hashtagLink: string;
};

export interface UpdateNewsStatusDto {
	status: "pending" | "approved" | "rejected";
}
