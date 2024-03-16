import { $api } from "@/app/api";
import { IResponse } from "@/app/types";

export type LoginDto = {
	hash: string;
	id: string;
	auth_date?: string;
	first_name: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
};

interface ILoginResponse extends IResponse {
	data: {
		accessToken: string;
	};
}

export const loginModel = (dto: LoginDto) =>
	$api.post<ILoginResponse>("/auth/login", dto);
