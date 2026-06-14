import { INews, IResponse } from "@/app/types";
import { $api } from "@/app/api";
import {
	IGetNewsParams,
	IGetNewsResponse,
	UpdateNewsDto,
	UpdateTranslationDto,
	UpdateAdminNewsDto,
	UpdateNewsStatusDto,
	TranslateMissingNewsDto,
	TranslateMissingNewsResponse
} from "./types.ts";
import { AxiosResponse } from "axios";

class Model {
	public async create(dto: INews): Promise<AxiosResponse<IResponse>> {
		return $api.post("/news/create", dto);
	}

	public async getById(
		params: IGetNewsParams
	): Promise<AxiosResponse<IGetNewsResponse>> {
		return $api.get(`/news/admin/${params.id}`, {
			headers: {
				"accept-language": params.languageCode
			}
		});
	}

	public async update(
		newsId: number,
		data: UpdateNewsDto | FormData
	): Promise<AxiosResponse<IResponse>> {
		if (data instanceof FormData) {
			return $api.patch(`/news/${newsId}`, data, {
				headers: { "Content-Type": "multipart/form-data" }
			});
		} else {
			return $api.patch(`/news/${newsId}`, data, {
				headers: { "Content-Type": "application/json" }
			});
		}
	}

	// Для обновления фото
	public async updatePhoto(
		newsId: number,
		formData: FormData
	): Promise<AxiosResponse<IResponse>> {
		return $api.post(`/news/${newsId}/photo`, formData, {
			headers: { "Content-Type": "multipart/form-data" }
		});
	}

	// Для обновления переводов
	public async updateTranslations(
		newsId: number,
		updates: UpdateTranslationDto[]
	): Promise<AxiosResponse<IResponse>> {
		return $api.patch(`/news/${newsId}/translations`, updates, {
			headers: { "Content-Type": "application/json" }
		});
	}

	public async deleteTranslation(
		newsId: number,
		languageId: number
	): Promise<AxiosResponse<IResponse>> {
		return $api.delete(`/news/${newsId}/translations/${languageId}`);
	}

	// Admin-only update for pending news
	public async updateByAdmin(
		newsId: number,
		data: UpdateAdminNewsDto
	): Promise<AxiosResponse<IResponse>> {
		return $api.patch(`/news/admin/${newsId}`, data, {
			headers: { "Content-Type": "application/json" }
		});
	}

	public async updateStatus(
		newsId: number,
		status: UpdateNewsStatusDto
	): Promise<AxiosResponse<IResponse>> {
		return $api.patch(`/news/${newsId}/status`, status, {
			headers: { "Content-Type": "application/json" }
		});
	}

	public async translateMissingByAdmin(
		newsId: number,
		data: TranslateMissingNewsDto
	): Promise<AxiosResponse<TranslateMissingNewsResponse>> {
		return $api.post(`/news/admin/${newsId}/translate-missing`, data, {
			headers: { "Content-Type": "application/json" }
		});
	}

	public async translateMissingDraftByAdmin(
		data: TranslateMissingNewsDto
	): Promise<AxiosResponse<TranslateMissingNewsResponse>> {
		return $api.post("/news/admin/translate-missing", data, {
			headers: { "Content-Type": "application/json" }
		});
	}
}

export default new Model();
