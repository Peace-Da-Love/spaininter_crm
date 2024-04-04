import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { FC } from "react";
import { useLanguagesStore } from "@/app/store";

type Props = {
	value: number;
	onChange: (value: number) => void;
	defaultValue?: number;
};

export const LanguageSelection: FC<Props> = ({
	value,
	onChange,
	defaultValue
}) => {
	const { languages } = useLanguagesStore();

	const handleAlignment = (
		_event: React.MouseEvent<HTMLElement>,
		newAlignment: number | null
	) => {
		if (newAlignment !== null) {
			onChange(newAlignment);
		}
	};

	return (
		<Box sx={{ marginBottom: pxToRem(20) }}>
			<ToggleButtonGroup
				value={value}
				exclusive
				onChange={handleAlignment}
				aria-label='text alignment'
				defaultValue={defaultValue}
			>
				{languages?.map(value => {
					return (
						<ToggleButton key={value.language_id} value={value.language_id}>
							{value.language_code}
						</ToggleButton>
					);
				})}
			</ToggleButtonGroup>
		</Box>
	);
};
