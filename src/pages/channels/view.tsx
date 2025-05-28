import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { pxToRem } from "@/shared/css-utils";
import { Box, Typography } from "@mui/material";
import { AddCity } from "@/features/add-city";
import { CitiesTable } from "@/widgets/cities-table";

export const ChannelsPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Channels</title>
			</Helmet>
			<section>
				<Typography variant='h1' mb={pxToRem(20)}>
					Cities
				</Typography>
				<Box sx={{ textAlign: "right", marginBottom: pxToRem(20) }}>
					<AddCity />
				</Box>
				<CitiesTable />
			</section>
		</Fragment>
	);
};
