import { FC, Fragment } from "react";
import {
	Box,
	Button,
	Skeleton,
	TextField,
	ToggleButton,
	ToggleButtonGroup
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { categoriesModel } from "@/app/models/categories-model";
import { pxToRem } from "@/shared/css-utils";
import {
	Controller,
	SubmitHandler,
	useFieldArray,
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
		watch,
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
				setValue(
					"translations",
					res.data.data.category.translations.map(value => {
						return {
							categoryName: value.categoryName,
							languageId: value.languageId
						};
					})
				);
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
	const languageId =
		watch("languageId") || data?.data.data.category.translations[0].languageId;

	const { fields } = useFieldArray({
		name: "translations",
		control
	});

	if (isLoading) {
		return (
			<Fragment>
				<Skeleton
					variant='rectangular'
					width={400}
					height={48}
					sx={{
						borderRadius: "4px",
						marginBottom: pxToRem(20)
					}}
				/>
				<Skeleton
					variant='rectangular'
					width={210}
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
		const dto = {
			categoryId: Number(categoryId),
			languageId: languageId as number,
			categoryName: data.translations.find(
				translation => translation.languageId === languageId
			)?.categoryName as string
		};
		mutate(dto);
	};

	return (
		<Box>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Box mb={pxToRem(20)}>
					<Controller
						name='languageId'
						control={control}
						defaultValue={data?.data.data.category.translations[0].languageId}
						render={({ field }) => {
							return (
								<ToggleButtonGroup
									exclusive
									{...field}
									onChange={(
										_event: React.MouseEvent<HTMLElement>,
										newAlignment: number | null
									) => {
										if (newAlignment !== null) {
											field.onChange(newAlignment);
										}
									}}
									defaultValue={
										data?.data.data.category.translations[0].languageId
									}
								>
									{data?.data.data.category.translations?.map(value => {
										return (
											<ToggleButton
												key={value.languageId}
												value={value.languageId}
											>
												{value.languageCode}
											</ToggleButton>
										);
									})}
								</ToggleButtonGroup>
							);
						}}
					/>
				</Box>
				<Box mb={pxToRem(20)}>
					{fields.map((value, index) => {
						const langIndex = fields.findIndex(
							lang => lang.languageId === languageId
						);
						if (langIndex === index) {
							return (
								<Controller
									key={`${languageId}-${value.categoryName}`}
									name={`translations.${index}.categoryName`}
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											error={!!errors.translations?.[index]?.categoryName}
											helperText={
												errors.translations?.[index]?.categoryName?.message
											}
											sx={{
												textTransform: "capitalize"
											}}
										/>
									)}
								/>
							);
						}
					})}
				</Box>
				<Button type='submit' variant='contained'>
					Save
				</Button>
			</form>
		</Box>
	);
};
