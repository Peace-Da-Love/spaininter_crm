import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_URL;

const $api = axios.create({
	withCredentials: true,
	baseURL: `${BASE_URL}/api`,
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${Cookies.get("access_token")}`
	}
});

$api.interceptors.request.use(config => {
	config.headers.Authorization = `Bearer ${Cookies.get("access_token")}`;
	return config;
});

type RefreshTokenResponse = {
	data: {
		accessToken: string;
	};
};

$api.interceptors.response.use(
	config => {
		return config;
	},
	async error => {
		const originalRequest = error.config;
		if (
			error.response.status == 401 &&
			error.config &&
			!error.config._isRetry
		) {
			originalRequest._isRetry = true;
			try {
				const response = await axios.get<RefreshTokenResponse>(
					`${BASE_URL}/api/auth/refresh`,
					{
						withCredentials: true
					}
				);
				Cookies.set("access_token", response.data.data.accessToken);
				return $api.request(originalRequest);
			} catch (e) {
				throw new Error("User is not authorized");
			}
		}
		throw error;
	}
);

export default $api;
