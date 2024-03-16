import { $api } from "@/app/api";

export type DeleteParams = {
	news_id: number;
};

export const deleteModel = async (params: DeleteParams) =>
	$api.delete(`/news/delete`, { params: { ...params } });
