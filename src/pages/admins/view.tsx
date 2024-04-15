import { Box, Typography } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import { AdminsTable } from "@/widgets/admins-table";
import { RegisterAdmin } from "@/features/register-admin";
import { Helmet } from "react-helmet-async";
import { Fragment, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { a11yProps } from "@/shared/utils";
import { AdminTabPanel } from "./ui/admin-tab-panel";
import { RegisterCreator } from "@/features/register-creator";
import { CreatorsTable } from "@/widgets/creators-table";

export const AdminsPage = () => {
	const [type, setType] = useState<number>(0);

	const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
		setType(newValue);
	};

	return (
		<Fragment>
			<Helmet>
				<title>SpainInter CRM - Admins</title>
			</Helmet>
			<section>
				<Tabs
					sx={{
						"& .MuiTabs-flexContainer": {
							justifyContent: "center"
						},
						marginBottom: pxToRem(20)
					}}
					value={type}
					onChange={handleChange}
				>
					<Tab label='Admins' {...a11yProps(0)} />
					<Tab label='Creators' {...a11yProps(1)} />
				</Tabs>
				<AdminTabPanel index={0} value={type}>
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
				</AdminTabPanel>
				<AdminTabPanel index={1} value={type}>
					<Typography variant='h1' mb={pxToRem(20)}>
						Creators
					</Typography>
					<Box textAlign='right' mb={pxToRem(20)}>
						<RegisterCreator />
					</Box>
					<CreatorsTable />
				</AdminTabPanel>
			</section>
		</Fragment>
	);
};
