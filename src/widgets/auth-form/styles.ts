import { Box, styled } from "@mui/material";

export const AuthFormStyles = styled(Box)(({ theme }) => ({
	maxWidth: "450px",
	width: "100%",
	position: "absolute",
	top: "40%",
	left: "50%",
	transform: "translate(-40%, -50%)",
	background: theme.palette.background.paper,
	boxShadow: "rgb(205 203 203) 10px 10px 50px 0px",
	padding: theme.spacing(4),
	borderRadius: theme.spacing(2),
	textAlign: "center"
}));
