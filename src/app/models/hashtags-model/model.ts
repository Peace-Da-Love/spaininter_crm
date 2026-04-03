import { $api } from "@/app/api";
import {
	GetHashtagsResponse,
	CreateHashtagDto,
	IHashtagResponse,
	UpdateHashtagDto
} from "./types.ts";
import { IResponse } from "@/app/types";
import { AxiosResponse } from "axios";

class Model {
	public getHashtags = async () => {
		return $api.get<GetHashtagsResponse>("/hashtags");
	};

	public getHashtag = async (
		id: number
	): Promise<AxiosResponse<IHashtagResponse>> => {
		return $api.get("/hashtags/hashtag", {
			params: {
				id
			}
		});
	};

	public createHashtag = async (
		dto: CreateHashtagDto
	): Promise<IResponse> => {
		return $api.post("/hashtags/create", dto);
	};

	public deleteHashtag = async (hashtagId: number): Promise<IResponse> => {
		return $api.delete(`/hashtags/delete?id=${hashtagId}`);
	};

	public updateHashtag = async (
		dto: UpdateHashtagDto
	): Promise<IResponse> => {
		return $api.put("/hashtags/update", dto);
	};
}

export default new Model();
