import { z } from "zod";

export const schema = z.object({
	title: z
		.string()
		.max(100, "Max 100 characters for title")
		.refine(
			value => value.trim().length === 0 || value.trim().length >= 5,
			"Min 5 characters for title"
		),
	description: z
		.string()
		.max(255, "Max 255 characters for description")
		.refine(
			value => value.trim().length === 0 || value.trim().length >= 5,
			"Min 5 characters for description"
		),
	content: z
		.string()
		.max(50000, "Max 50000 characters for content")
		.refine(
			value => value.trim().length === 0 || value.trim().length >= 5,
			"Min 5 characters for content"
		),
	adLink: z
		.string()
		.max(100, "Max 100 characters for ad link")
		.optional()
		.nullable()
});
