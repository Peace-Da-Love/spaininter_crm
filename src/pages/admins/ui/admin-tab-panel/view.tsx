import { FC } from "react";
import { Box } from "@mui/material";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

export const AdminTabPanel: FC<TabPanelProps> = ({
	children,
	value,
	index
}) => {
	return (
		<div role='tabpanel' id={`tab-${index}`} hidden={value !== index}>
			{value === index && <Box>{children}</Box>}
		</div>
	);
};
