import { z } from "zod";

const newsFormSchema = z.object({
	language_id: z.number(),
	title: z
		.string()
		.nonempty("Title is required")
		.min(5, "Min 5 characters for title")
		.max(100, "Max 100 characters for title"),
	description: z
		.string()
		.nonempty("Description is required")
		.min(5, "Min 5 characters for description")
		.max(255, "Max 255 characters for description"),
	content: z
		.string()
		.nonempty("Content is required")
		.min(5, "Min 5 characters for content")
		.max(50000, "Max 50000 characters for content")
});

export const schema = z.object({
	telegramShortText: z
		.string()
		.nonempty("Telegram short text is required")
		.min(1)
		.max(100),
	currentLangId: z.number(),
	province: z
		.string()
		.nonempty("Province is required")
		.min(2, "Min 2 characters for province")
		.max(30, "Max 30 characters for province"),
	city: z
		.string()
		.nonempty("City is required")
		.min(2, "Min 2 characters for city")
		.max(30, "Max 30 characters for city"),
	category_id: z.string().nonempty("Category is required"),
	poster_link: z.string(),
	translations: z.array(newsFormSchema)
});
