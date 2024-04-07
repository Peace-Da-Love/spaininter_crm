import { Typography } from "@mui/material";
import { NewsForm } from "@/widgets/news-form";
import { pxToRem } from "@/shared/css-utils";
import { LoadingLanguages } from "@/entites/loading-languages";
import { Loading } from "./loading.tsx";
import { Helmet } from "react-helmet-async";
import { Fragment } from "react";

export const CreateNewsPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Create News</title>
			</Helmet>
			<section>
				<Typography mb={pxToRem(20)} variant='h1'>
					Create news
				</Typography>
				<LoadingLanguages loadingComponent={<Loading />}>
					<NewsForm />
				</LoadingLanguages>
			</section>
		</Fragment>
	);
};
