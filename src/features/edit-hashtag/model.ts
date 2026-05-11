import { z } from "zod";

export const schema = z.object({
	hashtag_name: z
		.string()
		.transform(val => val.trim().toLowerCase().replace(/\s+/g, "_"))
		.pipe(
			z
				.string()
				.min(2, "Minimum 2 characters")
				.max(50, "Maximum 50 characters")
				.regex(
					/^[a-z0-9_]+$/,
					"Only lowercase letters, numbers, and underscores allowed"
				)
		)
});
