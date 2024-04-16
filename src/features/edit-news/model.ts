import { z } from "zod";

export const schema = z.object({
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
