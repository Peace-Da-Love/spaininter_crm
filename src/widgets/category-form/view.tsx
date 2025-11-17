import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { schema } from "./model.ts";
import {
	SubmitHandler,
	useForm
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoriesModel } from "@/app/models/categories-model";
import { useMutation } from "@tanstack/react-query";
import { CreateCategoryDto } from "@/app/models/categories-model/types.ts";
import { useToast } from "@/shared/hooks";
import { useNavigate } from "react-router-dom";

export const CategoryForm = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			category_name: ""
		}
	});
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

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = data => {
		mutate({
			category_name: data.category_name
		});
	};

	return (
		<Box>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Box mb='20px' maxWidth={400}>
					<TextField
						label='Category name (Latin letters, numbers, underscores)'
						placeholder='news_tech'
						{...register("category_name")}
						error={!!errors.category_name}
						helperText={
							errors.category_name?.message || "e.g., news_tech, sports, politics"
						}
						fullWidth
					/>
				</Box>
				<Button type='submit' disabled={isPending} variant='contained'>
					{isPending ? <CircularProgress size={24} /> : "Create category"}
				</Button>
			</form>
		</Box>
	);
};
