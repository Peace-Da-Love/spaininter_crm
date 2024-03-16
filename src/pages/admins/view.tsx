import { Box, Typography } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { AdminsTable } from "@/widgets/admins-table";
import { RegisterAdmin } from "@/features/register-admin";

export const AdminsPage = () => {
	return (
		<section>
			<Typography variant='h1' mb={pxToRem(20)}>
				Admins
			</Typography>
			<Box
				sx={{
					textAlign: "right",
					marginBottom: pxToRem(20)
				}}
			>
				<RegisterAdmin />
			</Box>
			<AdminsTable />
		</section>
	);
};
