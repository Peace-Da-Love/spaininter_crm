import { forwardRef } from "react";
import {
	Box,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select,
	Skeleton,
	Typography
} from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { useQuery } from "@tanstack/react-query";
import { hashtagsModel } from "@/app/models/hashtags-model";

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
	error: boolean;
	helperText?: string;
};

export const SelectHashtag = forwardRef<HTMLDivElement, Props>(
	({ error, helperText, ...props }, ref) => {
		const { data, isLoading, isError } = useQuery({
			queryKey: ["get-hashtags-key"],
			queryFn: () => hashtagsModel.getHashtags()
		});

		if (isError) {
			return <Typography>Error loading hashtags</Typography>;
		}

		return (
			<Box sx={{ marginBottom: pxToRem(20) }}>
				{isLoading && (
					<Skeleton
						variant='rectangular'
						width={300}
						height={56}
						sx={{
							borderRadius: "4px"
						}}
					/>
				)}
				{!isLoading && (
					<FormControl error={error} sx={{ width: 300 }}>
						<InputLabel id='demo-multiple-name-label'>
							Select Hashtag
						</InputLabel>
						<Select
							labelId='demo-multiple-name-label'
							id='demo-multiple-name'
							input={<OutlinedInput label='Select Hashtag' />}
							MenuProps={MenuProps}
							ref={ref}
							{...props}
						>
							{data &&
								data.data.data.hashtags.map(hashtag => {
									return (
										<MenuItem
											key={hashtag.hashtag_id}
											value={hashtag.hashtag_id.toString()}
										>
											{hashtag.hashtag_name}
										</MenuItem>
									);
								})}
						</Select>
						{error && <FormHelperText>{helperText}</FormHelperText>}
					</FormControl>
				)}
			</Box>
		);
	}
);
