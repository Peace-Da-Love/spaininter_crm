import { AuthForm } from "@/widgets/auth-form";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const acs_token = Cookies.get("access_token");

    if (acs_token) {
      navigate("/");
    }
  }, []);

	return <AuthForm />;
};
