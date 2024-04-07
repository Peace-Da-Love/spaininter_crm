import { RootTheme } from "@/app/theme";
import { QueryProvider } from "./query-provider.tsx";
import { ToastProvider } from "@/shared/hooks";
import { FC } from "react";
import { HelmetProvider } from "react-helmet-async";

type Props = {
	children: React.ReactNode;
};

export const Provider: FC<Props> = ({ children }) => {
	return (
		<HelmetProvider>
			<QueryProvider>
				<RootTheme>
					<ToastProvider>{children}</ToastProvider>
				</RootTheme>
			</QueryProvider>
		</HelmetProvider>
	);
};
