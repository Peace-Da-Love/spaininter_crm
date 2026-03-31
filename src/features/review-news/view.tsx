import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
	Box,
	Button,
	CircularProgress,
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
import { CategoryAutocomplete } from "@/features/category-autocomplete";
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
		ad_link: z.string().max(100, "Max 100 characters for ad link").optional().nullable(),
		category_id: z.string().optional(),
		category_name: z
			.string()
		.nonempty("Category is required")
		.refine(
			val => {
				return /^\d+$/.test(val) || /^[a-z0-9_]{2,50}$/.test(val);
			},
			"Invalid category"
		),
	poster_link: z.string().min(1, "Poster image is required"),
		translations: z.array(
			z.object({
				language_id: z.number(),
				title: z.string().max(100, "Max 100 characters for title").optional().nullable(),
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
	const [originalCategoryId, setOriginalCategoryId] = useState<number | null>(null);
	const [originalCategoryName, setOriginalCategoryName] = useState<string>("");
	const [isSaving, setIsSaving] = useState(false);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
			category_id: "",
			category_name: "",
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
		queryKey: ["review-news", newsId, { languages: languages.map(l => l.language_code) }],
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
			setOriginalCategoryId(firstNews?.categoryId ?? null);
			setOriginalCategoryName(firstNews?.categoryName ?? "");

			replace(translations);
			reset({
				currentLangId: languages[0]?.language_id,
				category_id: firstNews?.categoryId ? String(firstNews.categoryId) : "",
				category_name: firstNews?.categoryName ?? "",
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
		const langIndex = languages.findIndex(lang => lang.language_id === currentLangId);
		const current =
			langIndex >= 0 ? getValues(`translations.${langIndex}.content`) : "";
		if (mdxEditorRef.current) {
			mdxEditorRef.current.setMarkdown(current ?? "");
		}
	}, [currentLangId, getValues, languages]);

	const normalizeCategoryName = (value: string) => value.trim().toLowerCase();

	const buildCategoryPayload = (value: string) => {
		const trimmed = value.trim();
		if (!trimmed) {
			return originalCategoryId ? { category_id: originalCategoryId } : {};
		}
		if (/^\d+$/.test(trimmed)) {
			return { category_id: Number(trimmed) };
		}
		const normalized = normalizeCategoryName(trimmed);
		const originalNormalized = normalizeCategoryName(originalCategoryName);
		if (originalNormalized && normalized === originalNormalized && originalCategoryId) {
			return { category_id: originalCategoryId };
		}
		return { category_name: normalized };
	};

	const applyUpdate = async (data: FormValues, showToast = true) => {
		setIsSaving(true);
		try {
			const isCompleteTranslation = (translation: {
				title?: string | null;
				description?: string | null;
				content?: string | null;
			}) => {
				const title = typeof translation.title === "string"
					? translation.title.trim()
					: "";
				const description = typeof translation.description === "string"
					? translation.description.trim()
					: "";
				const content = typeof translation.content === "string"
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
				...buildCategoryPayload(data.category_name),
				poster_link: posterUrl,
				province: data.province ?? undefined,
				city: data.city ?? undefined,
				ad_link: data.ad_link ?? null,
				translations: preparedTranslations
			};

			await newsModel.updateByAdmin(newsId, payload);

			setPosterLink(posterUrl);
			setSelectedPhotoFile(null);
			setOriginalCategoryName(data.category_name);
			if (payload.category_id) {
				setOriginalCategoryId(payload.category_id);
			}

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

	const updateStatus = async (status: "approved" | "deleted") => {
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

	const handleApprove = async () => {
		const isValid = await trigger();
		if (!isValid) {
			toast.error("Please fix validation errors before approving");
			return;
		}
		if (hasChanges) {
			await applyUpdate(getValues() as FormValues, false);
		}
		await updateStatus("approved");
	};

	const handleReject = async () => {
		await updateStatus("deleted");
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

	if (isLoading) return <CircularProgress />;
	if (isError) return <div>Error...</div>;

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
									onChange={value => {
										field.onChange(value ?? "");
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
												helperText={errors.translations?.[index]?.title?.message}
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
					<Button type='submit' disabled={isSaving || isUpdatingStatus} variant='contained'>
						{isSaving ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							"Save changes"
						)}
					</Button>
					<Button
						disabled={isSaving || isUpdatingStatus}
						variant='outlined'
						color='success'
						onClick={handleApprove}
					>
						{isUpdatingStatus ? (
							<CircularProgress size={24} color='inherit' />
						) : (
							"Approve"
						)}
					</Button>
					<Button
						disabled={isSaving || isUpdatingStatus}
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
		</Box>
	);
};
