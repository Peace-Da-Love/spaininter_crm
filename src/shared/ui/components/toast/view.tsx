import { Alert, Snackbar, SnackbarProps } from "@mui/material";
import { FC, useState } from "react";
import { ToastMessage } from "@/shared/hooks";

export type ToastStyle = Omit<
	SnackbarProps,
	"TransitionProps" | "onClose" | "open" | "children" | "message"
>;

export type ToastProps = {
	message: ToastMessage;
	onExited: () => void;
} & ToastStyle;

// https://mui.com/material-ui/react-snackbar/#consecutive-snackbars
export const Toast: FC<ToastProps> = ({
	message,
	onExited,
	autoHideDuration,
	...props
}) => {
	const [open, setOpen] = useState<boolean>(true);

	const handleClose = (
		_event: React.SyntheticEvent | Event,
		reason?: string
	) => {
		if (reason === "clickaway") {
			return;
		}
		setOpen(false);
	};

	return (
		<Snackbar
			key={message.key}
			open={open}
			onClose={handleClose}
			TransitionProps={{ onExited }}
			anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			autoHideDuration={autoHideDuration ?? 5000}
			{...props}
		>
			<Alert severity={message.severity}>{message.message}</Alert>
		</Snackbar>
	);
};
