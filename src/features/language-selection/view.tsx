import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { FC } from "react";
import { useLanguagesStore } from "@/app/store";

type Props = {
	value?: number | undefined;
	onChange: (value: number) => void;
	defaultValue?: number;
	statusByLanguageId?: Record<number, "complete" | "partial" | "empty">;
};

export const LanguageSelection: FC<Props> = ({
	value,
	onChange,
	defaultValue,
	statusByLanguageId
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
					const status = statusByLanguageId?.[value.language_id];
					return (
						<ToggleButton
							key={value.language_id}
							value={value.language_id}
							sx={{
								backgroundColor:
									status === "complete"
										? "#e8f5e9"
										: status === "partial"
											? "#fff3e0"
											: undefined,
								"&:hover": {
									backgroundColor:
										status === "complete"
											? "#dcedc8"
											: status === "partial"
												? "#ffe0b2"
												: undefined
								},
								"&.Mui-selected": {
									backgroundColor:
										status === "complete"
											? "#c8e6c9"
											: status === "partial"
												? "#ffd59f"
												: undefined
								}
							}}
						>
							{value.language_code}
						</ToggleButton>
					);
				})}
			</ToggleButtonGroup>
		</Box>
	);
};
