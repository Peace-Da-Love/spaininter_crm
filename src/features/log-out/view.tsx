import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
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
	const { mutate } = useMutation({
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
	const handleClose = () => setIsOpen(false);
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
					<Button onClick={handleClose}>Cancel</Button>
					<Button sx={{ color: "#FF6B6B" }} onClick={handleLogOut}>
						Log Out
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
