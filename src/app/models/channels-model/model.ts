import { $api } from "@/app/api";
import { AxiosResponse } from "axios";
import { IResponse } from "@/app/types";
import { AddChannelDto, IGetChannelsResponse } from "./types.ts";

class Model {
	public async create(dto: AddChannelDto): Promise<AxiosResponse<IResponse>> {
		return $api.post(`/channels`, dto);
	}

	public async delete(id: number): Promise<AxiosResponse<IResponse>> {
		return $api.delete(`/channels`, {
			params: { id }
		});
	}

	public async get(): Promise<AxiosResponse<IGetChannelsResponse>> {
		return $api.get(`/channels`);
	}
}

export default new Model();
