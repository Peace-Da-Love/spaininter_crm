import { $api } from "@/app/api";

export interface IImageDto extends FormData {
	file: File;
}

export interface IImageResponse {
	url: string;
}

export const imageModel = (dto: IImageDto) =>
	$api.post<IImageResponse>("google-storage/upload-file", dto, {
		headers: {
			"Content-Type": "multipart/form-data"
		}
	});
