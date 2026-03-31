import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { pxToRem } from "@/shared/css-utils";
import { Back } from "@/shared/ui/components/back";
import { LoadingLanguages } from "@/entites/loading-languages";
import { ReviewNews } from "@/features/review-news";
import { Loading } from "./loading.tsx";

export const ReviewNewsPage = () => {
	const { id } = useParams();

	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Review News {id}</title>
			</Helmet>
			<section>
				<Back
					href={"/news"}
					sx={{
						marginBottom: pxToRem(20)
					}}
				/>
				<Typography variant='h1' mb={pxToRem(20)}>
					Review News - {id}
				</Typography>
				<LoadingLanguages loadingComponent={<Loading />}>
					<ReviewNews newsId={Number(id)} />
				</LoadingLanguages>
			</section>
		</Fragment>
	);
};
