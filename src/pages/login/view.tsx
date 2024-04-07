import { AuthForm } from "@/widgets/auth-form";
import Cookies from "js-cookie";
import { Fragment, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

export const LoginPage = () => {
	const navigate = useNavigate();

	useEffect(() => {
		const acs_token = Cookies.get("access_token");

		if (acs_token) {
			navigate("/");
		}
	}, []);

	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Login</title>
			</Helmet>
			<AuthForm />{" "}
		</Fragment>
	);
};
