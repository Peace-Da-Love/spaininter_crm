import { $api } from "@/app/api";
import { GetCategoriesResponse, CreateCategoryDto } from "./types.ts";
import { IResponse } from "@/app/types";

class Model {
	public getCategories = async () => {
		return $api.get<GetCategoriesResponse>("/categories");
	};

	public createCategory = async (
		dto: CreateCategoryDto
	): Promise<IResponse> => {
		return $api.post("/categories/create", dto);
	};

	public deleteCategory = async (categoryId: number): Promise<IResponse> => {
		return $api.delete(`/categories/delete?id=${categoryId}`);
	};
}

export default new Model();
