import { AxiosResponse } from "axios";
import { IResponse } from "@/app/types";

export interface ILoginSuccess extends IResponse {
	data: {
		accessToken: string;
	};
}

export interface IAdminsSuccess extends IResponse {
	data: {
		count: number;
		admins: IAdmin[];
	};
}

export interface ICreatorsSuccess extends IResponse {
	data: {
		count: number;
		creators: IAdmin[];
	};
}

interface IAdmin {
	id: number;
	tg_id: number;
	createdAt: string;
}

export interface IRegisterDto {
	tg_id: number;
}

export type IAuthResponse = Promise<AxiosResponse<ILoginSuccess>>;
export type IAdminsResponse = Promise<AxiosResponse<IAdminsSuccess>>;
export type ICreatorsResponse = Promise<AxiosResponse<ICreatorsSuccess>>;
