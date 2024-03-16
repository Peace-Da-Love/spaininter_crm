import { AuthFormStyles } from "./styles.ts";
import { Box, Typography } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import logo from "@/app/assets/images/logo.png";
import { LoginButton } from "@/features/login-button";

export const AuthForm = () => {
	return (
		<AuthFormStyles>
			<Box display='inline-block' mb={pxToRem(16)}>
				<img src={logo} alt='Spaininter Logo' width={40} height={40} />
			</Box>
			<Typography
				variant='h1'
				fontSize={pxToRem(32)}
				fontWeight={600}
				mb={pxToRem(10)}
			>
				Spaininter CRM
			</Typography>
			<Typography mb={pxToRem(20)} sx={{ "& >span": { fontWeight: "600" } }}>
				Click the button below to login <br /> with your <span>Telegram</span>{" "}
				account.
			</Typography>
			<LoginButton />
		</AuthFormStyles>
	);
};
