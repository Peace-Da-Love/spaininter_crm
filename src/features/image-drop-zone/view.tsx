import { useDropzone } from "react-dropzone";
import { Box, ButtonBase, CircularProgress, Typography } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { FC, useState } from "react";
import { IImageDto, imageModel } from "@/app/models/image-model";
import CloseIcon from "@mui/icons-material/Close";
import { useToast } from "@/shared/hooks";

type Props = {
	handleImageLink: (url: string | null) => void;
};

export const ImageDropZone: FC<Props> = ({ handleImageLink }) => {
	const [imageLink, setImageLink] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { warning } = useToast();
	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			"image/png": [".png"],
			"image/jpeg": [".jpeg"],
			"image/webp": [".webp"]
		},
		// maxSize: 0.5,
		maxFiles: 1,
		multiple: false,
		onDrop: async files => {
			try {
				setIsLoading(true);
				const file = files[0];
				if (file.size > 5000000) throw new Error("File size is too large");
				const formData = new FormData() as IImageDto;
				formData.append("file", file);
				const {
					data: { url }
				} = await imageModel(formData);
				setImageLink(url);
				handleImageLink(url);
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
			} catch (err: never) {
				warning(err.toString());
			} finally {
				setIsLoading(false);
			}
		}
	});

	return (
		<Box sx={{ marginBottom: pxToRem(20) }}>
			{!imageLink && (
				<Box sx={{ cursor: "pointer", userSelect: "none" }}>
					<Typography gutterBottom>Poster</Typography>
					<Box
						sx={{
							border: "2px dashed #eeeeee",
							borderRadius: "2px",
							textAlign: "center",
							padding: "20px",
							background: "#fff",
							position: "relative"
						}}
						{...getRootProps({
							className: "dropzone"
						})}
					>
						{isLoading && (
							<Box
								sx={{
									background: "#fff",
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%"
								}}
							>
								<Box
									sx={{
										position: "absolute",
										top: "50%",
										left: "50%",
										transform: "translate(-50%, -50%)",
										width: "30px",
										height: "30px"
									}}
								>
									<CircularProgress size={30} />
								</Box>
							</Box>
						)}
						<input {...getInputProps({})} />
						<p>Drag 'n' drop some files here, or click to select files</p>
					</Box>
				</Box>
			)}
			{imageLink && (
				<Box>
					<Typography gutterBottom>Image preview</Typography>
					<Box
						sx={{
							width: "500px",
							paddingTop: "100%",
							overflow: "hidden",
							position: "relative",
							"& > img": {
								width: "100%",
								height: "100%",
								objectFit: "cover",
								position: "absolute",
								top: 0,
								left: 0
							}
						}}
					>
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
							onClick={() => {
								setImageLink(null);
								handleImageLink(null);
							}}
						>
							<CloseIcon />
						</ButtonBase>
						<img src={imageLink} alt='preview' />
					</Box>
				</Box>
			)}
		</Box>
	);
};
