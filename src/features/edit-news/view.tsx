import { FC, Fragment, useRef, useState, useEffect } from "react";
import { LanguageSelection } from "@/features/language-selection";
import { TelegramLink } from "./ui/telegram-link";
import { useLanguagesStore } from "@/app/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { newsModel, UpdateNewsDto } from "@/app/models/news-model";
import { Box, Button, CircularProgress, TextField, Chip, Alert } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { schema } from "./model.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MarkdownEditor } from "@/features/markdown-editor";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { useToast } from "@/shared/hooks";
import { useNavigate } from "react-router-dom";
import { Loading } from "./loading.tsx";

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
			languages.forEach((lang, index) => {
				const result = results[index];
				if (result && result.data && result.data.data) {
					allData[lang.language_id] = {
						title: result.data.data.news.title,
						description: result.data.data.news.description,
						content: result.data.data.news.content
							.replace(/\\n/g, "\n\n")
							.replace(/\\|/g, ""),
						adLink: result.data.data.news.adLink
					};
				}
			});
			
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

	const { mutate: updateAllLanguages, isPending } = useMutation({
		mutationKey: ["update-news-all"],
		mutationFn: async (updates: UpdateNewsDto[]) => {
			const promises = updates.map(dto => newsModel.update(dto));
			await Promise.all(promises);
		},
		onSuccess: async () => {
			toast.success("All languages updated successfully");
			navigate("/news");
		},
		onError: () => {
			toast.error("Failed to update some languages");
		}
	});

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = () => {
		if (changedLanguages.size === 0) {
			toast.info("No changes detected");
			return;
		}

		const updates: UpdateNewsDto[] = [];
		
		changedLanguages.forEach(languageId => {
			const currentData = allLanguagesData[languageId];
			const originalLangData = originalData[languageId];
			
			if (!currentData || !originalLangData) return;

			const dto: UpdateNewsDto = {
				newsId,
				languageId,
				title: currentData.title !== originalLangData.title ? currentData.title : undefined,
				description: currentData.description !== originalLangData.description ? currentData.description : undefined,
				content: currentData.content !== originalLangData.content ? currentData.content : undefined,
				adLink: currentData.adLink !== originalLangData.adLink ? currentData.adLink : undefined
			};

			// Add update only if there are changes
			const hasChanges = dto.title !== undefined || dto.description !== undefined || 
							  dto.content !== undefined || dto.adLink !== undefined;
			
			if (hasChanges) {
				updates.push(dto);
			}
		});

		if (updates.length === 0) {
			toast.info("No changes detected");
			return;
		}

		updateAllLanguages(updates);
	};

	const currentData = currentLang ? allLanguagesData[currentLang] : null;

	return (
		<Fragment>
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
							<Button disabled={isPending} type='submit' variant='contained'>
								{isPending ? (
									<CircularProgress size={24} color='inherit' />
								) : (
									`Save Changes (${changedLanguages.size} language${changedLanguages.size !== 1 ? 's' : ''})`
								)}
							</Button>

							<Button 
								disabled={isPending || changedLanguages.size === 0}
								variant='outlined' 
								onClick={() => {
									setAllLanguagesData(originalData);
									setChangedLanguages(new Set());
									if (currentLang && originalData[currentLang]) {
										const originalLangData = originalData[currentLang];
										reset(originalLangData);
										if (mdxEditorRef.current) {
											mdxEditorRef.current.setMarkdown(originalLangData.content);
										}
									}
								}}
							>
								Reset Changes
							</Button>
						</Box>
					</Box>
				)}
			</form>

			{isLoading && <Loading />}
			{isError && <div>Error...</div>}
		</Fragment>
	);
};
