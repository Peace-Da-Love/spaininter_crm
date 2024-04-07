import DeleteIcon from "@mui/icons-material/Delete";
import {
	Button,
	ButtonBase,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle
} from "@mui/material";
import { FC, Fragment, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks";
import { authModel } from "@/app/models/auth-model";

type Props = {
	adminId: number;
};

export const DeleteAdmin: FC<Props> = ({ adminId }) => {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const toast = useToast();
	const { mutate, isPending } = useMutation({
		mutationKey: ["delete-admin-key"],
		mutationFn: (adminId: number) => authModel.deleteAdmin(adminId),
		onSuccess: async () => {
			setIsOpen(false);
			toast.success("Admin deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete admin");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["admins-key"]
			});
			queryClient.invalidateQueries({
				queryKey: ["creators-key"]
			});
		}
	});

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => {
		if (isPending) return;
		setIsOpen(false);
	};
	const handleDelete = () => {
		mutate(adminId);
	};

	return (
		<Fragment>
			<ButtonBase
				title='Delete admin/creator'
				onClick={handleOpen}
				sx={{ color: "#FF6B6B" }}
			>
				<DeleteIcon />
			</ButtonBase>
			<Dialog open={isOpen} onClose={handleClose}>
				<DialogTitle>Delete admin/creator from ID {adminId}?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						If you delete the admin/creator from the database, it will be lost
						forever.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button disabled={isPending} onClick={handleClose}>
						Cancel
					</Button>
					<Button
						sx={{ color: "#FF6B6B" }}
						disabled={isPending}
						onClick={handleDelete}
						autoFocus
					>
						{isPending ? <CircularProgress size={20} /> : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>
		</Fragment>
	);
};
