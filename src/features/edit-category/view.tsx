import { FC } from "react";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { categoriesModel } from "@/app/models/categories-model";

type Props = {
	categoryId: number;
};

export const EditCategory: FC<Props> = ({ categoryId }) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: [`category-${categoryId}-key`, categoryId],
		queryFn: () => categoriesModel.getCategory(categoryId)
	});

	if (isLoading) {
		return <div>Loading</div>;
	}

	if (isError) {
		return <div>Category not found!</div>;
	}

	return <Box>{data?.data.data.categoryName}</Box>;
};
