import { IResponse } from "@/app/types";

export interface GetCategoriesResponse extends IResponse {
	data: {
		categories: Category[];
	};
}

export interface Category {
	category_id: number;
	category_name: string;
	createdAt: string;
}

export interface CreateCategoryDto {
	category_name: string;
}

export interface UpdateCategoryDto {
	categoryId: number;
	categoryName: string;
}

export interface ICategoryResponse extends IResponse {
	data: {
		category: {
			category_id: number;
			category_name: string;
			createdAt: string;
		};
	};
}
