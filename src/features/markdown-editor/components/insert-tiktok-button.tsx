import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { useState } from "react";

type Props = {
	editorRef?: React.RefObject<{ insertMarkdown: (markdown: string) => void; } | null>;
};

export function InsertTikTokButton({ editorRef }: Props) {
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");

	const handleClick = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setUrl("");
	};

	const handleInsert = () => {
		if (url.trim() && editorRef?.current) {
			// Extract and normalize TikTok URL
			let finalUrl = url.trim();
			
			// Ensure it's a full URL
			if (!finalUrl.includes('tiktok.com')) {
				finalUrl = `https://www.tiktok.com/@username/video/${finalUrl}`;
			}
			
			const tiktokMarkdown = `<TikTok url="${finalUrl}" />`;
			editorRef.current.insertMarkdown(tiktokMarkdown);
			handleClose();
		}
	};

	return (
		<>
			<button
				onClick={handleClick}
				className="toolbar-button"
				type="button"
				style={{
					padding: "6px 12px",
					border: "1px solid #ccc",
					borderRadius: "4px",
					background: "white",
					cursor: "pointer"
				}}
			>
				TikTok
			</button>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Вставить TikTok видео</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="URL видео TikTok"
						type="text"
						fullWidth
						variant="outlined"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://www.tiktok.com/@username/video/1234567890"
						helperText="Введите полный URL видео TikTok"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Отмена</Button>
					<Button onClick={handleInsert} variant="contained">
						Вставить
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

