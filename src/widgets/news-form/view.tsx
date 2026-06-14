import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Radio,
	RadioGroup,
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
	useForm,
	useWatch
} from "react-hook-form";
import { z } from "zod";
import { schema } from "./model.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { HashtagAutocomplete } from "@/features/hashtag-autocomplete";
import { SelectCity } from "@/features/select-city";
import { LanguageSelection } from "@/features/language-selection";
import { ImageDropZone } from "@/features/image-drop-zone";
import { useMemo, useRef, useState } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { MarkdownEditor } from "@/features/markdown-editor";
import { useLanguagesStore } from "@/app/store";
import { TelegramLink } from "@/features/edit-news/ui/telegram-link";
import { imageModel, IImageDto } from "@/app/models/image-model";

type FormValues = z.infer<typeof schema>;

export const NewsForm = () => {
	const navigate = useNavigate();
	const { languages } = useLanguagesStore();
	const [_, setCurrentLang] = useState<string>("en");
	const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
	const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false);
	const [isTranslating, setIsTranslating] = useState(false);
	const [selectedSourceLangId, setSelectedSourceLangId] = useState<
		number | null
	>(null);
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
		setValue,
		trigger
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			currentLangId: languages?.[0].language_id,
			hashtag_names: [],
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
	const translations = useWatch({ control, name: "translations" });
	const currentLangId = useWatch({ control, name: "currentLangId" });

	const languageStatuses = useMemo(() => {
		const map: Record<number, "complete" | "partial" | "empty"> = {};
		(translations ?? []).forEach(translation => {
			const title = (translation.title ?? "").trim();
			const description = (translation.description ?? "").trim();
			const content = (translation.content ?? "").trim();
			const filledCount = [title, description, content].filter(Boolean).length;
			if (filledCount === 0) {
				map[translation.language_id] = "empty";
			} else if (filledCount === 3) {
				map[translation.language_id] = "complete";
			} else {
				map[translation.language_id] = "partial";
			}
		});
		return map;
	}, [translations]);

	const currentLangIndex = useMemo(
		() => languages.findIndex(lang => lang.language_id === currentLangId),
		[currentLangId, languages]
	);

	const completeSourceLanguages = useMemo(() => {
		return languages.filter(language => {
			const translation = translations?.find(
				translation => translation.language_id === language.language_id
			);
			const title = (translation?.title ?? "").trim();
			const description = (translation?.description ?? "").trim();
			const content = (translation?.content ?? "").trim();
			return title && description && content;
		});
	}, [languages, translations]);

	const getMissingTranslationFields = (translation: {
		title?: string | null;
		description?: string | null;
		content?: string | null;
	}) => {
		const fields: Array<"title" | "description" | "content"> = [];
		if (!(translation.title ?? "").trim()) fields.push("title");
		if (!(translation.description ?? "").trim()) fields.push("description");
		if (!(translation.content ?? "").trim()) fields.push("content");
		return fields;
	};

	const getTranslationTargets = (data: FormValues, sourceLangId?: number) => {
		return data.translations
			.map(translation => {
				const language = languages.find(
					language => language.language_id === translation.language_id
				);
				return {
					language_id: translation.language_id,
					language_code: language?.language_code ?? "",
					fields: getMissingTranslationFields(translation)
				};
			})
			.filter(
				target =>
					target.language_id !== sourceLangId &&
					target.language_code &&
					target.fields.length > 0
			);
	};

	const hasMissingTranslations = useMemo(() => {
		return (translations ?? []).some(
			translation => getMissingTranslationFields(translation).length > 0
		);
	}, [translations]);

	const syncCurrentEditorContent = () => {
		if (currentLangIndex < 0) return;
		const markdown = mdxEditorRef.current?.getMarkdown();
		const currentValue = getValues(`translations.${currentLangIndex}.content`);
		if (typeof markdown === "string" && markdown !== (currentValue ?? "")) {
			setValue(`translations.${currentLangIndex}.content`, markdown, {
				shouldDirty: true
			});
		}
	};

	const handleOpenTranslateDialog = () => {
		syncCurrentEditorContent();
		const data = getValues();
		const sources = languages.filter(language => {
			const translation = data.translations.find(
				translation => translation.language_id === language.language_id
			);
			if (!translation) return false;
			return getMissingTranslationFields(translation).length === 0;
		});

		if (sources.length === 0) {
			toast.error("Add at least one complete translation first");
			return;
		}

		const targets = getTranslationTargets(data);
		if (targets.length === 0) {
			toast.success("There are no empty translation fields");
			return;
		}

		const currentIsComplete = sources.some(
			source => source.language_id === currentLangId
		);
		setSelectedSourceLangId(
			currentIsComplete ? currentLangId : sources[0].language_id
		);
		setIsTranslateDialogOpen(true);
	};

	const handleTranslateDialogClose = () => {
		if (isTranslating) return;
		setIsTranslateDialogOpen(false);
	};

	const handleTranslateMissing = async () => {
		if (!selectedSourceLangId) return;

		syncCurrentEditorContent();
		const data = getValues();
		const sourceLanguage = languages.find(
			language => language.language_id === selectedSourceLangId
		);
		const sourceTranslation = data.translations.find(
			translation => translation.language_id === selectedSourceLangId
		);

		if (!sourceLanguage || !sourceTranslation) {
			toast.error("Selected source language was not found");
			return;
		}

		if (getMissingTranslationFields(sourceTranslation).length > 0) {
			toast.error("Selected source language must be complete");
			return;
		}

		const targets = getTranslationTargets(data, selectedSourceLangId);
		if (targets.length === 0) {
			toast.success("There are no empty translation fields");
			setIsTranslateDialogOpen(false);
			return;
		}

		const fieldsByLanguageId = new Map(
			targets.map(target => [target.language_id, target.fields])
		);

		setIsTranslating(true);
		try {
			const response = await newsModel.translateMissingDraftByAdmin({
				source: {
					language_id: sourceLanguage.language_id,
					language_code: sourceLanguage.language_code,
					title: sourceTranslation.title.trim(),
					description: sourceTranslation.description.trim(),
					content: sourceTranslation.content.trim()
				},
				targets
			});

			response.data.data.translations.forEach(translation => {
				const index = data.translations.findIndex(
					item => item.language_id === translation.language_id
				);
				const fields = fieldsByLanguageId.get(translation.language_id);
				if (index < 0 || !fields) return;

				if (fields.includes("title")) {
					setValue(`translations.${index}.title`, translation.title, {
						shouldDirty: true,
						shouldValidate: true
					});
				}
				if (fields.includes("description")) {
					setValue(
						`translations.${index}.description`,
						translation.description,
						{
							shouldDirty: true,
							shouldValidate: true
						}
					);
				}
				if (fields.includes("content")) {
					setValue(`translations.${index}.content`, translation.content, {
						shouldDirty: true,
						shouldValidate: true
					});
					if (index === currentLangIndex) {
						mdxEditorRef.current?.setMarkdown(translation.content);
					}
				}
			});

			await trigger("translations");
			toast.success("Missing translations generated");
			setIsTranslateDialogOpen(false);
		} catch (error) {
			toast.error("Failed to generate translations");
		} finally {
			setIsTranslating(false);
		}
	};

	const onSubmit: SubmitHandler<FormValues> = async data => {
		syncCurrentEditorContent();

		if (data.translations.length !== languages?.length) {
			setError("translations", {
				type: "manual",
				message: "Please fill all translations"
			});
			return;
		}

		if (!selectedPhotoFile) {
			setError("poster_link", {
				type: "manual",
				message: "Poster image is required"
			});
			return;
		}

		try {
			const formData = new FormData() as IImageDto;
			formData.append("file", selectedPhotoFile);
			const {
				data: { url }
			} = await imageModel(formData);

			const editedData: INews = {
				hashtag_names: data.hashtag_names,
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
							name='hashtag_names'
							render={({ field }) => (
								<HashtagAutocomplete
									value={field.value}
									onChange={field.onChange}
									error={!!errors?.hashtag_names}
									helperText={errors?.hashtag_names?.message}
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
						onFileSelect={file => {
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
						render={({ field: { value, onChange } }) => (
							<LanguageSelection
								value={value}
								statusByLanguageId={languageStatuses}
								onChange={value => {
									setCurrentLang(
										languages.find(lang => lang.language_id === value)
											?.language_code as string
									);
									onChange(value);
								}}
							/>
						)}
						name={`currentLangId`}
						control={control}
					/>
				</Box>

				{fields.map((field, index) => {
					const langIndex = languages.findIndex(
						lang => lang.language_id === currentLangId
					);

					if (index !== langIndex) return null;

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
											helperText={errors.translations?.[index]?.title?.message}
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

				<Box display='flex' gap='12px'>
					{hasMissingTranslations && (
						<Button
							disabled={isPending || isTranslating}
							variant='outlined'
							onClick={handleOpenTranslateDialog}
						>
							{isTranslating ? (
								<CircularProgress size={24} color='inherit' />
							) : (
								"AI translate missing"
							)}
						</Button>
					)}
					<Button
						type='submit'
						disabled={isPending || isTranslating}
						variant='contained'
					>
						{isPending ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							"Create"
						)}
					</Button>
				</Box>
			</form>
			<Dialog open={isTranslateDialogOpen} onClose={handleTranslateDialogClose}>
				<DialogTitle>Which language should be used as the source?</DialogTitle>
				<DialogContent>
					<RadioGroup
						value={selectedSourceLangId ?? ""}
						onChange={event =>
							setSelectedSourceLangId(Number(event.target.value))
						}
					>
						{completeSourceLanguages.map(language => (
							<FormControlLabel
								key={language.language_id}
								value={language.language_id}
								control={<Radio />}
								label={language.language_code}
								disabled={isTranslating}
							/>
						))}
					</RadioGroup>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleTranslateDialogClose} disabled={isTranslating}>
						Cancel
					</Button>
					<Button
						variant='contained'
						onClick={handleTranslateMissing}
						disabled={!selectedSourceLangId || isTranslating}
					>
						{isTranslating ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							"Generate"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
