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
import { FC, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteModel, DeleteParams } from "./model.ts";
import { useToast } from "@/shared/hooks";

type Props = {
	newsId: number;
};

export const DeleteNews: FC<Props> = ({ newsId }) => {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const toast = useToast();
	const { mutate, isPending } = useMutation({
		mutationKey: ["delete-news"],
		mutationFn: (dto: DeleteParams) => deleteModel(dto),
		onSuccess: async () => {
			setIsOpen(false);
			toast.success("News deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete news");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["news-key"] });
		}
	});

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => {
		if (isPending) return;
		setIsOpen(false);
	};
	const handleDelete = () => {
		const dto: DeleteParams = { news_id: newsId };
		mutate(dto);
	};

	return (
		<>
			<ButtonBase onClick={handleOpen} sx={{ color: "#FF6B6B" }}>
				<DeleteIcon />
			</ButtonBase>
			<Dialog open={isOpen} onClose={handleClose}>
				<DialogTitle id='alert-dialog-title'>
					Delete news from ID {newsId}?
				</DialogTitle>
				<DialogContent>
					<DialogContentText id='alert-dialog-description'>
						If you delete the news from the database, it will be lost forever.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button disabled={isPending} onClick={handleClose}>
						Cancel
					</Button>
					<Button
						disabled={isPending}
						sx={{ color: "#FF6B6B" }}
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
