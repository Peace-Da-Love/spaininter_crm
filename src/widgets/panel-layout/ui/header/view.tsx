import {
	Box,
	Container,
	Link,
	List,
	ListItem,
	Typography
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { pxToRem } from "@/shared/css-utils";
import logo from "@/app/assets/images/logo.png";
import { LogOut } from "@/features/log-out";
import { MobileMenu } from "@/widgets/panel-layout/ui/mobile-menu";
import { HeaderStyles } from "@/widgets/panel-layout/styles.ts";
import { navigation } from "@/app/constance";
import { useUserStore } from "@/app/store";

export const Header = () => {
	const location = useLocation();
	const { user } = useUserStore();
	const { pathname } = location;

	return (
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
				<Box sx={{ display: { xs: "none", sm: "flex" }, gap: pxToRem(30) }}>
					<List sx={{ display: "flex", padding: 0 }}>
						{navigation.map((item, index) => {
							if (item.secure && user.role === "creator") return;

							return (
								<ListItem key={`Header navigation item - ${index}`}>
									<Link
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
					<LogOut />
				</Box>
				<MobileMenu />
			</Container>
		</HeaderStyles>
	);
};
