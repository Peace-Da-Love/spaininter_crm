import { ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { themeOptions } from "./theme";
import { CssBaseline } from "@mui/material";

export const RootTheme = ({ children }: { children: ReactNode }) => {
	const theme = createTheme(themeOptions);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
};
