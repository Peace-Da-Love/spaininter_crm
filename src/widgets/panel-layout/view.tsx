import { MainStyles } from "./styles.ts";
import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Header } from "./ui/header";

export const PanelLayout = () => {
	return (
		<>
			<Header />
			<MainStyles>
				<Container>
					<Outlet />
				</Container>
			</MainStyles>
		</>
	);
};
