import { $api } from "@/app/api";
import { GetCategoriesResponse } from "@/app/models/categories-model/types.ts";

class Model {
	public getCategories = async () => {
		return $api.get<GetCategoriesResponse>("/categories");
	};
}

export default new Model();
