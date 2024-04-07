import { pxToRem } from "@/shared/css-utils";
import { Box, Button, Typography } from "@mui/material";
import { CategoriesTable } from "@/widgets/categories-table";
import { Link as RouterLink } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { Helmet } from "react-helmet-async";
import { Fragment } from "react";

export const CategoriesPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Categories</title>
			</Helmet>
			<section>
				<Typography variant='h1' mb={pxToRem(20)}>
					Categories
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
						to='/create-category'
					>
						Create Category
						<AddIcon />
					</Button>
				</Box>
				<CategoriesTable />
			</section>
		</Fragment>
	);
};
