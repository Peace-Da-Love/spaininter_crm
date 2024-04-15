import { z } from "zod";

export const schema = z.object({
	title: z.string(),
	description: z
		.string()
		.nonempty("Description is required")
		.min(5, "Min 5 characters for description")
		.max(255, "Max 255 characters for description"),
	content: z.string()
});
