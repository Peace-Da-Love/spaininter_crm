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
const normalizeHashtag = (value: string) =>
	value.trim().toLowerCase().replace(/\s+/g, "_");

export const HashtagAutocomplete = forwardRef<HTMLDivElement, Props>(
	({ error, helperText, value = [], onChange, label = "Hashtags" }, ref) => {
		const [inputValue, setInputValue] = useState("");

		const { data, isLoading, isError } = useQuery({
			queryKey: ["get-hashtags-autocomplete"],
			queryFn: () => hashtagsModel.getHashtags()
		});

		const hashtags = useMemo(() => data?.data.data.hashtags || [], [data]);

		const hashtagUsageByName = useMemo(() => {
			return new Map(
				hashtags.map(tag => [
					normalizeHashtag(tag.hashtag_name),
					Number(tag.news_count ?? 0)
				])
			);
		}, [hashtags]);

		const filteredOptions = useMemo(() => {
			const selected = new Set(value.map(normalizeHashtag));
			const normalizedInput = normalizeHashtag(inputValue);

			const filtered = hashtags
				.map(tag => tag.hashtag_name)
				.filter(name => !selected.has(normalizeHashtag(name)))
				.filter(
					name =>
						!normalizedInput ||
						normalizeHashtag(name).startsWith(normalizedInput)
				);

			if (
				normalizedInput &&
				HASHTAG_REGEX.test(normalizedInput) &&
				!selected.has(normalizedInput) &&
				!hashtags.some(
					tag => normalizeHashtag(tag.hashtag_name) === normalizedInput
				)
			) {
				return [normalizedInput, ...filtered];
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
					renderOption={(props, option) => {
						const usageCount =
							hashtagUsageByName.get(normalizeHashtag(option)) ?? 0;

						return (
							<li {...props}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: 2,
										width: "100%"
									}}
								>
									<Typography component='span' variant='body2'>
										{option}
									</Typography>
									<Typography
										component='span'
										variant='caption'
										color='text.secondary'
									>
										{usageCount}
									</Typography>
								</Box>
							</li>
						);
					}}
					renderInput={(params: AutocompleteRenderInputParams) => (
						<TextField
							{...params}
							label={label}
							placeholder={value.length ? "Add another hashtag" : "tech_news"}
							error={error}
							helperText={
								error
									? helperText
									: "Type hashtag names or select several from the list. Spaces become underscores"
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
