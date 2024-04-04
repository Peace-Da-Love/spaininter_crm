import { z } from "zod";

const categoryTranslationsSchema = z.object({
	language_id: z.number(),
	category_name: z.string().min(3).max(50)
});

export const schema = z.object({
	currentLangId: z.number(),
	translations: z.array(categoryTranslationsSchema)
});
