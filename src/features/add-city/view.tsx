import { Fragment, useState } from "react";
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	Box,
	Autocomplete,
	TextField
} from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import AddIcon from "@mui/icons-material/Add";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { citiesModel } from "@/widgets/cities-table/model";
import { useDropzone } from "react-dropzone";

// Схема валидации
const schema = z.object({
	cityId: z.string().min(1, "City is required"),
	photo: z
		.instanceof(File)
		.refine(file => file instanceof File, "Image is required")
});

type FormData = z.infer<typeof schema>;

export const AddCity = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [search, setSearch] = useState<string>(""); // Состояние для поиска
	const queryClient = useQueryClient();
	const toast = useToast();

	const { data: cities, isLoading: isCitiesLoading } = useQuery({
		queryKey: ["cities-key", { page: 1, limit: 50, search }],
		queryFn: () => citiesModel.getCities({ page: 1, limit: 50, search }),
		enabled: search.length >= 3 // Запрос отправляется только при 3+ символах
	});

	const {
		handleSubmit,
		reset,
		setValue,
		formState: { errors }
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			cityId: "",
			photo: undefined
		}
	});

	const { mutate, isPending } = useMutation({
		mutationKey: ["add-city-img-key"],
		mutationFn: (data: { cityId: string; photo: File }) => {
			const formData = new FormData();
			formData.append("photo", data.photo);
			return citiesModel.updatePhoto(data.cityId, formData);
		},
		onSuccess: () => {
			setIsOpen(false);
			toast.success("City updated successfully");
			reset();
			setSearch("");
			queryClient.invalidateQueries({ queryKey: ["cities-key"] });
		},
		onError: () => {
			toast.error("Can't update city");
		}
	});

	const handleOpen = () => {
		setIsOpen(true);
		setValue("cityId", "");
		setSearch("");
	};

	const handleClose = () => {
		if (isPending) return;
		setIsOpen(false);
		reset();
		setSearch("");
	};

	const onSubmit: SubmitHandler<FormData> = data => {
		mutate({ cityId: data.cityId, photo: data.photo });
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

	return (
		<Fragment>
			<Button
				sx={{ display: "inline-flex", gap: pxToRem(6), textDecoration: "none" }}
				onClick={handleOpen}
				variant='contained'
				color='primary'
			>
				Add City <AddIcon />
			</Button>
			<Dialog open={isOpen} onClose={handleClose} maxWidth='sm' fullWidth>
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogTitle>Add City</DialogTitle>
					<DialogContent>
						<Autocomplete
							options={cities?.data.data.rows || []}
							getOptionLabel={option => option.name}
							onInputChange={(_, newInputValue) => {
								setSearch(newInputValue);
							}}
							onChange={(_, newValue) => {
								setValue("cityId", newValue ? newValue.id.toString() : "", {
									shouldValidate: true
								});
							}}
							filterOptions={options => options}
							loading={isCitiesLoading}
							noOptionsText={
								search.length < 3
									? "Type at least 3 characters"
									: "No cities found"
							}
							renderInput={params => (
								<TextField
									{...params}
									label='Search cities'
									error={!!errors.cityId}
									helperText={errors.cityId?.message}
									sx={{ mb: pxToRem(15) }}
								/>
							)}
						/>

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
							{errors.photo && (
								<Typography color='error' variant='caption' mt={1}>
									{errors.photo.message}
								</Typography>
							)}
						</Box>
					</DialogContent>
					<DialogActions sx={{ padding: pxToRem(20) }}>
						<Button
							onClick={handleClose}
							variant='outlined'
							color='secondary'
							sx={{ borderRadius: "20px", padding: "6px 16px" }}
						>
							Cancel
						</Button>
						<Button
							type='submit'
							variant='contained'
							color='primary'
							disabled={isPending}
							sx={{ borderRadius: "20px", padding: "6px 16px" }}
						>
							{isPending ? <CircularProgress size={20} /> : "Add"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</Fragment>
	);
};
