import { hashtagsModel } from "@/app/models/hashtags-model";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, Fragment, useState } from "react";
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
	hashtagId: number;
};

export const DeleteHashtag: FC<Props> = ({ hashtagId }) => {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const toast = useToast();
	const { mutate, isPending } = useMutation({
		mutationKey: ["delete-hashtag-admin-key"],
		mutationFn: (id: number) =>
			hashtagsModel.deleteHashtag(id),
		onSuccess: async () => {
			setIsOpen(false);
			toast.success("Hashtag deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete hashtag");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-hashtags-table-key"] });
		}
	});

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => {
		if (isPending) return;
		setIsOpen(false);
	};
	const handleDelete = () => {
		mutate(hashtagId);
	};

	return (
		<Fragment>
			<ButtonBase
				title='Delete hashtag'
				onClick={handleOpen}
				sx={{ color: "#FF6B6B" }}
			>
				<DeleteIcon />
			</ButtonBase>
			<Dialog open={isOpen} onClose={handleClose}>
				<DialogTitle>Delete hashtag from ID {hashtagId}?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						If you delete the hashtag from the database, it will be lost
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
