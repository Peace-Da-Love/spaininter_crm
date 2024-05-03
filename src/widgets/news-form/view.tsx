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
import { SelectCategory } from "@/features/select-category";
import { LanguageSelection } from "@/features/language-selection";
import { ImageDropZone } from "@/features/image-drop-zone";
import { useRef, useState } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { MarkdownEditor } from "@/features/markdown-editor";
import { useLanguagesStore } from "@/app/store";

export const NewsForm = () => {
	const navigate = useNavigate();
	const { languages } = useLanguagesStore();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setCurrentLang] = useState<string>("en");
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
		control,
		getValues
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			currentLangId: languages?.[0].language_id,
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

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = data => {
		if (data.translations.length !== languages?.length) {
			setError("translations", {
				type: "manual",
				message: "Please fill all translations"
			});
			return;
		}
		const editedData = {
			...data,
			add_link: data.ad_link ?? null,
			category_id: Number(data.category_id)
		};

		mutate(editedData);
	};

	return (
		<Box>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Box maxWidth={600}>
					<Controller
						control={control}
						name='category_id'
						defaultValue={""}
						render={({ field }) => (
							<SelectCategory
								{...field}
								error={!!errors?.category_id}
								helperText={errors?.category_id?.message}
							/>
						)}
					/>
					<Box display='flex' gap='10px' mb='20px'>
						<TextField
							{...register("city")}
							placeholder='City'
							defaultValue={""}
							error={!!errors?.city}
							helperText={errors?.city?.message}
							fullWidth
						/>
						<TextField
							{...register("province")}
							placeholder='Province'
							defaultValue={""}
							error={!!errors?.province}
							helperText={errors?.province?.message}
							fullWidth
						/>
					</Box>
					<Box mb='20px'>
						<TextField
							{...register("ad_link")}
							placeholder='Telegram ad link'
							defaultValue={""}
							error={!!errors?.ad_link}
							helperText={errors?.ad_link?.message}
							fullWidth
						/>
					</Box>
					<Box mb='20px'>
						<TextField
							{...register("telegramShortText")}
							placeholder='Telegram short text'
							defaultValue={""}
							minRows={3}
							multiline
							error={!!errors?.telegramShortText}
							helperText={errors?.telegramShortText?.message}
							fullWidth
						/>
					</Box>
					<Controller
						render={({ field: { onChange } }) => (
							<ImageDropZone
								handleImageLink={onChange}
								error={!!errors?.poster_link}
								message={errors?.poster_link?.message}
							/>
						)}
						name={"poster_link"}
						control={control}
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
