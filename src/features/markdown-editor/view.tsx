import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	CreateLink,
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
	UndoRedo
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { IImageDto, imageModel } from "@/app/models/image-model";
import { useRef } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { ClassNames } from "@emotion/react";

type Props = {
	onChange?: (value: string) => void;
};

export const MarkdownEditor = forwardRef<MDXEditorMethods, Props>(
	({ onChange, ...props }, ref) => {
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
			<ClassNames>
				{({ css }) => (
					<MDXEditor
						{...props}
						markdown={""}
						onChange={onChange}
						className={css`
							background: #fff;
							margin-bottom: 20px;
							border-radius: 0.375rem;
						`}
						plugins={[
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
									<DiffSourceToggleWrapper options={["rich-text"]}>
										<UndoRedo />
										<BoldItalicUnderlineToggles />
										<Separator />
										<ListsToggle />
										<Separator />
										<BlockTypeSelect />
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
				)}
			</ClassNames>
		);
	}
);
