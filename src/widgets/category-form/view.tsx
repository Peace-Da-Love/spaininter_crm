import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { useState } from "react";
import { LanguageSelection } from "@/features/language-selection";
import { schema } from "./model.ts";
import {
	Controller,
	SubmitHandler,
	useFieldArray,
	useForm
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoriesModel } from "@/app/models/categories-model";
import { useMutation } from "@tanstack/react-query";
import { CreateCategoryDto } from "@/app/models/categories-model/types.ts";
import { useToast } from "@/shared/hooks";
import { useNavigate } from "react-router-dom";
import { useLanguagesStore } from "@/app/store";

export const CategoryForm = () => {
	const { languages } = useLanguagesStore();
	const {
		register,
		handleSubmit,
		formState: { errors },
		getValues,
		reset,
		control
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			currentLangId: languages?.[0].language_id,
			translations: languages.map(item => ({
				language_id: item.language_id,
				category_name: ""
			}))
		}
	});
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setCurrentLang] = useState<string>("en");
	const toast = useToast();
	const navigate = useNavigate();
	const { mutate, isPending } = useMutation({
		mutationKey: ["create-category"],
		mutationFn: (dto: CreateCategoryDto) => categoriesModel.createCategory(dto),
		onSuccess: async () => {
			toast.success("Category created successfully");
			reset();
			navigate("/categories");
		},
		onError: () => {
			toast.error("Failed to create category");
		}
	});
	const { fields } = useFieldArray({
		name: "translations",
		control
	});

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = data => {
		mutate({
			translations: data.translations
		});
	};

	return (
		<Box>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Controller
					render={({ field: { value, onChange } }) => {
						return (
							<LanguageSelection
								value={value}
								onChange={value => {
									setCurrentLang(
										languages.find(lang => lang.language_id === value)
											?.language_code as string
									);
									onChange(value);
								}}
							/>
						);
					}}
					name={`currentLangId`}
					control={control}
				/>
				<Box mb='20px'>
					{fields.map((field, index) => {
						const langIndex = languages.findIndex(
							lang => lang.language_id === getValues().currentLangId
						);

						if (langIndex === index) {
							return (
								<TextField
									label='Category name'
									key={field.id}
									{...register(`translations.${index}.category_name`)}
									error={!!errors.translations?.[index]?.category_name}
									helperText={
										errors.translations?.[index]?.category_name?.message
									}
								/>
							);
						}
					})}
				</Box>
				<Button type='submit' disabled={isPending} variant='contained'>
					{isPending ? <CircularProgress size={24} /> : "Create category"}
				</Button>
			</form>
		</Box>
	);
};
