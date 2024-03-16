type CSSProperty = { [key: string]: string | number };

export const pxToRem = (px: number): string => {
	const oneRem = 16;
	const remValue = px / oneRem;
	return `${remValue}rem`;
};

export const percentToDecimal = (percent: number): number => {
	return percent / 100;
};

export const camelToKebabCase = (str: string): string => {
	return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
};

export const styleToString = (styles: CSSProperty): string => {
	return Object.keys(styles)
		.map(property => `${camelToKebabCase(property)}: ${styles[property]};`)
		.join(" ");
};

export const createMediaQuery = (
	breakpoint: string,
	styles: CSSProperty
): string => {
	return `@media (min-width: ${breakpoint}) { ${styleToString(styles)} }`;
};

export const mergeStyles = (...styles: CSSProperty[]): CSSProperty => {
	return Object.assign({}, ...styles);
};
