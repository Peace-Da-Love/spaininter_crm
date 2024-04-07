import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schema } from "./model.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { authModel, IRegisterDto } from "@/app/models/auth-model";
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography
} from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import AddIcon from "@mui/icons-material/Add";

export const RegisterCreator = () => {
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
		mutationKey: ["register-creator-key"],
		mutationFn: (dto: IRegisterDto) => authModel.registerCreator(dto),
		onSuccess: async () => {
			setIsOpen(false);
			toast.success("Creator registered successfully");
			reset();
		},
		onError: () => {
			toast.error("Failed to register creator");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["creators-key"] });
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
				Add creator <AddIcon />
			</Button>
			<Dialog open={isOpen} onClose={handleClose}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogTitle>Register creator</DialogTitle>
					<DialogContent>
						<Typography mb={pxToRem(15)}>
							Enter the creator ID to register a new creator
						</Typography>
						<TextField
							{...register("tg_id")}
							label='Creator ID'
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
