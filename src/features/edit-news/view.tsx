import {
	Button,
	ButtonBase,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle
} from "@mui/material";
import { FC, Fragment, useState } from "react";
import EditNoteIcon from "@mui/icons-material/EditNote";

type Props = {
	newsId: number;
};

export const EditNews: FC<Props> = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => setIsOpen(false);

	return (
		<Fragment>
			<ButtonBase title='Edit news' onClick={handleOpen}>
				<EditNoteIcon />
			</ButtonBase>

			<Dialog open={isOpen} onClose={handleClose}>
				<DialogTitle id='alert-dialog-title'>Coming Soon.</DialogTitle>
				<DialogContent>
					<DialogContentText id='alert-dialog-description'>
						Feature will be added soon
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>OK</Button>
				</DialogActions>
			</Dialog>
		</Fragment>
	);
};
