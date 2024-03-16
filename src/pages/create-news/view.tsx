import { Typography } from "@mui/material";
import { NewsForm } from "@/widgets/news-form";
import { pxToRem } from "@/shared/css-utils";

export const CreateNewsPage = () => {
	return (
		<section>
			<Typography mb={pxToRem(20)} variant='h1'>
				Create news
			</Typography>
			<NewsForm />
		</section>
	);
};
