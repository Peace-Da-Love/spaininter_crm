import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { pxToRem } from "@/shared/css-utils";
import { Link as RouterLink } from "react-router-dom";

export const CreateNews = () => {
	return (
		<Button
			component={RouterLink}
			sx={{
				display: "inline-flex",
				gap: pxToRem(6),
				textDecoration: "none"
			}}
			variant={"contained"}
			to='/create-news'
		>
			Create News
			<AddIcon />
		</Button>
	);
};
