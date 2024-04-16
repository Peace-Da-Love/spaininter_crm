import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, Fragment, useState } from "react";
import { useToast } from "@/shared/hooks";
import { channelsModel } from "@/app/models/channels-model";
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

type Props = {
	channelId: number;
};

export const DeleteChannel: FC<Props> = ({ channelId }) => {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const toast = useToast();
	const { mutate, isPending } = useMutation({
		mutationKey: ["delete-channel-ke"],
		mutationFn: (id: number) => channelsModel.delete(id),
		onSuccess: async () => {
			setIsOpen(false);
			toast.success("Channel deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete channel");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-channels-key"] });
		}
	});

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => {
		if (isPending) return;
		setIsOpen(false);
	};
	const handleDelete = () => {
		mutate(channelId);
	};

	return (
		<Fragment>
			<ButtonBase
				title='Delete channel'
				onClick={handleOpen}
				sx={{ color: "#FF6B6B" }}
			>
				<DeleteIcon />
			</ButtonBase>
			<Dialog open={isOpen} onClose={handleClose}>
				<DialogTitle>Delete channel from ID {channelId}?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						If you delete the channel from the database, it will be lost
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
