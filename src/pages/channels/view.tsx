import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { pxToRem } from "@/shared/css-utils";
import { Box, Typography } from "@mui/material";
import { AddChannel } from "@/features/add-channel";
import { ChannelsTable } from "@/widgets/channels-table";

export const ChannelsPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Channels</title>
			</Helmet>
			<section>
				<Typography variant='h1' mb={pxToRem(20)}>
					Channels
				</Typography>
				<Box textAlign='right' mb={pxToRem(20)}>
					<AddChannel />
				</Box>
				<ChannelsTable />
			</section>
		</Fragment>
	);
};
