import { INews, IResponse } from "@/app/types";
import { $api } from "@/app/api";
import { IGetNewsParams, IGetNewsResponse, UpdateNewsDto } from "./types.ts";
import { AxiosResponse } from "axios";

class Model {
	public async create(dto: INews): Promise<AxiosResponse<IResponse>> {
		return $api.post("/news/create", dto);
	}

	public async getById(
		params: IGetNewsParams
	): Promise<AxiosResponse<IGetNewsResponse>> {
		return $api.get(`/news/admin/${params.id}`, {
			headers: {
				"accept-language": params.languageCode
			}
		});
	}

	public async update(dto: UpdateNewsDto): Promise<AxiosResponse<IResponse>> {
		return $api.put("/news/update", dto);
	}
}

export default new Model();
