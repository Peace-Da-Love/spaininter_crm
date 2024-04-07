import { $api } from "@/app/api";
import {
	GetCategoriesResponse,
	CreateCategoryDto,
	ICategoryResponse
} from "./types.ts";
import { IResponse } from "@/app/types";
import { AxiosResponse } from "axios";

class Model {
	public getCategories = async () => {
		return $api.get<GetCategoriesResponse>("/categories");
	};

	public getCategory = async (
		id: number
	): Promise<AxiosResponse<ICategoryResponse>> => {
		return $api.get("/categories/category", {
			params: {
				id
			}
		});
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
