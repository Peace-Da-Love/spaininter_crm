import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { citiesModel, City } from "./model";
import {
	Box,
	Button,
	Skeleton,
	TableContainer,
	TablePagination,
	Link,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	CircularProgress,
	TextField
} from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useToast } from "@/shared/hooks";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";

const BASE_URL = import.meta.env.VITE_API_URL;

const linkSchema = z.object({
	name: z.string().min(1, "Link name is required"),
	url: z.string().url("Invalid URL")
});

const photoSchema = z.object({
	photo: z
		.instanceof(File)
		.refine(file => file instanceof File, "Photo is required")
});

export const CitiesTable = () => {
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const [addLinkOpen, setAddLinkOpen] = useState<string | null>(null);
	const [changePhotoOpen, setChangePhotoOpen] = useState<string | null>(null);
	const queryClient = useQueryClient();
	const toast = useToast();

	const { data, isLoading, isError } = useQuery({
		queryKey: ["cities-key", { page, limit }],
		queryFn: () => citiesModel.getCities({ page, limit, hasPhoto: true }) // Добавляем hasPhoto: true
	});

	const {
		register: registerLink,
		handleSubmit: handleSubmitLink,
		reset: resetLink,
		formState: { errors: linkErrors }
	} = useForm<z.infer<typeof linkSchema>>({
		resolver: zodResolver(linkSchema)
	});

	const {
		handleSubmit: handleSubmitPhoto,
		reset: resetPhoto,
		setValue,
		formState: { errors: photoErrors }
	} = useForm<z.infer<typeof photoSchema>>({
		resolver: zodResolver(photoSchema)
	});

	const { mutate: addLink, isPending: isLinkPending } = useMutation({
		mutationFn: (data: { name: string; url: string; cityId: string }) =>
			citiesModel.addLink(data),
		onSuccess: () => {
			setAddLinkOpen(null);
			toast.success("Link added successfully");
			resetLink();
			queryClient.invalidateQueries({ queryKey: ["cities-key"] });
		},
		onError: error => {
			console.error("Failed to add link:", error);
			toast.error("Failed to add link");
		}
	});

	const { mutate: changePhoto, isPending: isPhotoPending } = useMutation({
		mutationFn: ({
			cityId,
			formData
		}: {
			cityId: string;
			formData: FormData;
		}) => citiesModel.updatePhoto(cityId, formData),
		onSuccess: () => {
			setChangePhotoOpen(null);
			toast.success("Photo updated successfully");
			resetPhoto();
			acceptedFiles.length = 0; // Очищаем массив
			queryClient.invalidateQueries({ queryKey: ["cities-key"] });
		},
		onError: error => {
			console.error("Failed to update photo:", error);
			toast.error("Failed to update photo");
		}
	});

	const { mutate: deleteLink } = useMutation({
		mutationFn: ({ cityId, linkId }: { cityId: string; linkId: string }) =>
			citiesModel.deleteLink(cityId, linkId),
		onSuccess: () => {
			toast.success("Link deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["cities-key"] });
		},
		onError: error => {
			console.error("Failed to delete link:", error);
			toast.error("Failed to delete link");
		}
	});

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage + 1);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setLimit(+event.target.value);
		setPage(1);
	};

	const onSubmitLink: SubmitHandler<z.infer<typeof linkSchema>> = data => {
		if (addLinkOpen) {
			addLink({ ...data, cityId: addLinkOpen });
		}
	};

	const onSubmitPhoto: SubmitHandler<z.infer<typeof photoSchema>> = data => {
		if (changePhotoOpen) {
			const formData = new FormData();
			formData.append("photo", data.photo);
			changePhoto({ cityId: changePhotoOpen, formData });
		}
	};

	const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
		accept: { "image/*": [] },
		maxFiles: 1,
		onDrop: acceptedFiles => {
			if (acceptedFiles.length > 0) {
				setValue("photo", acceptedFiles[0], { shouldValidate: true });
			}
		}
	});

	const handleClosePhoto = () => {
		setChangePhotoOpen(null);
		resetPhoto();
		acceptedFiles.length = 0; // Очищаем массив
	};

	if (isError) return <div>Error!</div>;

	const loadingRow = [...Array(limit)].map((_item, index) => (
		<TableRow key={`Loading row - ${index}`}>
			<TableCell>
				<Skeleton variant='rounded' width={50} height={20} />
			</TableCell>
			<TableCell>
				<Skeleton variant='rounded' width={100} height={20} />
			</TableCell>
			<TableCell>
				<Skeleton variant='rounded' width={80} height={80} />
			</TableCell>
			<TableCell>
				<Skeleton variant='rounded' width={200} height={20} />
			</TableCell>
			<TableCell>
				<Skeleton variant='rounded' width={100} height={20} />
			</TableCell>
		</TableRow>
	));

	return (
		<>
			<TableContainer component={Paper} sx={{ boxShadow: "none" }}>
				<Table sx={{ minWidth: 650 }}>
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Photo</TableCell>
							<TableCell>Links</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{data && !isLoading ? (
							data.data.data.rows.length > 0 ? (
								data.data.data.rows.map((city: City) => (
									<TableRow hover key={city.id}>
										<TableCell>{city.id}</TableCell>
										<TableCell>{city.name}</TableCell>
										<TableCell>
											{city.photo_url ? (
												<img
													src={`${BASE_URL}${city.photo_url}`}
													alt={city.name}
													style={{
														width: "80px",
														height: "80px",
														objectFit: "cover",
														borderRadius: "8px"
													}}
													onError={e =>
														console.log(
															"Image load error for:",
															city.photo_url,
															e
														)
													}
												/>
											) : (
												"No photo"
											)}
										</TableCell>
										<TableCell>
											<Box
												display='flex'
												flexDirection='column'
												gap={pxToRem(5)}
											>
												{city.links.map(link => (
													<Box
														key={link.id}
														display='flex'
														alignItems='center'
														gap={pxToRem(10)}
													>
														<Link
															href={link.url}
															target='_blank'
															sx={{ color: "#434C6F" }}
														>
															{link.name.length > 30
																? `${link.name.slice(0, 30)}...`
																: link.name}
														</Link>
														<Button
															size='small'
															color='error'
															onClick={() =>
																deleteLink({
																	cityId: city.id.toString(),
																	linkId: link.id
																})
															}
														>
															<DeleteIcon />
														</Button>
													</Box>
												))}
											</Box>
										</TableCell>
										<TableCell>
											<Box display='flex' alignItems='center' gap={pxToRem(10)}>
												<Button
													variant='outlined'
													size='small'
													onClick={() => setChangePhotoOpen(city.id.toString())}
												>
													<EditIcon /> Change Photo
												</Button>
												<Button
													variant='contained'
													size='small'
													onClick={() => setAddLinkOpen(city.id.toString())}
												>
													<AddIcon /> Add Link
												</Button>
											</Box>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={5} align='center'>
										No cities found
									</TableCell>
								</TableRow>
							)
						) : (
							loadingRow
						)}
					</TableBody>
				</Table>
				{data && !isLoading && (
					<TablePagination
						rowsPerPageOptions={[10, 25, 100]}
						component='div'
						count={data.data.data.count}
						rowsPerPage={limit}
						page={page - 1}
						onRowsPerPageChange={handleChangeRowsPerPage}
						onPageChange={handleChangePage}
					/>
				)}
			</TableContainer>

			{/* Dialog для добавления ссылки */}
			<Dialog open={addLinkOpen !== null} onClose={() => setAddLinkOpen(null)}>
				<form onSubmit={handleSubmitLink(onSubmitLink)}>
					<DialogTitle>Add Link to City</DialogTitle>
					<DialogContent>
						<TextField
							label='Link Name'
							fullWidth
							{...registerLink("name")}
							error={!!linkErrors.name}
							helperText={linkErrors.name?.message}
							sx={{ mb: pxToRem(15) }}
						/>
						<TextField
							label='URL'
							fullWidth
							{...registerLink("url")}
							error={!!linkErrors.url}
							helperText={linkErrors.url?.message}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setAddLinkOpen(null)}>Cancel</Button>
						<Button type='submit' disabled={isLinkPending}>
							{isLinkPending ? <CircularProgress size={20} /> : "Add"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			{/* Dialog для изменения фото */}
			<Dialog open={changePhotoOpen !== null} onClose={handleClosePhoto}>
				<form onSubmit={handleSubmitPhoto(onSubmitPhoto)}>
					<DialogTitle>Change Photo for City</DialogTitle>
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
									<Typography variant='body2' color='text.secondary'>
										{acceptedFiles[0].name}
									</Typography>
									<Box mt={2}>
										<img
											src={URL.createObjectURL(acceptedFiles[0])}
											alt='Preview'
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
								<Typography variant='body1' color='text.secondary'>
									Drag and drop an image here, or click to select
								</Typography>
							)}
							{photoErrors.photo && (
								<Typography color='error' variant='caption' mt={1}>
									{photoErrors.photo.message}
								</Typography>
							)}
						</Box>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClosePhoto}>Cancel</Button>
						<Button type='submit' disabled={isPhotoPending}>
							{isPhotoPending ? <CircularProgress size={20} /> : "Update"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</>
	);
};
