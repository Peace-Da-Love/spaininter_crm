import { Link as RouterLink } from "react-router-dom";
import { Link } from "@mui/material";
import IcTelegram from "@/app/assets/icons/ic_telegram.svg?react";
import { pxToRem } from "@/shared/css-utils";

export const LoginButton = () => {
	const AUTH_URL = import.meta.env.VITE_AUTH_URL;
	return (
		<Link
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: pxToRem(10),
				background: "#F5F3F8",
				color: "#AFB6BE",
				textDecoration: "none",
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
		</Link>
	);
};
