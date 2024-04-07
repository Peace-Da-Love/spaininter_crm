import { pxToRem } from "@/shared/css-utils";
import { Box, Typography } from "@mui/material";
import { CreatorsTable } from "@/widgets/creators-table";
import { RegisterCreator } from "@/features/register-creator";
import { Helmet } from "react-helmet-async";
import { Fragment } from "react";

export const CreatorsPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Creators</title>
			</Helmet>
			<section>
				<Typography variant='h1' mb={pxToRem(20)}>
					Creators
				</Typography>
				<Box textAlign='right' mb={pxToRem(20)}>
					<RegisterCreator />
				</Box>
				<CreatorsTable />
			</section>
		</Fragment>
	);
};
