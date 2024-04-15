import { INews, IResponse } from "@/app/types";
import { $api } from "@/app/api";
import { IGetNewsParams, IGetNewsResponse } from "./types.ts";
import { AxiosResponse } from "axios";

class Model {
	public async create(dto: INews): Promise<IResponse> {
		return $api.post("/news/create", dto);
	}

	public async getById(
		params: IGetNewsParams
	): Promise<AxiosResponse<IGetNewsResponse>> {
		return $api.get(`/news/`, {
			params
		});
	}
}

export default new Model();
