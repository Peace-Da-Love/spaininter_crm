import { PageWrapper } from "@/shared/ui/styled";
import { Outlet } from "react-router-dom";

export const PageLayout = () => {
	return (
		<PageWrapper>
			<Outlet />
		</PageWrapper>
	);
};
