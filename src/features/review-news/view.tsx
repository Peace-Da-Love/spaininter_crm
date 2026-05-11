import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
	Radio,
	RadioGroup,
	TextField,
	Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
	Controller,
	SubmitHandler,
	useFieldArray,
	useForm,
	useWatch
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { newsModel } from "@/app/models/news-model";
import { useLanguagesStore } from "@/app/store";
import { useToast } from "@/shared/hooks";
import { HashtagAutocomplete } from "@/features/hashtag-autocomplete";
import { SelectCity } from "@/features/select-city";
import { LanguageSelection } from "@/features/language-selection";
import { ImageDropZone } from "@/features/image-drop-zone";
import { MarkdownEditor } from "@/features/markdown-editor";
import { TelegramLink } from "@/features/edit-news/ui/telegram-link";
import { imageModel, IImageDto } from "@/app/models/image-model";
import { pxToRem } from "@/shared/css-utils";

type Props = {
	newsId: number;
};

const reviewNewsFormSchema = z
	.object({
		currentLangId: z.number(),
		province: z.string().optional().nullable(),
		city: z.string().optional().nullable(),
		ad_link: z
			.string()
			.max(100, "Max 100 characters for ad link")
			.optional()
			.nullable(),
		hashtag_names: z
			.array(
				z
					.string()
					.transform(val => val.trim().toLowerCase().replace(/\s+/g, "_"))
					.refine(val => /^[a-z0-9_]{2,50}$/.test(val), "Invalid hashtag")
			)
			.min(1, "At least one hashtag is required"),
		poster_link: z.string().min(1, "Poster image is required"),
		translations: z.array(
			z.object({
				language_id: z.number(),
				title: z
					.string()
					.max(100, "Max 100 characters for title")
					.optional()
					.nullable(),
				description: z
					.string()
					.max(255, "Max 255 characters for description")
					.optional()
					.nullable(),
				content: z
					.string()
					.max(50000, "Max 50000 characters for content")
					.optional()
					.nullable()
			})
		)
	})
	.superRefine((data, ctx) => {
		const hasText = (value?: string | null) =>
			typeof value === "string" && value.trim().length > 0;
		const getText = (value?: string | null) =>
			typeof value === "string" ? value.trim() : "";

		let completeTranslations = 0;

		data.translations.forEach((translation, index) => {
			const title = getText(translation.title);
			const description = getText(translation.description);
			const content = getText(translation.content);

			const filledCount = [title, description, content].filter(Boolean).length;
			if (filledCount === 0) return;

			if (filledCount < 3) {
				if (!hasText(title)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Title is required",
						path: ["translations", index, "title"]
					});
				}
				if (!hasText(description)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Description is required",
						path: ["translations", index, "description"]
					});
				}
				if (!hasText(content)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "Content is required",
						path: ["translations", index, "content"]
					});
				}
				return;
			}

			if (title.length < 5) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Min 5 characters for title",
					path: ["translations", index, "title"]
				});
			}
			if (description.length < 5) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Min 5 characters for description",
					path: ["translations", index, "description"]
				});
			}
			if (content.length < 5) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Min 5 characters for content",
					path: ["translations", index, "content"]
				});
			}

			completeTranslations += 1;
		});

		if (completeTranslations === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "At least one complete translation is required",
				path: ["translations"]
			});
		}
	});

type FormValues = z.infer<typeof reviewNewsFormSchema>;

export const ReviewNews: FC<Props> = ({ newsId }) => {
	const toast = useToast();
	const navigate = useNavigate();
	const { languages } = useLanguagesStore();
	const mdxEditorRef = useRef<MDXEditorMethods>(null);
	const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
	const [posterLink, setPosterLink] = useState<string>("");
	const [isSaving, setIsSaving] = useState(false);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [isTranslating, setIsTranslating] = useState(false);
	const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
	const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false);
	const [selectedSourceLangId, setSelectedSourceLangId] = useState<
		number | null
	>(null);
	const [missingLocales, setMissingLocales] = useState<string[]>([]);

	const {
		handleSubmit,
		register,
		control,
		setValue,
		getValues,
		reset,
		watch,
		trigger,
		formState: { errors, isDirty }
	} = useForm<FormValues>({
		resolver: zodResolver(reviewNewsFormSchema),
		defaultValues: {
			currentLangId: languages?.[0]?.language_id,
			hashtag_names: [],
			poster_link: "",
			province: "",
			city: "",
			ad_link: null,
			translations: []
		}
	});

	const { fields, replace } = useFieldArray({
		name: "translations",
		control
	});

	const currentLangId = watch("currentLangId");
	const translations = useWatch({ control, name: "translations" });

	const { isLoading, isError } = useQuery({
		queryKey: [
			"review-news",
			newsId,
			{ languages: languages.map(l => l.language_code) }
		],
		queryFn: async () => {
			const results = await Promise.all(
				languages.map(lang =>
					newsModel.getById({
						id: newsId,
						languageCode: lang.language_code
					})
				)
			);

			const translations = languages.map((lang, index) => {
				const news = results[index]?.data?.data?.news;
				return {
					language_id: lang.language_id,
					title: news?.title ?? "",
					description: news?.description ?? "",
					content: (news?.content ?? "")
						.replace(/\\n/g, "\n\n")
						.replace(/\\|/g, "")
				};
			});

			const firstNews = results[0]?.data?.data?.news;

			setPosterLink(firstNews?.posterLink ?? "");
			const hashtagNames =
				firstNews?.hashtags?.map(hashtag => hashtag.hashtagName) ??
				(firstNews?.hashtagName ? [firstNews.hashtagName] : []);

			replace(translations);
			reset({
				currentLangId: languages[0]?.language_id,
				hashtag_names: hashtagNames,
				poster_link: firstNews?.posterLink ?? "",
				province: firstNews?.province ?? "",
				city: firstNews?.city ?? "",
				ad_link: firstNews?.adLink ?? null,
				translations
			});

			if (mdxEditorRef.current && translations[0]) {
				mdxEditorRef.current.setMarkdown(translations[0].content);
			}

			return translations;
		},
		enabled: languages.length > 0
	});

	useEffect(() => {
		const langIndex = languages.findIndex(
			lang => lang.language_id === currentLangId
		);
		const current =
			langIndex >= 0 ? getValues(`translations.${langIndex}.content`) : "";
		if (mdxEditorRef.current) {
			mdxEditorRef.current.setMarkdown(current ?? "");
		}
	}, [currentLangId, getValues, languages]);

	const applyUpdate = async (data: FormValues, showToast = true) => {
		setIsSaving(true);
		try {
			const isCompleteTranslation = (translation: {
				title?: string | null;
				description?: string | null;
				content?: string | null;
			}) => {
				const title =
					typeof translation.title === "string" ? translation.title.trim() : "";
				const description =
					typeof translation.description === "string"
						? translation.description.trim()
						: "";
				const content =
					typeof translation.content === "string"
						? translation.content.trim()
						: "";
				return title && description && content;
			};

			const preparedTranslations = data.translations
				.filter(isCompleteTranslation)
				.map(t => ({
					language_id: t.language_id,
					title: (t.title ?? "").trim(),
					description: (t.description ?? "").trim(),
					content: (t.content ?? "").trim()
				}));

			if (preparedTranslations.length === 0) {
				toast.error("Add at least one complete translation");
				setIsSaving(false);
				return;
			}

			let posterUrl = posterLink;
			if (selectedPhotoFile) {
				const formData = new FormData() as IImageDto;
				formData.append("file", selectedPhotoFile);
				const {
					data: { url }
				} = await imageModel(formData);
				posterUrl = url;
			}

			const payload = {
				hashtag_names: data.hashtag_names,
				poster_link: posterUrl,
				province: data.province ?? undefined,
				city: data.city ?? undefined,
				ad_link: data.ad_link ?? null,
				translations: preparedTranslations
			};

			await newsModel.updateByAdmin(newsId, payload);

			setPosterLink(posterUrl);
			setSelectedPhotoFile(null);
			reset({
				...data,
				poster_link: posterUrl
			});
			replace(data.translations);

			if (showToast) toast.success("News updated successfully");
		} catch (error) {
			toast.error("Failed to update news");
			throw error;
		} finally {
			setIsSaving(false);
		}
	};

	const onSubmit: SubmitHandler<FormValues> = async data => {
		await applyUpdate(data);
	};

	const updateStatus = async (status: "approved" | "rejected") => {
		setIsUpdatingStatus(true);
		try {
			await newsModel.updateStatus(newsId, { status });
			toast.success(status === "approved" ? "News approved" : "News rejected");
			navigate("/news");
		} catch (error) {
			toast.error("Failed to update status");
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const hasChanges = isDirty || selectedPhotoFile !== null;

	const getMissingLocales = (data: FormValues) => {
		const emptyLanguageIds = data.translations
			.filter(translation => {
				const title = (translation.title ?? "").trim();
				const description = (translation.description ?? "").trim();
				const content = (translation.content ?? "").trim();
				return !title && !description && !content;
			})
			.map(translation => translation.language_id);

		return emptyLanguageIds
			.map(languageId => {
				const language = languages.find(
					lang => lang.language_id === languageId
				);
				return language?.language_code ?? String(languageId);
			})
			.filter(Boolean);
	};

	const performApprove = async (data: FormValues) => {
		if (hasChanges) {
			await applyUpdate(data, false);
		}
		await updateStatus("approved");
	};

	const handleApprove = async () => {
		const isValid = await trigger();
		if (!isValid) {
			toast.error("Please fix validation errors before approving");
			return;
		}

		const data = getValues() as FormValues;
		const missing = getMissingLocales(data);
		if (missing.length > 0) {
			setMissingLocales(missing);
			setIsApproveConfirmOpen(true);
			return;
		}

		await performApprove(data);
	};

	const handleReject = async () => {
		await updateStatus("rejected");
	};

	const handleApproveConfirm = async () => {
		setIsApproveConfirmOpen(false);
		setMissingLocales([]);
		await performApprove(getValues() as FormValues);
	};

	const handleApproveCancel = () => {
		setIsApproveConfirmOpen(false);
		setMissingLocales([]);
	};

	const currentLangIndex = useMemo(
		() => languages.findIndex(lang => lang.language_id === currentLangId),
		[currentLangId, languages]
	);

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

	const missingLocalesText = missingLocales.join(", ");

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
		const data = getValues() as FormValues;
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
		const data = getValues() as FormValues;
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
			const response = await newsModel.translateMissingByAdmin(newsId, {
				source: {
					language_id: sourceLanguage.language_id,
					language_code: sourceLanguage.language_code,
					title: (sourceTranslation.title ?? "").trim(),
					description: (sourceTranslation.description ?? "").trim(),
					content: (sourceTranslation.content ?? "").trim()
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

	if (isLoading) return <CircularProgress />;
	if (isError) return <div>Error...</div>;

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
								render={({ field }) => (
									<SelectCity
										value={field.value ?? ""}
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
							render={({ field }) => (
								<TelegramLink value={field.value} onChange={field.onChange} />
							)}
						/>
					</Box>

					<Box mb={pxToRem(12)}>
						<Typography variant='body2' color='text.secondary' mb={pxToRem(8)}>
							Poster preview
						</Typography>
						{selectedPhotoFile ? (
							<img
								src={URL.createObjectURL(selectedPhotoFile)}
								alt='Selected poster preview'
								style={{
									width: "300px",
									height: "200px",
									objectFit: "cover",
									borderRadius: "8px",
									border: "2px solid #4caf50"
								}}
							/>
						) : posterLink ? (
							<img
								src={posterLink}
								alt='News poster'
								style={{
									width: "300px",
									height: "200px",
									objectFit: "cover",
									borderRadius: "8px",
									border: "1px solid #ddd"
								}}
							/>
						) : (
							<Typography color='text.secondary'>No poster</Typography>
						)}
					</Box>

					<ImageDropZone
						onFileSelect={file => {
							setSelectedPhotoFile(file);
							if (file) {
								setValue("poster_link", file.name);
							} else {
								setValue("poster_link", posterLink);
							}
						}}
						error={!!errors?.poster_link}
						message={errors?.poster_link?.message}
					/>

					<Controller
						render={({ field: { value, onChange } }) => (
							<LanguageSelection
								value={value}
								onChange={value => onChange(value)}
								statusByLanguageId={languageStatuses}
							/>
						)}
						name={`currentLangId`}
						control={control}
					/>
				</Box>

				{fields.map((field, index) => {
					if (index === currentLangIndex) {
						return (
							<Box key={field.id} mb='20px'>
								<Box mb='20px' maxWidth={600}>
									<Controller
										control={control}
										name={`translations.${index}.title`}
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
										render={({ field: { onChange, value } }) => (
											<MarkdownEditor
												ref={mdxEditorRef}
												onChange={value => {
													onChange(mdxEditorRef.current?.getMarkdown() ?? "");
													mdxEditorRef.current?.setMarkdown(value);
												}}
												value={value ?? ""}
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

				<Box display='flex' gap={pxToRem(12)}>
					<Button
						disabled={isSaving || isUpdatingStatus || isTranslating}
						variant='outlined'
						onClick={handleOpenTranslateDialog}
					>
						{isTranslating ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							"AI translate missing"
						)}
					</Button>
					<Button
						type='submit'
						disabled={isSaving || isUpdatingStatus || isTranslating}
						variant='contained'
					>
						{isSaving ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							"Save changes"
						)}
					</Button>
					<Button
						disabled={isSaving || isUpdatingStatus || isTranslating}
						variant='outlined'
						color='success'
						onClick={handleApprove}
					>
						{isUpdatingStatus ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							"Post"
						)}
					</Button>
					<Button
						disabled={isSaving || isUpdatingStatus || isTranslating}
						variant='outlined'
						color='error'
						onClick={handleReject}
					>
						{isUpdatingStatus ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							"Reject"
						)}
					</Button>
				</Box>
			</form>
			<Dialog open={isApproveConfirmOpen} onClose={handleApproveCancel}>
				<DialogTitle>Подтвердите публикацию</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Вы уверены что хотите опубликовать новость без следующих переводов:{" "}
						{missingLocalesText}? В этом случае новость не будет отображаться в
						каталоге новостей по соответствующим локалям.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleApproveCancel}>Отмена</Button>
					<Button
						variant='contained'
						color='success'
						onClick={handleApproveConfirm}
						disabled={isSaving || isUpdatingStatus}
					>
						Опубликовать
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				open={isTranslateDialogOpen}
				onClose={handleTranslateDialogClose}
			>
				<DialogTitle>Какой язык брать за основу?</DialogTitle>
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
						Отмена
					</Button>
					<Button
						variant='contained'
						onClick={handleTranslateMissing}
						disabled={!selectedSourceLangId || isTranslating}
					>
						{isTranslating ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							"Заполнить"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
