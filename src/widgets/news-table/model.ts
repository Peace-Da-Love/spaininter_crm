import { IPaginationParams } from "@/app/types/IPaginationParams.ts";
import { $api } from "@/app/api";
import { IResponse } from "@/app/types";

interface INewsResponse extends IResponse {
	data: {
		count: number;
		rows: [
			{
				news_id: number;
				createdAt: string;
				views: number;
				newsTranslations: [
					{
						title: string;
						link: string;
					}
				];
			}
		];
	};
}

export const newsModel = (params: IPaginationParams) =>
	$api.get<INewsResponse>("/news/get-for-admin", {
		params: {
			...params
		}
	});
