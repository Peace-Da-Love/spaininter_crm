export interface INews {
	category_id?: number;
	category_name?: string;
	poster_link: string;
	province: string;
	city: string;
	ad_link?: string | null;
	translations: INewsTranslations[];
}

interface INewsTranslations {
	language_id: number;
	title: string;
	description: string;
	content: string;
	link?: string;
}
