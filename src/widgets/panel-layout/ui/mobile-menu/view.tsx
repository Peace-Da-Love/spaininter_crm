import {
	Box,
	Button,
	Drawer,
	Link,
	List,
	ListItem,
	Typography
} from "@mui/material";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { LogOut } from "@/features/log-out";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { useUserStore } from "@/app/store";
import { navigation } from "@/app/constance";

export const MobileMenu = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const location = useLocation();
	const { user } = useUserStore();
	const { pathname } = location;

	const toggleDrawer =
		(open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
			if (
				event &&
				event.type === "keydown" &&
				((event as React.KeyboardEvent).key === "Tab" ||
					(event as React.KeyboardEvent).key === "Shift")
			) {
				return;
			}
			setIsOpen(open);
		};

	return (
		<Box
			sx={{
				display: { xs: "block", sm: "none" }
			}}
		>
			<Button onClick={toggleDrawer(true)} sx={{ color: "#000" }}>
				<MenuIcon />
			</Button>

			<Drawer anchor='left' open={isOpen} onClose={toggleDrawer(false)}>
				<Box
					sx={{
						width: 250,
						height: "100%",
						background: "#fff",
						padding: "50px 20px 20px 20px",
						position: "relative"
					}}
				>
					<Button
						sx={{
							position: "absolute",
							top: 20,
							right: 20,
							color: "#000"
						}}
						onClick={toggleDrawer(false)}
					>
						<MenuOpenIcon />
					</Button>
					<Typography variant='h6' gutterBottom>
						Menu
					</Typography>
					<List sx={{ display: "flex", padding: 0, flexDirection: "column" }}>
						{navigation.map((item, index) => {
							if (item.secure && user.role === "creator") return;

							return (
								<ListItem key={`Mobile-menu navigation item - ${index}`}>
									<Link
										onClick={toggleDrawer(false)}
										sx={{
											textDecoration:
												pathname === item.link ? "underline" : "none"
										}}
										component={RouterLink}
										to={item.link}
									>
										{item.title}
									</Link>
								</ListItem>
							);
						})}
					</List>
					<Typography variant='h6' gutterBottom>
						Settings
					</Typography>
					<LogOut />
				</Box>
			</Drawer>
		</Box>
	);
};
