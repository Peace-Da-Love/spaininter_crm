import { $api } from "@/app/api";
import { IResponse } from "@/app/types";
import { ILanguage } from "@/app/types";

interface LanguageResponse extends IResponse {
	data: {
		languages: ILanguage[];
	};
}

export const languageModel = () => $api.get<LanguageResponse>("/languages");
