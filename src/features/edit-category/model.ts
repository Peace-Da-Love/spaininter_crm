import { z } from "zod";

const categorySchema = z.object({
	categoryName: z.string().min(2).max(50),
	languageId: z.number()
});

export const schema = z.object({
	languageId: z.number(),
	translations: z.array(categorySchema)
});
