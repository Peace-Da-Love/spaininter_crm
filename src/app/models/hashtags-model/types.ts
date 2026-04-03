import { IResponse } from "@/app/types";

export interface GetHashtagsResponse extends IResponse {
	data: {
		hashtags: Hashtag[];
	};
}

export interface Hashtag {
	hashtag_id: number;
	hashtag_name: string;
	createdAt: string;
}

export interface CreateHashtagDto {
	hashtag_name: string;
}

export interface UpdateHashtagDto {
	hashtagId: number;
	hashtagName: string;
}

export interface IHashtagResponse extends IResponse {
	data: {
		hashtag: {
			hashtag_id: number;
			hashtag_name: string;
			createdAt: string;
		};
	};
}
