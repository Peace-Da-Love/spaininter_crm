import { Link as RouterLink } from "react-router-dom";
import { Button } from "@mui/material";
import IcTelegram from "@/app/assets/icons/ic_telegram.svg?react";
import { pxToRem } from "@/shared/css-utils";

export const LoginButton = () => {
	const AUTH_URL = import.meta.env.VITE_AUTH_URL;
	return (
		<Button
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: pxToRem(10),
				background: "rgba(20,119,215,0.1)",
				color: "#151515",
				textDecoration: "none",
				textTransform: "none",
				padding: `${pxToRem(12)} ${pxToRem(40)}`,
				borderRadius: pxToRem(10),
				fontSize: pxToRem(16),
				fontWeight: 500
			}}
			to={AUTH_URL}
			target='_blank'
			component={RouterLink}
		>
			<IcTelegram /> Telegram
		</Button>
	);
};
