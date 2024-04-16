import { IResponse } from "@/app/types";

export interface AddChannelDto {
	channelId: number;
}

export interface IGetChannelsResponse extends IResponse {
	data: {
		channels: {
			id: number;
			channelId: number;
		}[];
	};
}
