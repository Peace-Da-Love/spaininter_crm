import { Box, Typography } from "@mui/material";
import { NewsTable } from "@/widgets/news-table";
import { pxToRem } from "@/shared/css-utils";
import { CreateNews } from "@/features/create-news";
import { Helmet } from "react-helmet-async";
import { Fragment } from "react";

export const NewsPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - News</title>
			</Helmet>
			<section>
				<Typography variant='h1' mb={pxToRem(20)}>
					News
				</Typography>
				<Box sx={{ textAlign: "right", marginBottom: pxToRem(20) }}>
					<CreateNews />
				</Box>
				<NewsTable />
			</section>
		</Fragment>
	);
};
