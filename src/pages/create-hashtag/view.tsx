import { pxToRem } from "@/shared/css-utils";
import { HashtagForm } from "@/widgets/hashtag-form";
import { Typography } from "@mui/material";
import { LoadingLanguages } from "@/entites/loading-languages";
import { Loading } from "./loading.tsx";
import { Helmet } from "react-helmet-async";
import { Fragment } from "react";
import { Back } from "@/shared/ui/components/back";

export const CreateHashtagPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Create Hashtag</title>
			</Helmet>
			<section>
				<Back
					href={"/hashtags"}
					sx={{
						marginBottom: pxToRem(20)
					}}
				/>
				<Typography mb={pxToRem(20)} variant='h1'>
					Create hashtag
				</Typography>
				<LoadingLanguages loadingComponent={<Loading />}>
					<HashtagForm />
				</LoadingLanguages>
			</section>
		</Fragment>
	);
};
