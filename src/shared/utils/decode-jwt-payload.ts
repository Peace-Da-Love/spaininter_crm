import { IRole } from "@/app/types";

interface AdminToken {
	data: {
		admin_id: number;
		role: IRole;
	};
	exp: number;
	iat: number;
}

export function decodeJwtPayload(token: string): AdminToken {
	const parts = token.split(".");
	const encodedPayload = parts[1];
	const decodedPayload = atob(encodedPayload);
	const payloadObject = JSON.parse(decodedPayload);
	return payloadObject;
}
