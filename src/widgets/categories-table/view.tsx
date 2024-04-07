import { useQuery } from "@tanstack/react-query";
import { categoriesModel } from "@/app/models/categories-model";
import { Paper, Skeleton, Typography, Box } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { formatDateTime } from "@/shared/utils";
import Table from "@mui/material/Table";
import { DeleteCategory } from "@/features/delete-category";
// import EditNoteIcon from "@mui/icons-material/EditNote";
// import { Link as RouterLink } from "react-router-dom";
import { pxToRem } from "@/shared/css-utils";

export const CategoriesTable = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["get-categories-table-key"],
		queryFn: () => categoriesModel.getCategories()
	});

	const loadingRow = [...Array(10)].map((_item, index) => {
		return (
			<TableRow key={`Loading row - ${index}`}>
				<TableCell>
					<Skeleton variant='rounded' width={50} height={20} />
				</TableCell>
				<TableCell>
					<Skeleton variant='rounded' width={50} height={20} />
				</TableCell>
				<TableCell>
					<Skeleton variant='rounded' width={50} height={20} />
				</TableCell>
				<TableCell>
					<Skeleton variant='rounded' width={50} height={20} />
				</TableCell>
			</TableRow>
		);
	});

	return (
		<Paper sx={{ width: "100%", boxShadow: "none" }}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Name</TableCell>
						<TableCell>Added</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data &&
						!isLoading &&
						data.data.data.categories.map(category => {
							return (
								<TableRow key={category.category_id}>
									<TableCell>{category.category_id}</TableCell>
									<TableCell>
										<Typography
											sx={{
												textTransform: "capitalize"
											}}
											variant='body1'
										>
											{category.category_name}
										</Typography>
									</TableCell>
									<TableCell>{formatDateTime(category.createdAt)}</TableCell>
									<TableCell>
										<Box display='flex' alignItems='center' gap={pxToRem(10)}>
											<DeleteCategory categoryId={category.category_id} />
											{/*<Link*/}
											{/*	title='Edit category'*/}
											{/*	component={RouterLink}*/}
											{/*	to={`/category/${category.category_id}`}*/}
											{/*	sx={{*/}
											{/*		width: "1.5rem",*/}
											{/*		height: "1.5rem",*/}
											{/*		display: "inline-block",*/}
											{/*		color: "#434C6F"*/}
											{/*	}}*/}
											{/*>*/}
											{/*	<EditNoteIcon />*/}
											{/*</Link>*/}
										</Box>
									</TableCell>
								</TableRow>
							);
						})}
					{isLoading && loadingRow}
				</TableBody>
			</Table>
		</Paper>
	);
};
