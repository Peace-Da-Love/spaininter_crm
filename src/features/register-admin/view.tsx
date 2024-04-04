import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	TextField,
	DialogActions,
	Typography,
	CircularProgress
} from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks";
import { authModel, IRegisterDto } from "@/app/models/auth-model";
import { schema } from "./model.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

export const RegisterAdmin = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const queryClient = useQueryClient();
	const toast = useToast();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema)
	});
	const { mutate, isPending } = useMutation({
		mutationKey: ["register-admin-key"],
		mutationFn: (dto: IRegisterDto) => authModel.register(dto),
		onSuccess: async () => {
			setIsOpen(false);
			toast.success("Admin registered successfully");
			reset();
		},
		onError: () => {
			toast.error("Failed to register admin");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["admins-key"] });
		}
	});

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => {
		if (isPending) return;
		setIsOpen(false);
	};

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = data => {
		mutate(data);
	};

	return (
		<>
			<Button
				sx={{
					display: "inline-flex",
					gap: pxToRem(6),
					textDecoration: "none"
				}}
				onClick={handleOpen}
				variant={"contained"}
			>
				Add admin <AddIcon />
			</Button>
			<Dialog open={isOpen} onClose={handleClose}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogTitle>Register admin</DialogTitle>
					<DialogContent>
						<Typography mb={pxToRem(15)}>
							Enter the admin ID to register a new admin
						</Typography>
						<TextField
							{...register("tg_id")}
							label='Admin ID'
							type='number'
							variant='outlined'
							margin='normal'
							error={!!errors.tg_id}
							helperText={errors.tg_id?.message}
						/>
					</DialogContent>
					<DialogActions>
						<Button disabled={isPending} onClick={handleClose}>
							Cancel
						</Button>
						<Button disabled={isPending} type='submit'>
							{isPending ? <CircularProgress size={20} /> : "Register"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</>
	);
};
