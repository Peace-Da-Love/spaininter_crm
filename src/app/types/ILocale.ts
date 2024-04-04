export const locales = [
	"en",
	"ru",
	"es",
	"fr",
	"de",
	"sv",
	"no",
	"nl",
	"pl"
] as const;

export type Locale = (typeof locales)[number];
