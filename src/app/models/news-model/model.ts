import { INews, IResponse } from "@/app/types";
import { $api } from "@/app/api";

class Model {
	public async create(dto: INews): Promise<IResponse> {
		return $api.post("/news/create", dto);
	}
}

export default new Model();
