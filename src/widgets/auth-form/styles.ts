import { Box, styled } from "@mui/material";

export const AuthFormStyles = styled(Box)(({ theme }) => ({
	maxWidth: "450px",
	width: "100%",
	margin: "100px auto",
	background: theme.palette.background.paper,
	boxShadow: "rgb(205 203 203) 10px 10px 50px 0px",
	padding: theme.spacing(4),
	borderRadius: theme.spacing(2),
	textAlign: "center"
}));
