import { useNewsStore } from "@/app/store";
import { useState } from "react";

export interface IError {
	// eslint-disable-next-line
	[key: string]: any;
	city?: string;
	province?: string;
	category_id?: string;
	title?: string[];
	description?: string[];
	content?: string[];
	poster_link?: string;
}

export const useNewsValidation = () => {
	const { news, languages } = useNewsStore();
	const [errors, setErrors] = useState<IError>({});

	const validate = () => {
		const errors: IError = {};
		if (!news.category_id) {
			errors.category_id = "Category is required";
		}
		if (!news.translations) {
			return;
		}
		// check languages in translations
		languages.forEach(lang => {
			const translation = news.translations?.find(
				translation => translation.language_id === lang.language_id
			);
			if (
				translation?.title?.length === 0 ||
				news.translations?.length === 0 ||
				!translation
			) {
				errors.title
					? errors.title.push(`Title is required for ${lang.language_code} `)
					: (errors.title = [`Title is required for ${lang.language_code} `]);
			}
			if (
				translation?.description?.length === 0 ||
				news.translations?.length === 0 ||
				!translation
			) {
				errors.description
					? errors.description.push(
							`Description is required for ${lang.language_code} `
						)
					: (errors.description = [
							`Description is required for ${lang.language_code} `
						]);
			}
			if (
				translation?.content?.length === 0 ||
				news.translations?.length === 0 ||
				!translation
			) {
				errors.content
					? errors.content.push(
							`Content is required for ${lang.language_code} `
						)
					: (errors.content = [
							`Content is required for ${lang.language_code} `
						]);
			}
		});
		if (!news.city) {
			errors.city = "City is required";
		}
		if (!news.province) {
			errors.province = "Province is required";
		}
		if (!news.poster_link) {
			errors.poster_link = "Poster link is required";
		}
		setErrors(errors);
		return Object.keys(errors).length > 0;
	};

	return { validate, errors };
};
