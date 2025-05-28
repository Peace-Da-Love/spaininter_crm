import { $api } from "@/app/api";
import { IResponse } from "@/app/types";
import { IPaginationParams } from "@/app/types/IPaginationParams";

export interface City {
	id: string;
	name: string;
	photo_url: string | null;
	links: { id: string; name: string; url: string }[];
	created_at: string;
	updated_at: string;
}

interface CitiesResponse extends IResponse {
	data: {
		count: number;
		rows: City[];
	};
}

export const citiesModel = {
	getCities: (params: IPaginationParams & { search?: string }) =>
		$api.get<CitiesResponse>("/cities", { params }),
	addLink: (dto: { name: string; url: string; cityId: string }) =>
		$api.post("/cities/links", dto),
	updatePhoto: (cityId: string, formData: FormData) =>
		$api.patch(`/cities/${cityId}`, formData, {
			headers: { "Content-Type": "multipart/form-data" }
		}),
	deleteLink: (cityId: string, linkId: string) =>
		$api.delete(`/cities/${cityId}/links?linkId=${linkId}`)
};
