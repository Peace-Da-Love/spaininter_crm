import { pxToRem } from "@/shared/css-utils";
import { CategoryForm } from "@/widgets/category-form";
import { Typography } from "@mui/material";
import { LoadingLanguages } from "@/entites/loading-languages";
import { Loading } from "./loading.tsx";

export const CreateCategoryPage = () => {
	return (
		<section>
			<Typography mb={pxToRem(20)} variant='h1'>
				Create category
			</Typography>
			<LoadingLanguages loadingComponent={<Loading />}>
				<CategoryForm />
			</LoadingLanguages>
		</section>
	);
};
