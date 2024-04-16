export interface INews {
	telegramShortText: string;
	category_id?: number | null;
	poster_link?: string | null;
	province?: string | null;
	city?: string | null;
	translations?: INewsTranslations[] | null;
}

interface INewsTranslations {
	language_id: number;
	title: string;
	description: string;
	content: string;
	link?: string;
}
