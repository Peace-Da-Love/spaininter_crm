import { useDropzone } from "react-dropzone";
import { Box, ButtonBase, Typography } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { FC, useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useToast } from "@/shared/hooks";

type Props = {
	onFileSelect: (file: File | null) => void;
	error: boolean;
	message?: string;
};

export const ImageDropZone: FC<Props> = ({
	onFileSelect,
	error,
	message
}) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const { warning } = useToast();

	// Create preview URL when file is selected
	useEffect(() => {
		if (selectedFile) {
			const url = URL.createObjectURL(selectedFile);
			setPreviewUrl(url);
			return () => {
				URL.revokeObjectURL(url);
			};
		} else {
			setPreviewUrl(null);
		}
	}, [selectedFile]);

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			"image/png": [".png"],
			"image/jpeg": [".jpeg"],
			"image/webp": [".webp"]
		},
		maxFiles: 1,
		multiple: false,
		onDrop: files => {
			const file = files[0];
			if (!file) return;

			// Validate file size
			if (file.size > 5000000) {
				warning("File size is too large (max 5MB)");
				return;
			}

			setSelectedFile(file);
			onFileSelect(file);
		}
	});

	const handleRemove = () => {
		setSelectedFile(null);
		onFileSelect(null);
	};

	return (
		<Box sx={{ marginBottom: pxToRem(20) }}>
			{!selectedFile && (
				<Box sx={{ cursor: "pointer", userSelect: "none" }}>
					<Typography gutterBottom>Poster</Typography>
					<Box
						sx={{
							border: error ? "2px dashed #d32f2f" : "2px dashed #eeeeee",
							borderRadius: "2px",
							textAlign: "center",
							padding: "20px",
							background: "#fff",
							position: "relative",
							minHeight: "120px",
							display: "flex",
							justifyContent: "center",
							alignItems: "center"
						}}
						{...getRootProps({
							className: "dropzone"
						})}
					>
						<input {...getInputProps({})} />
						<Typography
							sx={{
								color: error ? "#d32f2f" : "#757575"
							}}
						>
							Select or drop an image here
						</Typography>
					</Box>
				</Box>
			)}
			{selectedFile && previewUrl && (
				<Box>
					<Typography gutterBottom>Image preview</Typography>
					<Box
						sx={{
							position: "relative",
							display: "inline-block"
						}}
					>
						<img
							src={previewUrl}
							alt='preview'
							style={{
								width: "300px",
								height: "200px",
								objectFit: "cover",
								borderRadius: "8px",
								border: "2px solid #4caf50"
							}}
						/>
						<ButtonBase
							sx={{
								position: "absolute",
								top: "10px",
								right: "10px",
								zIndex: 1,
								color: "white",
								background: "rgba(227,227,227,0.5)",
								borderRadius: "50%"
							}}
							onClick={handleRemove}
						>
							<CloseIcon />
						</ButtonBase>
					</Box>
					{selectedFile && (
						<Box mt={1}>
							<Typography variant="body2" color="text.secondary">
								Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
							</Typography>
						</Box>
					)}
				</Box>
			)}
			{message && (
				<Box sx={{ marginTop: pxToRem(10), color: "#d32f2f" }}>{message}</Box>
			)}
		</Box>
	);
};
