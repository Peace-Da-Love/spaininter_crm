import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { languageModel } from "@/app/models/language-model";
import { pxToRem } from "@/shared/css-utils";
import { FC } from "react";
import { useNewsStore } from "@/app/store";

type Props = {
	value: number;
	onChange: (id: number) => void;
};

export const LanguageSelection: FC<Props> = ({ value, onChange }) => {
	const { setLanguages } = useNewsStore();
	const { data, isLoading } = useQuery({
		queryKey: ["languages-key"],
		queryFn: () =>
			languageModel().then(res => {
				setLanguages(res.data.data.languages);
				return res;
			})
	});

	const handleAlignment = (
		_event: React.MouseEvent<HTMLElement>,
		newAlignment: number | null
	) => {
		if (newAlignment !== null) {
			onChange(newAlignment);
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<ToggleButtonGroup
			value={value}
			exclusive
			onChange={handleAlignment}
			aria-label='text alignment'
			sx={{ marginBottom: pxToRem(20) }}
		>
			{data &&
				data.data.data.languages.map(lang => {
					return (
						<ToggleButton
							key={lang.language_id}
							value={lang.language_id}
							aria-label={lang.language_code}
						>
							{lang.language_code}
						</ToggleButton>
					);
				})}
		</ToggleButtonGroup>
	);
};
