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
				status: "pending" | "approved" | "rejected";
				user_id: number | null;
				admin_id: number | null;
				newsTranslations: [
					{
						title: string;
						link: string;
						language_id: number;
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
