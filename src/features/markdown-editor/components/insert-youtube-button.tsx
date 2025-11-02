import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { useState } from "react";

type Props = {
	editorRef?: React.RefObject<{ insertMarkdown: (markdown: string) => void; } | null>;
};

export function InsertYouTubeButton({ editorRef }: Props) {
	const [open, setOpen] = useState(false);
	const [videoId, setVideoId] = useState("");

	const handleClick = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setVideoId("");
	};

	const handleInsert = () => {
		if (videoId.trim() && editorRef?.current) {
			// Extract video ID from YouTube URL or use as-is
			let extractedId = videoId.trim();
			const urlPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
			const match = videoId.match(urlPattern);
			if (match) {
				extractedId = match[1];
			}
			
			const youtubeMarkdown = `<YouTube id="${extractedId}" />`;
			editorRef.current.insertMarkdown(youtubeMarkdown);
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
				YouTube
			</button>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Вставить YouTube видео</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="ID видео YouTube"
						type="text"
						fullWidth
						variant="outlined"
						value={videoId}
						onChange={(e) => setVideoId(e.target.value)}
						placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ или dQw4w9WgXcQ"
						helperText="Введите полный URL видео YouTube или только ID (например: dQw4w9WgXcQ)"
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

