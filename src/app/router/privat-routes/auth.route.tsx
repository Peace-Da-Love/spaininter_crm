import { useUserStore } from "@/app/store";
import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authModel } from "@/app/models/auth-model";
import Cookies from "js-cookie";
import { CircularProgress } from "@mui/material";

export const AuthRoute = () => {
	const {
		user: { isAuth, isLoading },
		setIsAuth,
		setIsLoading
	} = useUserStore(state => state);
	const { isPending } = useQuery({
		queryKey: ["refresh-key"],
		queryFn: () =>
			authModel
				.refresh()
				.then(data => {
					const accessToken = data.data.data.accessToken;
					Cookies.set("access_token", accessToken);
					setIsAuth(true);
					return data;
				})
				.catch(() => {
					Cookies.remove("access_token");
					setIsAuth(false);
				})
				.finally(() => setIsLoading(false))
	});

	if (isLoading || isPending)
		return (
			<CircularProgress
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)"
				}}
			/>
		);

	if (!isAuth) return <Navigate to={"/login"} />;

	return <Outlet />;
};
