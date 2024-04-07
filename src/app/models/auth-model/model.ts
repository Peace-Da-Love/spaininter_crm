import {
	IAdminsResponse,
	IAuthResponse,
	ICreatorsResponse,
	IRegisterDto
} from "./types.ts";
import { $api } from "@/app/api";
import { IPaginationParams } from "@/app/types/IPaginationParams.ts";
import { AxiosResponse } from "axios";
import { IResponse } from "@/app/types";

class Model {
	public refresh = async (): IAuthResponse => {
		return $api.get("/auth/refresh");
	};

	public logOut = async () => {
		return $api.delete("/auth/logout");
	};

	public registerAdmin = async (
		dto: IRegisterDto
	): Promise<AxiosResponse<IResponse>> => {
		return $api.post("/auth/register-admin", dto);
	};

	public registerCreator = async (
		dto: IRegisterDto
	): Promise<AxiosResponse<IResponse>> => {
		return $api.post("/auth/register-creator", dto);
	};

	public getAdmins = async (params: IPaginationParams): IAdminsResponse => {
		return $api.get("/auth/admins", {
			params: {
				...params
			}
		});
	};

	public getCreators = async (params: IPaginationParams): ICreatorsResponse => {
		return $api.get("/auth/creators", {
			params: {
				...params
			}
		});
	};

	public deleteAdmin = async (
		id: number
	): Promise<AxiosResponse<IResponse>> => {
		return $api.delete(`/auth/admins`, {
			params: {
				id
			}
		});
	};
}

export default new Model();
