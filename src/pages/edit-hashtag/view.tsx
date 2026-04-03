import { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { pxToRem } from "@/shared/css-utils";
import { Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { EditHashtag } from "@/features/edit-hashtag";
import { Back } from "@/shared/ui/components/back";

export const EditHashtagPage = () => {
	const { id } = useParams();

	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Edit Hashtag {id}</title>
			</Helmet>

			<section>
				<Back
					href={"/hashtags"}
					sx={{
						marginBottom: pxToRem(20)
					}}
				/>
				<Typography variant='h1' mb={pxToRem(20)}>
					Edit Hashtag - {id}
				</Typography>
				<EditHashtag hashtagId={id as unknown as number} />
			</section>
		</Fragment>
	);
};
