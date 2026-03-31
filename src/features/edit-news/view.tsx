import { FC, Fragment, useRef, useState, useEffect, useMemo } from "react";
import { LanguageSelection } from "@/features/language-selection";
import { TelegramLink } from "./ui/telegram-link";
import { useLanguagesStore } from "@/app/store";
import { useQuery } from "@tanstack/react-query";
import { newsModel } from "@/app/models/news-model";
import { UpdateTranslationDto } from "@/app/models/news-model/types";
import { Box, Button, CircularProgress, TextField, Chip, Alert, IconButton, Typography } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { schema } from "./model.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MarkdownEditor } from "@/features/markdown-editor";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { useToast } from "@/shared/hooks";
import { useNavigate } from "react-router-dom";
import { Loading } from "./loading.tsx";
import { PhotoChangeDialog } from "./ui/photo-change-dialog";
import EditIcon from "@mui/icons-material/Edit";

type Props = {
	newsId: number;
};

// Type for form data by languages
type FormData = {
	title: string;
	description: string;
	content: string;
	adLink: string | null;
};

// Type for all languages data
type AllLanguagesData = {
	[languageId: number]: FormData;
};

export const EditNews: FC<Props> = ({ newsId }) => {
	const toast = useToast();
	const navigate = useNavigate();
	const { languages } = useLanguagesStore();
	const [currentLang, setCurrentLang] = useState<number>();
	const [allLanguagesData, setAllLanguagesData] = useState<AllLanguagesData>({});
	const [changedLanguages, setChangedLanguages] = useState<Set<number>>(new Set());
	const [originalData, setOriginalData] = useState<AllLanguagesData>({});
	const [posterLink, setPosterLink] = useState<string>(""); // Only for display
	const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
	const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState<boolean>(false);
	const mdxEditorRef = useRef<MDXEditorMethods>(null);

	const {
		handleSubmit,
		register,
		control,
		reset,
		formState: { errors }
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema)
	});

	// Load data for all languages at once
	const { isLoading, isError } = useQuery({
		queryKey: ["news-all-languages", newsId],
		queryFn: async () => {
			if (!languages || languages.length === 0) return null;
			
			const promises = languages.map(lang => 
				newsModel.getById({
					id: newsId,
					languageCode: lang.language_code
				})
			);
			
			const results = await Promise.all(promises);
			
			// Collect data for all languages
			const allData: AllLanguagesData = {};
			let nextPosterLink = "";
			languages.forEach((lang, index) => {
				const news = results[index]?.data?.data?.news;
				if (!news) {
					throw new Error("News data is missing in response");
				}
				allData[lang.language_id] = {
					title: news.title ?? "",
					description: news.description ?? "",
					content: (news.content ?? "")
						.replace(/\\n/g, "\n\n")
						.replace(/\\|/g, ""),
					adLink: news.adLink ?? null
				};

				if (!nextPosterLink && news.posterLink) {
					nextPosterLink = news.posterLink;
				}
			});
			
			// Set poster link once (it's the same for all languages)
			if (nextPosterLink) {
				setPosterLink(nextPosterLink);
			}
			
			setAllLanguagesData(allData);
			setOriginalData(allData);
			
			// Set the first language as the current language
			if (languages[0] && !currentLang) {
				const firstLangData = allData[languages[0].language_id];
				setCurrentLang(languages[0].language_id);
				reset(firstLangData);
				if (mdxEditorRef.current && firstLangData.content) {
					mdxEditorRef.current.setMarkdown(firstLangData.content);
				}
			}
			
			return allData;
		},
		enabled: !!languages && languages.length > 0
	});

	const statusByLanguageId = useMemo(() => {
		const statusMap: Record<number, "complete" | "partial" | "empty"> = {};
		const isFilled = (value?: string | null) =>
			typeof value === "string" && value.trim().length > 0;

		languages.forEach(lang => {
			const data = allLanguagesData[lang.language_id];
			if (!data) {
				statusMap[lang.language_id] = "empty";
				return;
			}

			const filledCount = [
				isFilled(data.title),
				isFilled(data.description),
				isFilled(data.content)
			].filter(Boolean).length;

			if (filledCount === 0) {
				statusMap[lang.language_id] = "empty";
			} else if (filledCount === 3) {
				statusMap[lang.language_id] = "complete";
			} else {
				statusMap[lang.language_id] = "partial";
			}
		});

		return statusMap;
	}, [languages, allLanguagesData]);

	// Effect for switching between languages
	useEffect(() => {
		if (currentLang && allLanguagesData[currentLang]) {
			const langData = allLanguagesData[currentLang];
			reset(langData);
			if (mdxEditorRef.current) {
				mdxEditorRef.current.setMarkdown(langData.content);
			}
		}
	}, [currentLang, reset]);

	// Handler for form changes for the current language
	const handleFormChange = (field: keyof FormData, value: any) => {
		if (!currentLang) return;
		
		const updatedData = {
			...allLanguagesData,
			[currentLang]: {
				...allLanguagesData[currentLang],
				[field]: value
			}
		};
		
		setAllLanguagesData(updatedData);
		
		// Check if there are changes compared to the original data
		const isChanged = JSON.stringify(updatedData[currentLang]) !== JSON.stringify(originalData[currentLang]);
		
		const newChangedLanguages = new Set(changedLanguages);
		if (isChanged) {
			newChangedLanguages.add(currentLang);
		} else {
			newChangedLanguages.delete(currentLang);
		}
		setChangedLanguages(newChangedLanguages);
	};

	// Handler for photo dialog
	const handlePhotoDialogOpen = () => {
		setIsPhotoDialogOpen(true);
	};

	const handlePhotoDialogClose = () => {
		setIsPhotoDialogOpen(false);
		setSelectedPhotoFile(null);
	};

	const handlePhotoSave = (file: File) => {
		setSelectedPhotoFile(file);
		setIsPhotoDialogOpen(false);
	};

	
	const [isUpdating, setIsUpdating] = useState(false);

	// Function to create translation updates
	const createUpdates = (): UpdateTranslationDto[] => {
		const updates: UpdateTranslationDto[] = [];
		
		changedLanguages.forEach(languageId => {
			const currentData = allLanguagesData[languageId];
			const originalLangData = originalData[languageId];
			
			if (!currentData || !originalLangData) return;

			// Create object with changed fields
			const dto: Partial<UpdateTranslationDto> = { languageId };
			
			if (currentData.title !== originalLangData.title) {
				dto.title = currentData.title;
			}
			if (currentData.description !== originalLangData.description) {
				dto.description = currentData.description;
			}
			if (currentData.content !== originalLangData.content) {
				dto.content = currentData.content;
			}
			if (currentData.adLink !== originalLangData.adLink) {
				dto.adLink = currentData.adLink;
			}

			// Add only if there are changes (except languageId)
			if (Object.keys(dto).length > 1) {
				updates.push(dto as UpdateTranslationDto);
			}
		});

		return updates;
	};

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = async () => {
		const hasLanguageChanges = changedLanguages.size > 0;
		const hasPhotoFile = selectedPhotoFile !== null;

		if (!hasLanguageChanges && !hasPhotoFile) {
			toast.info("No changes detected");
			return;
		}

		const partialLanguages = languages.filter(lang => {
			const data = allLanguagesData[lang.language_id];
			const title = (data?.title ?? "").trim();
			const description = (data?.description ?? "").trim();
			const content = (data?.content ?? "").trim();
			const filledCount = [title, description, content].filter(Boolean).length;
			return filledCount > 0 && filledCount < 3;
		});

		if (partialLanguages.length > 0) {
			toast.error(
				`Complete or clear translations for: ${partialLanguages
					.map(lang => lang.language_code)
					.join(", ")}`
			);
			return;
		}

		setIsUpdating(true);

		try {
			// 1. First upload photo (if exists)
			if (hasPhotoFile) {
				const formData = new globalThis.FormData();
				formData.append("photo", selectedPhotoFile);
				await newsModel.updatePhoto(newsId, formData);
			}

			// 2. Then update translations (if there are changes)
			if (hasLanguageChanges) {
				const updates = createUpdates();
				if (updates.length > 0) {
					await newsModel.updateTranslations(newsId, updates);
				}
			}

			toast.success("News updated successfully");
			navigate("/news");
		} catch (error) {
			toast.error("Failed to update news");
		} finally {
			setIsUpdating(false);
		}
	};

	const currentData = currentLang ? allLanguagesData[currentLang] : null;

	return (
		<Fragment>
			{/* Photo Preview with Change Button */}
			{!isLoading && !isError && (
				<Box mb={3} maxWidth={400}>
					<Box sx={{ position: "relative", display: "inline-block" }}>
						{selectedPhotoFile ? (
							// Show preview of selected file
							<img
								src={URL.createObjectURL(selectedPhotoFile)}
								alt="Selected photo preview"
								style={{
									width: "300px",
									height: "200px",
									objectFit: "cover",
									borderRadius: "8px",
									border: "2px solid #4caf50"
								}}
							/>
						) : posterLink ? (
							// Show original photo
							<img
								src={posterLink}
								alt="News poster"
								style={{
									width: "300px",
									height: "200px",
									objectFit: "cover",
									borderRadius: "8px",
									border: "1px solid #ddd"
								}}
							/>
						) : (
							// Show placeholder
							<Box
								sx={{
									width: "300px",
									height: "200px",
									border: "2px dashed #ccc",
									borderRadius: "8px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									backgroundColor: "#f9f9f9"
								}}
							>
								<Typography color="text.secondary">No photo</Typography>
							</Box>
						)}
						<IconButton
							sx={{
								position: "absolute",
								top: "8px",
								right: "8px",
								backgroundColor: "rgba(255, 255, 255, 0.8)",
								"&:hover": {
									backgroundColor: "rgba(255, 255, 255, 0.9)"
								}
							}}
							onClick={handlePhotoDialogOpen}
						>
							<EditIcon />
						</IconButton>
					</Box>
					{selectedPhotoFile && (
						<Box mt={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Typography variant="body2" color="success.main" sx={{ fontWeight: "bold" }}>
								✓ New photo selected: {selectedPhotoFile.name}
							</Typography>
							<Button
								size="small"
								variant="outlined"
								color="error"
								onClick={() => setSelectedPhotoFile(null)}
								sx={{ minWidth: "auto", padding: "2px 8px" }}
							>
								Remove
							</Button>
						</Box>
					)}
				</Box>
			)}

			{/* Show change indicators */}
			{changedLanguages.size > 0 && (
				<Alert severity="info" sx={{ mb: 2 }}>
					Modified languages: {Array.from(changedLanguages).map(langId => 
						languages.find(l => l.language_id === langId)?.language_code
					).join(", ")}
				</Alert>
			)}

			<LanguageSelection
				value={currentLang || languages?.[0]?.language_id}
				onChange={value => setCurrentLang(value)}
				defaultValue={languages?.[0]?.language_id}
				statusByLanguageId={statusByLanguageId}
			/>

			<form onSubmit={handleSubmit(onSubmit)}>
				{!isLoading && !isError && currentData && (
					<Box>
						{/* Change indicator for the current language */}
						{currentLang && changedLanguages.has(currentLang) && (
							<Chip 
								label="Modified" 
								color="warning" 
								size="small" 
								sx={{ mb: 2 }}
							/>
						)}

						<Box mb='20px' maxWidth={600}>
							<Controller
								name={"adLink"}
								control={control}
								defaultValue={currentData.adLink}
								render={({ field }) => (
									<TelegramLink 
										value={field.value} 
										onChange={value => {
											field.onChange(value);
											handleFormChange('adLink', value);
										}} 
									/>
								)}
							/>
						</Box>

						<Box mb={"20px"} maxWidth={600}>
							<TextField
								placeholder='Title'
								defaultValue={currentData.title}
								error={!!errors?.title}
								helperText={errors?.title?.message}
								fullWidth
								{...register("title", {
									onChange: (e) => handleFormChange('title', e.target.value)
								})}
							/>
						</Box>

						<Box mb={"20px"} maxWidth={600}>
							<TextField
								minRows={3}
								multiline
								defaultValue={currentData.description}
								error={!!errors?.description}
								helperText={errors?.description?.message}
								placeholder='Description'
								fullWidth
								{...register("description", {
									onChange: (e) => handleFormChange('description', e.target.value)
								})}
							/>
						</Box>

						<Box mb={"20px"} maxWidth={900}>
							<Controller
								name='content'
								control={control}
								defaultValue={currentData.content}
								render={({ field }) => (
									<MarkdownEditor
										error={!!errors?.content}
										helperText={errors?.content?.message}
										value={field.value}
										ref={mdxEditorRef}
										onChange={_ => {
											const markdownValue = mdxEditorRef.current?.getMarkdown() ?? "";
											field.onChange(markdownValue);
											handleFormChange('content', markdownValue);
										}}
									/>
								)}
							/>
						</Box>

						<Box sx={{ display: 'flex', gap: 2 }}>
							<Button disabled={isUpdating} type='submit' variant='contained'>
								{isUpdating ? (
									<CircularProgress size={24} color='inherit' />
								) : (
									`Save Changes (${changedLanguages.size} language${changedLanguages.size !== 1 ? 's' : ''}${selectedPhotoFile ? ', photo' : ''})`
								)}
							</Button>

							<Button 
								disabled={isUpdating || (changedLanguages.size === 0 && !selectedPhotoFile)}
								variant='outlined' 
								onClick={() => {
									setAllLanguagesData(originalData);
									setChangedLanguages(new Set());
									setSelectedPhotoFile(null);
									if (currentLang && originalData[currentLang]) {
										const originalLangData = originalData[currentLang];
										reset(originalLangData);
										if (mdxEditorRef.current) {
											mdxEditorRef.current.setMarkdown(originalLangData.content);
										}
									}
								}}
							>
								Reset Changes{selectedPhotoFile ? ' & Photo' : ''}
							</Button>
						</Box>
					</Box>
				)}
			</form>

			{isLoading && <Loading />}
			{isError && <div>Error...</div>}

			{/* Photo Change Dialog */}
			<PhotoChangeDialog
				isOpen={isPhotoDialogOpen}
				onClose={handlePhotoDialogClose}
				onSave={handlePhotoSave}
				isPending={isUpdating}
			/>
		</Fragment>
	);
};
