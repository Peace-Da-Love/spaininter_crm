import { forwardRef, useMemo, useState, SyntheticEvent } from "react";
import {
	Autocomplete,
	AutocompleteRenderInputParams,
	CircularProgress,
	TextField,
	Box,
	Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { categoriesModel } from "@/app/models/categories-model";

type Props = {
	error?: boolean;
	helperText?: string;
	value?: string;
	onChange?: (value: string | null) => void;
	label?: string;
};

export const CategoryAutocomplete = forwardRef<HTMLDivElement, Props>(
	(
		{
			error,
			helperText,
			value,
			onChange,
			label = "Category"
		},
		ref
	) => {
		const [inputValue, setInputValue] = useState<string>(value || "");

		const { data, isLoading, isError } = useQuery({
			queryKey: ["get-categories-autocomplete"],
			queryFn: () => categoriesModel.getCategories()
		});

		const categories = data?.data.data.categories || [];

		// Фильтруем категории по введенному тексту
		const filteredOptions = useMemo(() => {
			if (!inputValue) return categories.map(cat => cat.category_name);

			const lowerInput = inputValue.toLowerCase();
			const filtered = categories
				.filter(cat =>
					cat.category_name.toLowerCase().startsWith(lowerInput)
				)
				.map(cat => cat.category_name);

			// Если введённый текст не совпадает ни с одной категорией и валиден,
			// добавляем его как опцию для создания новой категории
			if (
				filtered.length === 0 &&
				/^[a-z0-9_]{2,50}$/.test(inputValue)
			) {
				return [inputValue];
			}

			return filtered;
		}, [inputValue, categories]);

		if (isError) {
			return (
				<Box sx={{ mb: 2 }}>
					<Typography color='error'>Error loading categories</Typography>
				</Box>
			);
		}

		return (
			<Box ref={ref} sx={{ mb: 2 }}>
				<Autocomplete
					freeSolo
					options={filteredOptions}
					value={value || null}
					inputValue={inputValue}
					onInputChange={(_event: SyntheticEvent, newInputValue: string) => {
						// Только обновляем inputValue, не меняем value до выбора
						setInputValue(newInputValue);
					}}
					onChange={(_event: SyntheticEvent, newValue: string | null) => {
						// Когда пользователь выбирает из списка или подтверждает ввод
						if (newValue) {
							setInputValue(newValue);
							onChange?.(newValue);
						}
					}}
					loading={isLoading}
					disabled={isLoading}
					renderInput={(params: AutocompleteRenderInputParams) => (
						<TextField
							{...params}
							label={label}
							placeholder='tech_news'
							error={error}
							helperText={
								error
									? helperText
									: "Type category name or select from list"
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
						inputValue && /^[a-z0-9_]{2,50}$/.test(inputValue)
							? "Create new category"
							: "No categories found"
					}
				/>
				{inputValue && !/^[a-z0-9_]{2,50}$/.test(inputValue) && (
					<Typography
						variant='caption'
						sx={{ color: '#d32f2f', display: 'block', mt: 0.5 }}
					>
						Only lowercase letters, numbers, and underscores (2-50 chars)
					</Typography>
				)}
			</Box>
		);
	}
);

CategoryAutocomplete.displayName = "CategoryAutocomplete";
