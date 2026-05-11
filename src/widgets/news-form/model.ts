import { z } from "zod";

const hashtagSchema = z
	.string()
	.transform(val => val.trim().toLowerCase().replace(/\s+/g, "_"))
	.refine(val => /^[a-z0-9_]{2,50}$/.test(val), "Invalid hashtag");

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
	ad_link: z
		.string()
		.max(100, "Max 100 characters for ad link")
		.optional()
		.nullable(),
	hashtag_names: z
		.array(hashtagSchema)
		.min(1, "At least one hashtag is required"),
	poster_link: z.string().min(1, "Poster image is required"),
	translations: z.array(newsFormSchema)
});
