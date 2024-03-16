import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	TextField,
	DialogActions,
	Typography
} from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks";
import { authModel, IRegisterDto } from "@/app/models/auth-model";

export const RegisterAdmin = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [value, setValue] = useState<string>("");
	const queryClient = useQueryClient();
	const toast = useToast();
	const { mutate } = useMutation({
		mutationKey: ["register-admin-key"],
		mutationFn: (dto: IRegisterDto) => authModel.register(dto),
		onSuccess: async () => {
			setIsOpen(false);
			toast.success("Admin registered successfully");
		},
		onError: () => {
			toast.error("Failed to register admin");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["admins-key"] });
		}
	});

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => setIsOpen(false);
	const handleRegister = () => {
		if (value.length === 0) {
			toast.error("Admin ID is required");
			return;
		}
		if (value.length < 5) {
			toast.error("Admin ID is too short");
			return;
		}
		mutate({ tg_id: parseInt(value) });
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
				<DialogTitle>Register admin</DialogTitle>
				<DialogContent>
					<Typography mb={pxToRem(15)}>
						Enter the admin ID to register a new admin
					</Typography>
					<TextField
						type={"number"}
						label={"Admin ID"}
						value={value}
						onChange={e => setValue(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleRegister}>Register</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
