import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { Typography } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { UsersTable } from "@/widgets/users-table";

export const UsersPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Users</title>
			</Helmet>
			<section>
				<Typography variant='h1' mb={pxToRem(20)}>
					Users
				</Typography>
				<UsersTable />
			</section>
		</Fragment>
	);
};
