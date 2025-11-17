import { FC, Fragment } from "react";
import {
	Box,
	Button,
	Skeleton,
	TextField
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { categoriesModel } from "@/app/models/categories-model";
import { pxToRem } from "@/shared/css-utils";
import {
	Controller,
	SubmitHandler,
	useForm
} from "react-hook-form";
import { schema } from "./model.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UpdateCategoryDto } from "@/app/models/categories-model/types.ts";
import { useToast } from "@/shared/hooks";
import { useNavigate } from "react-router-dom";

type Props = {
	categoryId: number;
};

export const EditCategory: FC<Props> = ({ categoryId }) => {
	const navigate = useNavigate();
	const toast = useToast();
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema)
	});
	const { data, isLoading, isError } = useQuery({
		queryKey: [`category-${categoryId}-key`, categoryId],
		queryFn: () =>
			categoriesModel.getCategory(categoryId).then(res => {
				setValue("category_name", res.data.data.category.category_name);
				return res;
			})
	});
	const { mutate } = useMutation({
		mutationKey: [`update-category-${categoryId}-key`],
		mutationFn: (dto: UpdateCategoryDto) => categoriesModel.updateCategory(dto),
		onSuccess: async () => {
			navigate("/categories");
			toast.success("Category updated successfully");
		},
		onError: () => {
			toast.error("Failed to update category");
		}
	});

	if (isLoading) {
		return (
			<Fragment>
				<Skeleton
					variant='rectangular'
					width={400}
					height={56}
					sx={{
						borderRadius: "4px",
						marginBottom: pxToRem(20)
					}}
				/>
				<Skeleton
					variant='rectangular'
					width={66}
					height={36}
					sx={{
						borderRadius: "4px",
						marginBottom: pxToRem(20)
					}}
				/>
			</Fragment>
		);
	}

	if (isError) {
		return <div>Category not found!</div>;
	}

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = data => {
		const dto: UpdateCategoryDto = {
			categoryId: Number(categoryId),
			categoryName: data.category_name
		};
		mutate(dto);
	};

	return (
		<Box>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Box mb={pxToRem(20)} maxWidth={400}>
					<Controller
						name='category_name'
						control={control}
						defaultValue={data?.data.data.category.category_name || ""}
						render={({ field }) => (
							<TextField
								{...field}
								label='Category name'
								placeholder='tech_news'
								error={!!errors.category_name}
								helperText={
									errors.category_name?.message || "Lowercase, numbers, underscores only"
								}
								fullWidth
							/>
						)}
					/>
				</Box>
				<Button type='submit' variant='contained'>
					Save
				</Button>
			</form>
		</Box>
	);
};
