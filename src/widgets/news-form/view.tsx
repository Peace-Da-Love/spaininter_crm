import {
	Box,
	Button,
	CircularProgress,
	TextField,
	Typography
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { INews } from "@/app/types";
import { newsModel } from "@/app/models/news-model";
import { useToast } from "@/shared/hooks";
import { useNavigate } from "react-router-dom";
import {
	Controller,
	SubmitHandler,
	useFieldArray,
	useForm
} from "react-hook-form";
import { z } from "zod";
import { schema } from "./model.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoryAutocomplete } from "@/features/category-autocomplete";
import { SelectCity } from "@/features/select-city";
import { LanguageSelection } from "@/features/language-selection";
import { ImageDropZone } from "@/features/image-drop-zone";
import { useRef, useState } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { MarkdownEditor } from "@/features/markdown-editor";
import { useLanguagesStore } from "@/app/store";
import { TelegramLink } from "@/features/edit-news/ui/telegram-link";
import { imageModel, IImageDto } from "@/app/models/image-model";

export const NewsForm = () => {
	const navigate = useNavigate();
	const { languages } = useLanguagesStore();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setCurrentLang] = useState<string>("en");
	const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
	const toast = useToast();
	const { mutate, isPending } = useMutation({
		mutationKey: ["create-news"],
		mutationFn: (dto: INews) => newsModel.create(dto),
		onSuccess: async () => {
			toast.success("News created successfully");
			navigate("/news");
		},
		onError: () => {
			toast.error("Failed to create news");
		}
	});
	const mdxEditorRef = useRef<MDXEditorMethods>(null);
	const {
		handleSubmit,
		register,
		formState: { errors },
		setError,
		clearErrors,
		control,
		getValues,
		setValue
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			currentLangId: languages?.[0].language_id,
			category_id: "",
			category_name: "",
			poster_link: "",
			translations: languages.map(lang => ({
				language_id: lang.language_id,
				title: "",
				description: "",
				content: ""
			}))
		}
	});
	const { fields } = useFieldArray({
		name: "translations",
		control
	});

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = async data => {
		if (data.translations.length !== languages?.length) {
			setError("translations", {
				type: "manual",
				message: "Please fill all translations"
			});
			return;
		}

		// Validate that photo is selected
		if (!selectedPhotoFile) {
			setError("poster_link", {
				type: "manual",
				message: "Poster image is required"
			});
			return;
		}

		try {
			// Upload photo first
			const formData = new FormData() as IImageDto;
			formData.append("file", selectedPhotoFile);
			const {
				data: { url }
			} = await imageModel(formData);

			const editedData: INews = {
				// Если это цифра - это category_id, иначе - новое имя категории
				...(data.category_name && /^\d+$/.test(data.category_name)
					? { category_id: Number(data.category_name) }
					: data.category_name && { category_name: data.category_name.toLowerCase() }),
				poster_link: url,
				province: data.province,
				city: data.city,
				ad_link: data.ad_link ?? null,
				translations: data.translations
			};

			mutate(editedData);
		} catch (error) {
			toast.error("Failed to upload image");
		}
	};
	
	if (!languages || languages.length === 0) {
		return <CircularProgress />; 
	  }

	return (
		<Box>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Box maxWidth={600}>
					<Box mb='20px'>
						<Controller
							control={control}
							name='category_name'
							render={({ field }) => (
								<CategoryAutocomplete
									value={field.value}
									onChange={(value) => {
										field.onChange(value);
										// Очищаем category_id если пользователь ввёл новую категорию
										if (value && !/^\d+$/.test(value)) {
											setValue("category_id", "");
										}
									}}
									error={!!errors?.category_id}
									helperText={errors?.category_id?.message}
								/>
							)}
						/>
					</Box>
					<Box display='flex' gap='10px' mb='20px'>
						<Box sx={{ flex: 1 }}>
							<Controller
								control={control}
								name='city'
								defaultValue={""}
								render={({ field }) => (
									<SelectCity
										value={field.value}
										onChange={field.onChange}
										error={!!errors?.city}
										helperText={errors?.city?.message}
									/>
								)}
							/>
						</Box>
						<Box sx={{ flex: 1 }}>
							<TextField
								{...register("province")}
								placeholder='Province'
								defaultValue={""}
								error={!!errors?.province}
								helperText={errors?.province?.message}
								fullWidth
							/>
						</Box>
					</Box>
					<Box mb='20px'>
						<Controller
							name={"ad_link"}
							control={control}
							defaultValue={null}
							render={({ field }) => (
								<TelegramLink value={field.value} onChange={field.onChange} />
							)}
						/>
					</Box>
					<ImageDropZone
						onFileSelect={(file) => {
							setSelectedPhotoFile(file);
							if (file) {
								setValue("poster_link", file.name);
								clearErrors("poster_link");
							} else {
								setValue("poster_link", "");
							}
						}}
						error={!!errors?.poster_link}
						message={errors?.poster_link?.message}
					/>
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
				</Box>

				{fields.map((field, index) => {
					const langIndex = languages.findIndex(
						lang => lang.language_id === getValues().currentLangId
					);

					if (index === langIndex) {
						return (
							<Box key={field.id} mb='20px'>
								<Box mb='20px' maxWidth={600}>
									<Controller
										control={control}
										name={`translations.${index}.title`}
										defaultValue={""}
										key={`translations.${index}.title`}
										render={({ field }) => (
											<TextField
												{...field}
												placeholder='Title'
												error={!!errors.translations?.[index]?.title}
												helperText={
													errors.translations?.[index]?.title?.message
												}
												fullWidth
											/>
										)}
									/>
								</Box>
								<Box mb='20px' maxWidth={600}>
									<Controller
										control={control}
										defaultValue={""}
										name={`translations.${index}.description`}
										key={`translations.${index}.description`}
										render={({ field }) => (
											<TextField
												{...field}
												minRows={3}
												multiline
												placeholder='Description'
												error={!!errors.translations?.[index]?.description}
												helperText={
													errors.translations?.[index]?.description?.message
												}
												fullWidth
											/>
										)}
									/>
								</Box>
								<Box maxWidth={900}>
									<Controller
										control={control}
										name={`translations.${index}.content`}
										key={`translations.${index}.content`}
										defaultValue={""}
										render={({ field: { onChange, value } }) => (
											<MarkdownEditor
												ref={mdxEditorRef}
												onChange={value => {
													onChange(mdxEditorRef.current?.getMarkdown() ?? "");
													mdxEditorRef.current?.setMarkdown(value);
												}}
												value={value}
												error={!!errors.translations?.[index]?.content}
												helperText={
													errors.translations?.[index]?.content?.message
												}
											/>
										)}
									/>
								</Box>
							</Box>
						);
					}
				})}

				{!!errors.translations && (
					<Typography
						sx={{
							color: "#d32f2f",
							marginBottom: "20px"
						}}
					>
						{errors.translations?.message}
					</Typography>
				)}
				
				<Button type='submit' disabled={isPending} variant='contained'>
					{isPending ? (
						<CircularProgress size={24} color='inherit' />
					) : (
						"Create"
					)}
				</Button>
			</form>
		</Box>
	);
};
