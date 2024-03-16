import { HeaderStyles, MainStyles } from "./styles.ts";
import {
	Box,
	Container,
	List,
	ListItem,
	Typography,
	Link
} from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import logo from "@/app/assets/images/logo.png";
import { pxToRem } from "@/shared/css-utils";
import { Link as RouterLink } from "react-router-dom";
import { LogOut } from "@/features/log-out";

export const PanelLayout = () => {
	const location = useLocation();
	const { pathname } = location;

	return (
		<>
			<HeaderStyles>
				<Container
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					}}
				>
					<Link
						component={RouterLink}
						to='/'
						sx={{
							display: "flex",
							alignItems: "center",
							gap: pxToRem(10),
							textDecoration: "none",
							color: "#434C6F"
						}}
					>
						<Box
							width={35}
							height={35}
							display='inline-block'
							sx={{
								background: "#F6F6FB",
								padding: pxToRem(8),
								borderRadius: "50%",
								"& img": {
									width: "100%",
									height: "100%"
								}
							}}
						>
							<img src={logo} alt='Spaininter Logo' width={35} height={35} />
						</Box>
						<Typography fontWeight={600}>Site management</Typography>
					</Link>
					<Box sx={{ display: "flex", gap: pxToRem(30) }}>
						<List sx={{ display: "flex", padding: 0 }}>
							<ListItem>
								<Link
									sx={{
										textDecoration: pathname === "/news" ? "underline" : "none"
									}}
									component={RouterLink}
									to='news'
								>
									News
								</Link>
							</ListItem>
							<ListItem>
								<Link
									sx={{
										textDecoration:
											pathname === "/admins" ? "underline" : "none"
									}}
									component={RouterLink}
									to='admins'
								>
									Admins
								</Link>
							</ListItem>
							{/*<ListItem>*/}
							{/*	<Link*/}
							{/*		sx={{*/}
							{/*			textDecoration:*/}
							{/*				pathname === "/categories" ? "underline" : "none"*/}
							{/*		}}*/}
							{/*		component={RouterLink}*/}
							{/*		to='categories'*/}
							{/*	>*/}
							{/*		Categories*/}
							{/*	</Link>*/}
							{/*</ListItem>*/}
						</List>
						<LogOut />
					</Box>
				</Container>
			</HeaderStyles>
			<MainStyles>
				<Container>
					<Outlet />
				</Container>
			</MainStyles>
		</>
	);
};
