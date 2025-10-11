import { FC } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	CircularProgress
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { pxToRem } from "@/shared/css-utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const photoSchema = z.object({
	photo: z
		.instanceof(File)
		.refine(file => file instanceof File, "Photo is required")
});

type PhotoFormData = z.infer<typeof photoSchema>;

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onSave: (file: File) => void;
	isPending: boolean;
};

export const PhotoChangeDialog: FC<Props> = ({
	isOpen,
	onClose,
	onSave,
	isPending
}) => {
	const {
		handleSubmit,
		reset,
		setValue,
		formState: { errors }
	} = useForm<PhotoFormData>({
		resolver: zodResolver(photoSchema)
	});

	const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
		accept: { "image/*": [] },
		maxFiles: 1,
		onDrop: acceptedFiles => {
			if (acceptedFiles.length > 0) {
				setValue("photo", acceptedFiles[0], { shouldValidate: true });
			}
		}
	});

	const onSubmit: SubmitHandler<PhotoFormData> = data => {
		onSave(data.photo);
	};

	const handleClose = () => {
		if (isPending) return;
		onClose();
		reset();
		acceptedFiles.length = 0;
	};

	return (
		<Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogTitle>Change Photo for News</DialogTitle>
				<DialogContent>
					<Box
						{...getRootProps()}
						sx={{
							border: "2px dashed #ccc",
							borderRadius: "8px",
							padding: pxToRem(20),
							textAlign: "center",
							backgroundColor: "#f9f9f9",
							cursor: "pointer",
							"&:hover": {
								borderColor: "#607698",
								backgroundColor: "#f0f4f8"
							}
						}}
					>
						<input {...getInputProps()} />
						{acceptedFiles.length > 0 ? (
							<Box>
								<Typography variant="body2" color="text.secondary">
									{acceptedFiles[0].name}
								</Typography>
								<Box mt={2}>
									<img
										src={URL.createObjectURL(acceptedFiles[0])}
										alt="Preview"
										style={{
											maxWidth: "200px",
											maxHeight: "200px",
											borderRadius: "8px",
											objectFit: "cover"
										}}
									/>
								</Box>
							</Box>
						) : (
							<Typography variant="body1" color="text.secondary">
								Drag and drop an image here, or click to select
							</Typography>
						)}
						{errors.photo && (
							<Typography color="error" variant="caption" mt={1}>
								{errors.photo.message}
							</Typography>
						)}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? <CircularProgress size={20} /> : "Update"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};
