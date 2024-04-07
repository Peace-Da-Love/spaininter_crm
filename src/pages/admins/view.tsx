import { Box, Typography } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { AdminsTable } from "@/widgets/admins-table";
import { RegisterAdmin } from "@/features/register-admin";
import { Helmet } from "react-helmet-async";
import { Fragment } from "react";

export const AdminsPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Admins</title>
			</Helmet>
			<section>
				<Typography variant='h1' mb={pxToRem(20)}>
					Admins
				</Typography>
				<Box
					sx={{
						textAlign: "right",
						marginBottom: pxToRem(20)
					}}
				>
					<RegisterAdmin />
				</Box>
				<AdminsTable />
			</section>
		</Fragment>
	);
};
