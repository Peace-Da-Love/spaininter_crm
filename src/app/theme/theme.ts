import { ThemeOptions } from "@mui/material";

declare module "@mui/material/styles" {
	interface BreakpointOverrides {
		xs: true;
		sm: true;
		md: true;
		lg: true;
		xl: true;
		desktop_2k: true;
		desktop: true;
	}
}

declare module "@mui/material/styles" {}

export const themeOptions: ThemeOptions = {
	typography: {
		fontFamily: '"Roboto", sans-serif',
		fontSize: 14,
		h1: {
			fontSize: "2rem",
			fontWeight: 700
		},
		h2: {
			fontSize: "1.5rem",
			fontWeight: 700
		}
	},
	palette: {
		text: {
			primary: "#434C6F",
			secondary: "#B9B9B9"
		},
		background: {
			default: "#F6F6FB",
			paper: "#FFFFFF"
		}
	},
	breakpoints: {
		values: {
			// Custom
			desktop_2k: 2560,
			desktop: 1980,

			// Default
			xs: 0,
			sm: 600,
			md: 900,
			lg: 1200,
			xl: 1536
		}
	}
};
