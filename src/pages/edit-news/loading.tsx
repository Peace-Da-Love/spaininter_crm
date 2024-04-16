import { Box, Skeleton } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";

export const Loading = () => {
	return (
		<Box maxWidth={600}>
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
				width={"100%"}
				height={56}
				sx={{
					borderRadius: "4px",
					marginBottom: pxToRem(20)
				}}
			/>
			<Skeleton
				variant='rectangular'
				width={"100%"}
				height={120}
				sx={{
					borderRadius: "4px",
					marginBottom: pxToRem(20)
				}}
			/>
			<Skeleton
				variant='rectangular'
				width={"100%"}
				height={220}
				sx={{
					borderRadius: "4px",
					marginBottom: pxToRem(20)
				}}
			/>
		</Box>
	);
};
