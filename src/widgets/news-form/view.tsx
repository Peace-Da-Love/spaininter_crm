import { MarkdownEditor } from "@/features/markdown-editor";
import { LanguageSelection } from "@/features/language-selection";
import { SelectCategory } from "@/features/select-category";
import { useNewsStore } from "@/app/store";
import { SelectChangeEvent } from "@mui/material/Select/SelectInput";
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField
} from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { Fragment, useEffect, useRef, useState } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { ImageDropZone } from "@/features/image-drop-zone";
import { useNewsValidation } from "@/widgets/news-form/hooks";
import { useMutation } from "@tanstack/react-query";
import { INews } from "@/app/types";
import { newsModel } from "@/app/models/news-model";
import { useToast } from "@/shared/hooks";
import { useNavigate } from "react-router-dom";

export const NewsForm = () => {
	const { currentLanguageId, setCurrentLanguageId, setNews, news } =
		useNewsStore();
	const navigate = useNavigate();
	const mdxEditorRef = useRef<MDXEditorMethods>(null);
	const { validate, errors } = useNewsValidation();
	const [isErrorModal, setIsErrorModal] = useState<boolean>(false);
	const toast = useToast();
	const { mutate, isPending } = useMutation({
		mutationKey: ["create-news"],
		mutationFn: (dto: INews) => newsModel.create(dto),
		onSuccess: async () => {
			toast.success("News created successfully");
			navigate("/news");
			setNews({
				category_id: null,
				poster_link: null,
				province: null,
				city: null,
				translations: null
			});
		},
		onError: () => {
			toast.error("Failed to create news");
		}
	});

	useEffect(() => {
		const isLanguageExist = news.translations?.find(
			translation => translation.language_id === currentLanguageId
		);
		if (!isLanguageExist) {
			setNews({
				...news,
				translations: [
					...(news.translations || []),
					{
						language_id: currentLanguageId,
						title: "",
						description: "",
						content: ""
					}
				]
			});
		}

		if (mdxEditorRef.current) {
			mdxEditorRef.current.setMarkdown(
				news.translations?.find(
					translation => translation.language_id === currentLanguageId
				)?.content || ""
			);
		}
	}, [currentLanguageId]);

	useEffect(() => {
		// setNews({
		// 	...news,
		// 	translations: languages.map(language => {
		// 		return {
		// 			language_id: language.language_id,
		// 			title: null,
		// 			description: null,
		// 			content: null
		// 		};
		// 	})
		// });

		console.log(news);
	}, []);

	const handleCategoryChange = (event: SelectChangeEvent) => {
		const {
			target: { value }
		} = event;
		setNews({
			...news,
			category_id: Number(value)
		});
	};

	const handleLanguageChange = (id: number) => {
		setCurrentLanguageId(id);
	};

	const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setNews({
			...news,
			translations: news.translations?.map(translation => {
				if (translation.language_id === currentLanguageId) {
					return {
						...translation,
						title: event.target.value
					};
				}

				return {
					...translation,
					title: translation.title
				};
			})
		});
	};

	const handleDescriptionChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setNews({
			...news,
			translations: news.translations?.map(translation => {
				if (translation.language_id === currentLanguageId) {
					return {
						...translation,
						description: event.target.value
					};
				}
				return translation;
			})
		});
	};

	const handleContentChange = (content: string) => {
		setNews({
			...news,
			translations: news.translations?.map(translation => {
				if (translation.language_id === currentLanguageId) {
					return {
						...translation,
						content
					};
				}
				return translation;
			})
		});
	};

	const handleSubmit = () => {
		const isError = validate();
		if (isError) {
			setIsErrorModal(true);
			return;
		}
		mutate(news);
	};

	return (
		<Box maxWidth={1000}>
			<SelectCategory
				value={news.category_id?.toString() || ""}
				onChange={handleCategoryChange}
			/>
			<LanguageSelection
				value={currentLanguageId}
				onChange={handleLanguageChange}
			/>
			<Box maxWidth={500}>
				<Box sx={{ display: "flex", gap: pxToRem(20) }} mb={pxToRem(20)}>
					<TextField
						value={news.province || ""}
						onChange={event =>
							setNews({ ...news, province: event.target.value })
						}
						label='Province'
						fullWidth
					/>
					<TextField
						value={news.city || ""}
						onChange={event => setNews({ ...news, city: event.target.value })}
						fullWidth
						label='City'
					/>
				</Box>
				<ImageDropZone
					handleImageLink={posterLink =>
						setNews({
							...news,
							poster_link: posterLink
						})
					}
				/>
				<Box mb={pxToRem(20)}>
					<TextField
						onChange={handleTitleChange}
						value={
							news.translations?.find(
								translation => translation.language_id === currentLanguageId
							)?.title || ""
						}
						fullWidth
						label='Title'
					/>
				</Box>
				<Box mb={pxToRem(20)}>
					<TextField
						onChange={handleDescriptionChange}
						value={
							news.translations?.find(
								translation => translation.language_id === currentLanguageId
							)?.description || ""
						}
						minRows={3}
						label='Description'
						fullWidth
						multiline
					/>
				</Box>
			</Box>
			<MarkdownEditor ref={mdxEditorRef} onChange={handleContentChange} />
			<Button disabled={isPending} onClick={handleSubmit} variant='contained'>
				{isPending ? <CircularProgress /> : "Create"}
			</Button>

			<Dialog
				open={isErrorModal}
				onClose={() => setIsErrorModal(false)}
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'
			>
				<DialogTitle id='alert-dialog-title'>Validation Error!</DialogTitle>
				<DialogContent>
					<DialogContentText id='alert-dialog-description'>
						{Object.keys(errors).map(key => {
							return (
								<Fragment key={key}>
									<span>{errors[key]}</span>
									<br />
								</Fragment>
							);
						})}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsErrorModal(false)} autoFocus>
						OK
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
