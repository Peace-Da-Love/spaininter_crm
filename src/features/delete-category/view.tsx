import { categoriesModel } from "@/app/models/categories-model";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
import { useToast } from "@/shared/hooks";
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
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
	categoryId: number;
};

export const DeleteCategory: FC<Props> = ({ categoryId }) => {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const toast = useToast();
	const { mutate, isPending } = useMutation({
		mutationKey: ["delete-admin-ke"],
		mutationFn: (categoryId: number) =>
			categoriesModel.deleteCategory(categoryId),
		onSuccess: async () => {
			setIsOpen(false);
			toast.success("Admin deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete admin");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-categories-table-key"] });
		}
	});

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => {
		if (isPending) return;
		setIsOpen(false);
	};
	const handleDelete = () => {
		mutate(categoryId);
	};

	return (
		<>
			<ButtonBase onClick={handleOpen} sx={{ color: "#FF6B6B" }}>
				<DeleteIcon />
			</ButtonBase>
			<Dialog open={isOpen} onClose={handleClose}>
				<DialogTitle>Delete category from ID {categoryId}?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						If you delete the category from the database, it will be lost
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
		</>
	);
};
