import { forwardRef, useEffect, useMemo, useState } from "react";
import {
	Autocomplete,
	CircularProgress,
	TextField,
	Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { citiesModel } from "@/widgets/cities-table/model";

type Props = {
	error?: boolean;
	helperText?: string;
	value?: string;
	onChange?: (value: string) => void;
};

export const SelectCity = forwardRef<HTMLDivElement, Props>(
	({ error, helperText, value, onChange, ...props }, ref) => {
		const [search, setSearch] = useState<string>("");

		useEffect(() => {
			if (value && value.length >= 3) {
				setSearch(value);
			}
		}, [value]);

		const { data, isLoading, isError } = useQuery({
			queryKey: ["cities-key", { page: 1, limit: 50, search }],
			queryFn: () => citiesModel.getCities({ page: 1, limit: 50, search }),
			enabled: search.length >= 3 // Запрос отправляется только при 3+ символах
		});

		if (isError) {
			return <Typography color="error">Error loading cities</Typography>;
		}

		const cities = data?.data.data.rows || [];
		const options = useMemo(() => {
			if (!value) return cities;
			const hasValue = cities.some(city => city.name === value);
			if (hasValue) return cities;
			return [
				{
					id: "current",
					name: value,
					photo_url: null,
					links: [],
					created_at: "",
					updated_at: ""
				},
				...cities
			];
		}, [cities, value]);
		const selectedCity = options.find(city => city.name === value) || null;

		return (
			<Autocomplete
				{...props}
				ref={ref}
				options={options}
				getOptionLabel={option => option.name}
				onInputChange={(_, newInputValue) => {
					setSearch(newInputValue);
				}}
				onChange={(_, newValue) => {
					if (onChange) {
						onChange(newValue ? newValue.name : "");
					}
				}}
				filterOptions={options => options}
				loading={isLoading}
				value={selectedCity}
				noOptionsText={
					search.length < 3
						? "Type at least 3 characters"
						: "No cities found"
				}
				renderInput={params => (
					<TextField
						{...params}
						placeholder="City"
						error={error}
						helperText={helperText}
						fullWidth
						InputProps={{
							...params.InputProps,
							endAdornment: (
								<>
									{isLoading ? (
										<CircularProgress color="inherit" size={20} />
									) : null}
									{params.InputProps.endAdornment}
								</>
							)
						}}
					/>
				)}
			/>
		);
	}
);

SelectCity.displayName = "SelectCity";

