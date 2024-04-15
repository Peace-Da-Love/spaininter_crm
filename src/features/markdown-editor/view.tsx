import "./styles.css";
import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	InsertThematicBreak,
	CreateLink,
	diffSourcePlugin,
	DiffSourceToggleWrapper,
	headingsPlugin,
	imagePlugin,
	InsertImage,
	InsertTable,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	ListsToggle,
	markdownShortcutPlugin,
	MDXEditor,
	MDXEditorMethods,
	quotePlugin,
	Separator,
	tablePlugin,
	thematicBreakPlugin,
	toolbarPlugin
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { IImageDto, imageModel } from "@/app/models/image-model";
import { useRef } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { FormControl, FormHelperText } from "@mui/material";

type Props = {
	onChange?: (value: string) => void;
	value: string;
	error?: boolean;
	helperText?: string;
};

export const MarkdownEditor = forwardRef<MDXEditorMethods, Props>(
	({ onChange, value, error, helperText, ...props }, ref) => {
		const editorRef = useRef<MDXEditorMethods | null>(null);

		const imageUploadHandler = async (file: File) => {
			const formData = new FormData() as IImageDto;
			formData.append("file", file);
			const {
				data: { url }
			} = await imageModel(formData);

			return url;
		};

		useImperativeHandle(ref, () => ({
			getMarkdown: () => editorRef.current?.getMarkdown() || "",
			setMarkdown: (markdown: string) =>
				editorRef.current?.setMarkdown(markdown),
			insertMarkdown: (markdown: string) =>
				editorRef.current?.insertMarkdown(markdown),
			focus: () => editorRef.current?.focus()
		}));

		return (
			<FormControl
				error={error}
				sx={{
					border: `1px solid ${error ? "#f00" : "#d1d5db"}`,
					borderRadius: "0.375rem",
					width: "100%"
				}}
			>
				<MDXEditor
					{...props}
					markdown={value ?? ""}
					onChange={onChange}
					className={"editor"}
					plugins={[
						diffSourcePlugin({}),
						headingsPlugin(),
						listsPlugin(),
						quotePlugin(),
						linkPlugin(),
						linkDialogPlugin(),
						tablePlugin(),
						thematicBreakPlugin(),
						markdownShortcutPlugin(),
						imagePlugin({
							imageUploadHandler
						}),
						quotePlugin(),
						toolbarPlugin({
							toolbarContents: () => (
								<DiffSourceToggleWrapper options={["rich-text", "source"]}>
									<BoldItalicUnderlineToggles />
									<Separator />
									<ListsToggle />
									<Separator />
									<BlockTypeSelect />
									<InsertThematicBreak />
									<Separator />
									<CreateLink />
									<InsertImage />
									<InsertTable />
								</DiffSourceToggleWrapper>
							)
						})
					]}
					ref={editorRef}
				/>
				{error && <FormHelperText>{helperText}</FormHelperText>}
			</FormControl>
		);
	}
);
