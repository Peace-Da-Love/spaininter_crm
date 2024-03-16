import { IResponse } from "@/app/types";

export interface GetCategoriesResponse extends IResponse {
	data: {
		categories: Category[];
	};
}

export interface Category {
	category_id: number;
	categoryTranslations: CategoryTranslation[];
}

export interface CategoryTranslation {
	category_name: string;
}
