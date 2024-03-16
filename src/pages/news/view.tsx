import { Box, Typography } from "@mui/material";
import { NewsTable } from "@/widgets/news-table";
import { pxToRem } from "@/shared/css-utils";
import { CreateNews } from "@/features/create-news";

export const NewsPage = () => {
	return (
		<section>
			<Typography variant='h1' mb={pxToRem(20)}>
				News
			</Typography>
			<Box sx={{ textAlign: "right", marginBottom: pxToRem(20) }}>
				<CreateNews />
			</Box>
			<NewsTable />
		</section>
	);
};
