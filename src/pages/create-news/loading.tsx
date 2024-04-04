import { Box, Skeleton } from "@mui/material";
import { pxToRem } from "@/shared/css-utils";

export const Loading = () => {
	return (
		<Box maxWidth={600}>
			<Skeleton
				variant='rectangular'
				width={300}
				height={56}
				sx={{
					borderRadius: "4px",
					marginBottom: pxToRem(20)
				}}
			/>
			<Box mb={pxToRem(20)} display='flex' gap='10px'>
				<Skeleton
					variant='rectangular'
					width={300}
					height={56}
					sx={{
						borderRadius: "4px"
					}}
				/>
				<Skeleton
					variant='rectangular'
					width={300}
					height={56}
					sx={{
						borderRadius: "4px"
					}}
				/>
			</Box>
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
				width={400}
				height={48}
				sx={{
					borderRadius: "4px",
					marginBottom: pxToRem(20)
				}}
			/>
			<Skeleton
				variant='rectangular'
				width={400}
				height={56}
				sx={{
					borderRadius: "4px",
					marginBottom: pxToRem(20)
				}}
			/>
			<Skeleton
				variant='rectangular'
				width={400}
				height={100}
				sx={{
					borderRadius: "4px",
					marginBottom: pxToRem(20)
				}}
			/>
			<Skeleton
				variant='rectangular'
				width={400}
				height={140}
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
