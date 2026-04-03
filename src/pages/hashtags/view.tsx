import { pxToRem } from "@/shared/css-utils";
import { Box, Button, Typography } from "@mui/material";
import { HashtagsTable } from "@/widgets/hashtags-table";
import { Link as RouterLink } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { Helmet } from "react-helmet-async";
import { Fragment } from "react";

export const HashtagsPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Hashtags</title>
			</Helmet>
			<section>
				<Typography variant='h1' mb={pxToRem(20)}>
					Hashtags
				</Typography>
				<Box sx={{ textAlign: "right", marginBottom: pxToRem(20) }}>
					<Button
						component={RouterLink}
						sx={{
							display: "inline-flex",
							gap: pxToRem(6),
							textDecoration: "none"
						}}
						variant={"contained"}
						to='/create-hashtag'
					>
						Create Hashtag
						<AddIcon />
					</Button>
				</Box>
				<HashtagsTable />
			</section>
		</Fragment>
	);
};
