import { ButtonBase } from "@mui/material";
import { FC } from "react";
import EditNoteIcon from "@mui/icons-material/EditNote";

type Props = {
	newsId: number;
};

export const EditNews: FC<Props> = ({ newsId }) => {
	const handleEdit = () => {
		console.log(newsId);
	};

	return (
		<ButtonBase onClick={handleEdit}>
			<EditNoteIcon />
		</ButtonBase>
	);
};
