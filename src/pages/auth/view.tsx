import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { LoginDto, loginModel } from "./model.ts";
import Cookies from "js-cookie";

export const AuthPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { mutate } = useMutation({
		mutationFn: (dto: LoginDto) => loginModel(dto),
		onSuccess: data => {
			const accessToken = data.data.data.accessToken;
      Cookies.set("access_token", accessToken);
			navigate("/");
		},
		onError: error => {
			console.log(error);
		}
	});

	useEffect(() => {
		const validate = () => {
			const hash = searchParams.get("hash");
			const id = searchParams.get("id");
			const first_name = searchParams.get("first_name");
			const last_name = searchParams.get("last_name");
			const username = searchParams.get("username");
			const photo_url = searchParams.get("photo_url");
			const auth_date = searchParams.get("auth_date");

			if (!hash || !id || !first_name || !auth_date) navigate("/");
			else {
				const dto: Partial<LoginDto> = {
					hash,
					id,
					first_name,
					auth_date
				};

				if (last_name) dto.last_name = last_name;
				if (username) dto.username = username;
				if (photo_url) dto.photo_url = photo_url;

				mutate(dto as LoginDto);
			}
		};
		validate();
	}, [searchParams]);

	return (
		<CircularProgress
			sx={{
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)"
			}}
		/>
	);
};
