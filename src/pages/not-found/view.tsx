import { Box, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import logo from "@/app/assets/images/logo.png";
import { Helmet } from "react-helmet";
import { Fragment } from "react";

export const NotFoundPage = () => {
	return (
		<Fragment>
			<Helmet>
				<title>404 - Page Not Found!</title>
			</Helmet>
			<Box
				sx={{
					padding: "100px 0",
					margin: "0 auto",
					textAlign: "center"
				}}
			>
				<Box
					sx={{
						marginBottom: "10px"
					}}
				>
					<img src={logo} alt='Spaininter Logo' />
				</Box>
				<Typography gutterBottom variant='h1'>
					404
				</Typography>
				<Typography gutterBottom variant='h2'>
					Page not found
				</Typography>
				<Link component={RouterLink} to='/'>
					Go back to home
				</Link>
			</Box>
		</Fragment>
	);
};
