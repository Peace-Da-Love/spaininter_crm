import { z } from "zod";

export const schema = z.object({
	channelId: z
		.string()
		.nonempty("Channel ID is required")
		.regex(/^\d+$/)
		.min(5, "Min 5 characters for channelId ID")
		.max(15, "Max 15 characters for channelId ID")
		.transform(Number)
});
