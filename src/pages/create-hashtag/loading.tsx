import { Box, Skeleton } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";

export const Loading = () => {
	return (
		<Box>
			<Skeleton
				variant='rectangular'
				width={400}
				height={48}
				sx={{
					borderRadius: "4px",
					marginBottom: pxToRem(20)
				}}
			/>
			<Skeleton
				variant='rectangular'
				width={200}
				height={56}
				sx={{
					borderRadius: "4px",
					marginBottom: pxToRem(20)
				}}
			/>
			<Skeleton
				variant='rectangular'
				width={80}
				height={37}
				sx={{
					borderRadius: "4px"
				}}
			/>
		</Box>
	);
};
