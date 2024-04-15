import { FC, Fragment, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { languageModel } from "@/app/models/language-model";
import { Typography } from "@mui/material";
import { useLanguagesStore } from "@/app/store";

type Props = {
	children?: ReactNode;
	loadingComponent: ReactNode;
};

export const LoadingLanguages: FC<Props> = ({ children, loadingComponent }) => {
	const { setLanguages } = useLanguagesStore();
	const { isLoading, isError, isFetching } = useQuery({
		queryKey: ["loading-languages-key"],
		queryFn: () =>
			languageModel().then(res => {
				setLanguages(res.data.data.languages);
				return res;
			})
	});
	const loadingCondition: boolean = isLoading || isFetching;

	if (isError) {
		return <Typography>Oops... Error</Typography>;
	}

	return <Fragment>{loadingCondition ? loadingComponent : children}</Fragment>;
};
