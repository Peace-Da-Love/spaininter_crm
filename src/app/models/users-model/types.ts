import { AxiosResponse } from "axios";
import { IResponse } from "@/app/types";

export interface IUser {
	id: number;
	tg_id: string;
	username?: string | null;
	first_name?: string | null;
	last_name?: string | null;
	photo_url?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface IUsersSuccess extends IResponse {
	data: {
		count: number;
		users: IUser[];
	};
}

export type IUsersResponse = Promise<AxiosResponse<IUsersSuccess>>;
