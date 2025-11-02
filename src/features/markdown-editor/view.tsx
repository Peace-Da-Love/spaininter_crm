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
	toolbarPlugin,
	jsxPlugin,
	type JsxComponentDescriptor
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { IImageDto, imageModel } from "@/app/models/image-model";
import { createContext, useRef } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { FormControl, FormHelperText } from "@mui/material";
import { InsertYouTubeButton, InsertTikTokButton } from "@/features/markdown-editor/components";
import { JsxPlaceholder } from "./components/jsx-placeholder";

export const MarkdownEditorContext = createContext<MDXEditorMethods | null>(null)

type Props = {
	onChange?: (value: string) => void;
	value: string;
	error?: boolean;
	helperText?: string;
};

export const MarkdownEditor = forwardRef<MDXEditorMethods, Props>(
	({ onChange, value, error, helperText, ...props }, ref) => {
		const editorRef = useRef<MDXEditorMethods | null>(null);

		// Normalize cases when users paste full YouTube URLs into the id prop
		const extractYouTubeId = (input: string) => {
			const trimmed = input.trim()
			const match = trimmed.match(
				/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
			)
			if (match && match[1]) return match[1]
		
			const matchWatch = trimmed.match(/v=([A-Za-z0-9_-]{6,})/)
			return matchWatch?.[1] ?? trimmed
		}
		

		const sanitizeYouTubeTags = (markdown: string) =>
			markdown.replace(
				/<YouTube\s+id=["']([^"']+)["']\s*\/?>(?:\s*<\/YouTube>)?/g,
				(_m, id) => {
					const safeId = extractYouTubeId(id)
					return `<YouTube id="${safeId}" />`
				}
			)
		

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

		const sanitizedMarkdown = sanitizeYouTubeTags(value ?? "");

		return (
			<FormControl
				error={error}
				sx={{
					border: `1px solid ${error ? "#f00" : "#d1d5db"}`,
					borderRadius: "0.375rem",
					width: "100%"
				}}
			>
				<MarkdownEditorContext.Provider value={editorRef.current}
				>
				<MDXEditor
					{...props}
					markdown={sanitizedMarkdown}
					onChange={(md) => {
						const sanitized = sanitizeYouTubeTags(md ?? "");
						onChange?.(sanitized);
					}}
					className={"editor"}
					plugins={[
						jsxPlugin({
							jsxComponentDescriptors: [
								{
									name: "YouTube",
									kind: "text",
									props: [
										{ name: "id", type: "string" }
									],
									hasChildren: false,
									Editor: JsxPlaceholder,
								} as JsxComponentDescriptor,
								{
									name: "TikTok", 
									kind: "text",
									props: [
										{ name: "url", type: "string" }
									],
									hasChildren: false,
									Editor: JsxPlaceholder,
								} as JsxComponentDescriptor
							]
						}),
						diffSourcePlugin({ viewMode: 'rich-text' }),
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
									<Separator />
									<InsertYouTubeButton editorRef={editorRef} />
									<InsertTikTokButton editorRef={editorRef} />
								</DiffSourceToggleWrapper>
							)
						})
					]}
					ref={editorRef}
				/>
				</MarkdownEditorContext.Provider>
				{error && <FormHelperText>{helperText}</FormHelperText>}
			</FormControl>
		);
	}
);
