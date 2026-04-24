import { forwardRef, SyntheticEvent, useMemo, useState } from "react";
import {
	Autocomplete,
	AutocompleteRenderInputParams,
	Box,
	Chip,
	CircularProgress,
	TextField,
	Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { hashtagsModel } from "@/app/models/hashtags-model";

type Props = {
	error?: boolean;
	helperText?: string;
	value?: string[];
	onChange?: (value: string[]) => void;
	label?: string;
};

const HASHTAG_REGEX = /^[a-z0-9_]{2,50}$/;
const normalizeHashtag = (value: string) => value.trim().toLowerCase();

export const HashtagAutocomplete = forwardRef<HTMLDivElement, Props>(
	({ error, helperText, value = [], onChange, label = "Hashtags" }, ref) => {
		const [inputValue, setInputValue] = useState("");

		const { data, isLoading, isError } = useQuery({
			queryKey: ["get-hashtags-autocomplete"],
			queryFn: () => hashtagsModel.getHashtags()
		});

		const hashtags = data?.data.data.hashtags || [];

		const filteredOptions = useMemo(() => {
			const selected = new Set(value.map(normalizeHashtag));
			const lowerInput = normalizeHashtag(inputValue);

			const filtered = hashtags
				.map(tag => tag.hashtag_name)
				.filter(name => !selected.has(normalizeHashtag(name)))
				.filter(
					name => !lowerInput || name.toLowerCase().startsWith(lowerInput)
				);

			if (
				lowerInput &&
				HASHTAG_REGEX.test(lowerInput) &&
				!selected.has(lowerInput) &&
				!hashtags.some(tag => normalizeHashtag(tag.hashtag_name) === lowerInput)
			) {
				return [lowerInput, ...filtered];
			}

			return filtered;
		}, [hashtags, inputValue, value]);

		if (isError) {
			return (
				<Box sx={{ mb: 2 }}>
					<Typography color='error'>Error loading hashtags</Typography>
				</Box>
			);
		}

		return (
			<Box ref={ref} sx={{ mb: 2 }}>
				<Autocomplete
					multiple
					freeSolo
					options={filteredOptions}
					value={value}
					inputValue={inputValue}
					onInputChange={(_event: SyntheticEvent, newInputValue: string) => {
						setInputValue(newInputValue);
					}}
					onChange={(_event: SyntheticEvent, newValue: string[]) => {
						const normalized = Array.from(
							new Set(newValue.map(normalizeHashtag).filter(Boolean))
						);
						onChange?.(normalized);
						setInputValue("");
					}}
					loading={isLoading}
					disabled={isLoading}
					renderTags={(tagValue, getTagProps) =>
						tagValue.map((option, index) => (
							<Chip
								label={option}
								{...getTagProps({ index })}
								key={option}
								size='small'
							/>
						))
					}
					renderInput={(params: AutocompleteRenderInputParams) => (
						<TextField
							{...params}
							label={label}
							placeholder={value.length ? "Add another hashtag" : "tech_news"}
							error={error}
							helperText={
								error
									? helperText
									: "Type hashtag names or select several from the list"
							}
							InputProps={{
								...params.InputProps,
								endAdornment: (
									<>
										{isLoading ? (
											<CircularProgress color='inherit' size={20} />
										) : null}
										{params.InputProps.endAdornment}
									</>
								)
							}}
						/>
					)}
					noOptionsText={
						inputValue && HASHTAG_REGEX.test(normalizeHashtag(inputValue))
							? "Create new hashtag"
							: "No hashtags found"
					}
				/>
				{inputValue && !HASHTAG_REGEX.test(normalizeHashtag(inputValue)) && (
					<Typography
						variant='caption'
						sx={{ color: "#d32f2f", display: "block", mt: 0.5 }}
					>
						Only lowercase letters, numbers, and underscores (2-50 chars)
					</Typography>
				)}
			</Box>
		);
	}
);

HashtagAutocomplete.displayName = "HashtagAutocomplete";
