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
	translations: {
		language_id: number;
		category_name: string;
	}[];
}

export interface UpdateCategoryDto {
	categoryId: number;
	languageId: number;
	categoryName: string;
}

export interface ICategoryResponse extends IResponse {
	data: {
		category: {
			id: number;
			translations: {
				languageId: number;
				languageCode: string;
				categoryName: string;
			}[];
		};
	};
}
