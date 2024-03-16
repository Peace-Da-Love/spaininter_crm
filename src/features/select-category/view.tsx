import {
	Box,
	FormControl,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select
} from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { useQuery } from "@tanstack/react-query";
import { categoriesModel } from "@/app/models/categories-model";
import { FC } from "react";
import { SelectChangeEvent } from "@mui/material/Select/SelectInput";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250
		}
	}
};

type Props = {
	value: string;
	onChange: (event: SelectChangeEvent, child?: React.ReactNode) => void;
};

export const SelectCategory: FC<Props> = ({ value, onChange }) => {
	const { data, isLoading } = useQuery({
		queryKey: ["get-categories-key"],
		queryFn: () => categoriesModel.getCategories()
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<Box>
			<FormControl sx={{ marginBottom: pxToRem(20), width: 300 }}>
				<InputLabel id='demo-multiple-name-label'>Select Category</InputLabel>
				<Select
					labelId='demo-multiple-name-label'
					id='demo-multiple-name'
					input={<OutlinedInput label='Select Category' />}
					MenuProps={MenuProps}
					value={value}
					onChange={onChange}
				>
					{data &&
						data.data.data.categories.map(category => {
							return (
								<MenuItem
									key={category.category_id}
									value={category.category_id.toString()}
								>
									{category.categoryTranslations[0].category_name}
								</MenuItem>
							);
						})}
				</Select>
			</FormControl>
		</Box>
	);
};
