import { FC, Fragment, useRef, useState } from "react";
import { LanguageSelection } from "@/features/language-selection";
import { useLanguagesStore } from "@/app/store";
import { useQuery } from "@tanstack/react-query";
import { newsModel } from "@/app/models/news-model";
import { Box, Button, TextField } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { schema } from "./model.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MarkdownEditor } from "@/features/markdown-editor";
import { MDXEditorMethods } from "@mdxeditor/editor";

type Props = {
	newsId: number;
};

export const EditNews: FC<Props> = ({ newsId }) => {
	const { languages } = useLanguagesStore();
	const [lang, setLang] = useState<number>();
	const mdxEditorRef = useRef<MDXEditorMethods>(null);
	const { handleSubmit, register, control, reset } = useForm<
		z.infer<typeof schema>
	>({
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
						title: res.data.data.news.newsTranslations?.[0].title,
						description: res.data.data.news.newsTranslations?.[0].description,
						content: res.data.data.news.newsTranslations?.[0].content
							.replace(/\\n/g, "\n\n")
							.replace(/\\|/g, "")
					};
					reset(values);
					mdxEditorRef.current?.setMarkdown(values.content);
					return res;
				})
	});

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = data => {
		console.log(data);
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
						<Box mb={"20px"} maxWidth={600}>
							<TextField
								key={`title-${lang}`}
								placeholder='Title'
								defaultValue={data.data.data.news.newsTranslations?.[0].title}
								fullWidth
								{...register("title")}
							/>
						</Box>
						<Box mb={"20px"} maxWidth={600}>
							<TextField
								key={`description-${lang}`}
								minRows={3}
								multiline
								defaultValue={
									data.data.data.news.newsTranslations?.[0].description
								}
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
								defaultValue={data.data.data.news.newsTranslations?.[0].content
									.replace(/\\n/g, "\n\n")
									.replace(/\\|/g, "")}
								render={({ field }) => (
									<MarkdownEditor
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
						<Button type='submit' variant='contained'>
							Save
						</Button>
					</Box>
				)}
			</form>

			{isLoading && <div>Loading...</div>}
			{isError && <div>Error...</div>}
		</Fragment>
	);
};
