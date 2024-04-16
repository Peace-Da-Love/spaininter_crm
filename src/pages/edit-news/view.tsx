import { useParams } from "react-router-dom";
import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { Typography } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { EditNews } from "@/features/edit-news";
import { LoadingLanguages } from "@/entites/loading-languages";
import { Back } from "@/shared/ui/components/back";
import { Loading } from "./loading.tsx";

export const EditNewsPage = () => {
	const { id } = useParams();

	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Edit News {id}</title>
			</Helmet>
			<section>
				<Back
					href={"/news"}
					sx={{
						marginBottom: pxToRem(20)
					}}
				/>
				<Typography variant='h1' mb={pxToRem(20)}>
					Edit News - {id}
				</Typography>
				<LoadingLanguages loadingComponent={<Loading />}>
					<EditNews newsId={Number(id)} />
				</LoadingLanguages>
			</section>
		</Fragment>
	);
};
