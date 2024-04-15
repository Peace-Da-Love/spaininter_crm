import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { pxToRem } from "@/shared/css-utils";
import { Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { EditCategory } from "@/features/edit-category";
import { Back } from "@/shared/ui/components/back";

export const EditCategoryPage = () => {
	const { id } = useParams();

	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Edit Category {id}</title>
			</Helmet>

			<section>
				<Back
					href={"/categories"}
					sx={{
						marginBottom: pxToRem(20)
					}}
				/>
				<Typography variant='h1' mb={pxToRem(20)}>
					Edit Category - {id}
				</Typography>
				<EditCategory categoryId={id as unknown as number} />
			</section>
		</Fragment>
	);
};
