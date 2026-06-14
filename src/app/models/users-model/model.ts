import { $api } from "@/app/api";
import { IPaginationParams } from "@/app/types/IPaginationParams";
import { IUsersResponse } from "./types";

class Model {
	public getUsers = async (params: IPaginationParams): IUsersResponse => {
		return $api.get("/auth/users", {
			params: {
				...params
			}
		});
	};
}

export default new Model();
