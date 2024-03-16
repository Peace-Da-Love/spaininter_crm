import { Box, styled } from "@mui/material";

export const PageWrapper = styled(Box)(({ theme }) => ({
	minHeight: "100vh",
	background: theme.palette.background.default,
	position: "relative"
}));
