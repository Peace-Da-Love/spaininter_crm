import { Box, Button, TextField } from "@mui/material";
import { FC, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";

type Props = {
	value?: string | null;
	onChange: (value: string | null) => void;
};

export const TelegramLink: FC<Props> = ({ value, onChange }) => {
	const [isNull, setIsNull] = useState<boolean>(true);

	return (
		<Box
			sx={{
				position: "relative"
			}}
		>
			{isNull && (
				<Button
					title='Add telegram ad link'
					sx={{
						alignItems: "center"
					}}
					endIcon={<AddIcon />}
					onClick={() => setIsNull(false)}
				>
					Add telegram ad link
				</Button>
			)}
			{!isNull && (
				<>
					<TextField
						fullWidth
						placeholder='Telegram ad link'
						value={value}
						onChange={e => onChange(e.target.value)}
					/>
					<Button
						title='Set null'
						sx={{
							position: "absolute",
							right: "10px",
							top: "50%",
							transform: "translateY(-50%)",
							zIndex: "20",
							color: "#FF6B6B"
						}}
						onClick={() => {
							onChange(null);
							setIsNull(true);
						}}
					>
						<ClearIcon />
					</Button>
				</>
			)}
		</Box>
	);
};
