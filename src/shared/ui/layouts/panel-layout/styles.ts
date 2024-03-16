import { styled } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";

export const HeaderStyles = styled("header")(({ theme }) => ({
	width: "100%",
	padding: theme.spacing(2),
	background: theme.palette.background.paper,
	zIndex: 1000
}));

export const MainStyles = styled("main")(() => ({
	padding: `${pxToRem(50)} 0`
}));
