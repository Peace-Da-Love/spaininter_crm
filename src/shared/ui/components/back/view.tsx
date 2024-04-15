import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { FC } from "react";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";

interface BackProps {
	href: string;
	sx?: SxProps<Theme>;
}

export const Back: FC<BackProps> = ({ href, sx }) => {
	return (
		<Button
			startIcon={<ArrowBackIcon />}
			sx={{
				textTransform: "none",
				":hover": {
					backgroundColor: "transparent"
				},
				...sx
			}}
			to={href}
			component={RouterLink}
		>
			Back
		</Button>
	);
};
