import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogTitle
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authModel } from "@/app/models/auth-model";
import { useToast } from "@/shared/hooks";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export const LogOut = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const navigate = useNavigate();
	const toast = useToast();
	const { mutate, isPending } = useMutation({
		mutationKey: ["log-out-key"],
		mutationFn: () => authModel.logOut(),
		onSuccess: () => {
			setIsOpen(false);
			Cookies.remove("access_token");
			navigate("/login");
			toast.success("Logged out successfully");
		},
		onError: () => {
			toast.error("Failed to log out");
		}
	});

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => {
		if (isPending) return;
		setIsOpen(false);
	};
	const handleLogOut = () => {
		mutate();
	};

	return (
		<>
			<Button sx={{ color: "#FF6B6B" }} onClick={handleOpen}>
				<LogoutIcon />
			</Button>
			<Dialog open={isOpen} onClose={handleClose}>
				<DialogTitle>Are you sure you want to log out?</DialogTitle>
				<DialogActions>
					<Button disabled={isPending} onClick={handleClose}>
						Cancel
					</Button>
					<Button
						disabled={isPending}
						sx={{ color: "#FF6B6B" }}
						onClick={handleLogOut}
					>
						{isPending ? <CircularProgress size={20} /> : "Log out"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
