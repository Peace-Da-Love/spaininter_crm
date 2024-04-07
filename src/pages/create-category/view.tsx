import { pxToRem } from "@/shared/css-utils";
import { CategoryForm } from "@/widgets/category-form";
import { Typography } from "@mui/material";
import { LoadingLanguages } from "@/entites/loading-languages";
import { Loading } from "./loading.tsx";
import { Helmet } from "react-helmet-async";
import { Fragment } from "react";

export const CreateCategoryPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Create Category</title>
			</Helmet>
			<section>
				<Typography mb={pxToRem(20)} variant='h1'>
					Create category
				</Typography>
				<LoadingLanguages loadingComponent={<Loading />}>
					<CategoryForm />
				</LoadingLanguages>
			</section>
		</Fragment>
	);
};
