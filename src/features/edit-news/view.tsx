import { FC, Fragment, useRef, useState } from "react";
import { LanguageSelection } from "@/features/language-selection";
import { TelegramLink } from "./ui/telegram-link";
import { useLanguagesStore } from "@/app/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { newsModel, UpdateNewsDto } from "@/app/models/news-model";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
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

export const EditNews: FC<Props> = ({ newsId }) => {
	const toast = useToast();
	const navigate = useNavigate();
	const { languages } = useLanguagesStore();
	const [lang, setLang] = useState<number>();
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
	const { data, isLoading, isError } = useQuery({
		queryKey: ["news", newsId, lang],
		queryFn: () =>
			newsModel
				.getById({
					id: newsId,
					languageCode:
						languages.find(l => l.language_id === lang)?.language_code ||
						languages?.[0].language_code
				})
				.then(res => {
					const values = {
						title: res.data.data.news.title,
						description: res.data.data.news.description,
						content: res.data.data.news.content
							.replace(/\\n/g, "\n\n")
							.replace(/\\|/g, ""),
						adLink: res.data.data.news.adLink
					};
					reset(values);
					mdxEditorRef.current?.setMarkdown(values.content);
					return res;
				})
	});
	const { mutate, isPending } = useMutation({
		mutationKey: ["update-news"],
		mutationFn: (dto: UpdateNewsDto) => newsModel.update(dto),
		onSuccess: async () => {
			toast.success("News updated successfully");
		},
		onError: () => {
			toast.error("Failed to update news");
		},
		onSettled: () => {
			navigate("/news");
		}
	});

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = fields => {
		const { title, description, content, adLink } = fields;
		const isTitleChanged = title !== data?.data.data.news.title;
		const isDescriptionChanged =
			description !== data?.data.data.news.description;
		const isContentChanged =
			content !==
			data?.data.data.news.content.replace(/\\n/g, "\n\n").replace(/\\|/g, "");
		const isAdLinkChanged = adLink !== data?.data.data.news.adLink;

		if (
			!isTitleChanged &&
			!isDescriptionChanged &&
			!isContentChanged &&
			!isAdLinkChanged
		) {
			toast.info("No changes detected");
			return;
		}

		const dto = {
			newsId,
			languageId: lang || languages?.[0].language_id,
			title: isTitleChanged ? title : undefined,
			description: isDescriptionChanged ? description : undefined,
			content: isContentChanged ? content : undefined,
			adLink: isAdLinkChanged ? adLink : undefined
		};
		mutate(dto);
	};

	return (
		<Fragment>
			<LanguageSelection
				value={lang || languages?.[0].language_id}
				onChange={value => setLang(value)}
				defaultValue={languages?.[0].language_id}
			/>
			<form onSubmit={handleSubmit(onSubmit)}>
				{!isLoading && !isError && data && (
					<Box>
						<Box mb='20px' maxWidth={600}>
							<Controller
								name={"adLink"}
								control={control}
								defaultValue={data.data.data.news.adLink}
								render={({ field }) => (
									<TelegramLink value={field.value} onChange={field.onChange} />
								)}
							/>
						</Box>
						<Box mb={"20px"} maxWidth={600}>
							<TextField
								key={`title-${lang}`}
								placeholder='Title'
								defaultValue={data.data.data.news.title}
								error={!!errors?.title}
								helperText={errors?.title?.message}
								fullWidth
								{...register("title")}
							/>
						</Box>
						<Box mb={"20px"} maxWidth={600}>
							<TextField
								key={`description-${lang}`}
								minRows={3}
								multiline
								defaultValue={data.data.data.news.description}
								error={!!errors?.description}
								helperText={errors?.description?.message}
								placeholder='Description'
								fullWidth
								{...register("description")}
							/>
						</Box>
						<Box mb={"20px"} maxWidth={900}>
							<Controller
								key={`content-${lang}`}
								name='content'
								control={control}
								defaultValue={data.data.data.news.content
									.replace(/\\n/g, "\n\n")
									.replace(/\\|/g, "")}
								render={({ field }) => (
									<MarkdownEditor
										error={!!errors?.content}
										helperText={errors?.content?.message}
										value={field.value}
										ref={mdxEditorRef}
										onChange={value => {
											field.onChange(mdxEditorRef.current?.getMarkdown() ?? "");
											mdxEditorRef.current?.setMarkdown(value);
										}}
									/>
								)}
							/>
						</Box>
						<Button disabled={isPending} type='submit' variant='contained'>
							{isPending ? (
								<CircularProgress size={24} color='inherit' />
							) : (
								"Save"
							)}
						</Button>
					</Box>
				)}
			</form>

			{isLoading && <Loading />}
			{isError && <div>Error...</div>}
		</Fragment>
	);
};
