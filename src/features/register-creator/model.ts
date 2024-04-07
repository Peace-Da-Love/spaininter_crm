import { z } from "zod";

export const schema = z.object({
	tg_id: z
		.string()
		.nonempty("Admin ID is required")
		.regex(/^\d+$/)
		.min(5, "Min 5 characters for Admin ID")
		.max(15, "Max 15 characters for Admin ID")
		.transform(Number)
});
