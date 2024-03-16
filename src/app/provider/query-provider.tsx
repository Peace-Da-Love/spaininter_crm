import { FC, ReactNode } from "react";
import {
	QueryClient,
	QueryClientConfig,
	QueryClientProvider
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

type Props = {
	children: ReactNode;
};

const config: QueryClientConfig = {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false
		}
	}
};

const queryClient = new QueryClient(config);

export const QueryProvider: FC<Props> = ({ children }) => {
	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools
				initialIsOpen={false}
				buttonPosition={"bottom-left"}
			/>
			{children}
		</QueryClientProvider>
	);
};
