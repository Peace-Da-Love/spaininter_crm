import { useQuery } from "@tanstack/react-query";
import { categoriesModel } from "@/app/models/categories-model";
import { Paper, Skeleton, Typography } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { formatDateTime } from "@/shared/utils";
import Table from "@mui/material/Table";
import { DeleteCategory } from "@/features/delete-category";

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
										<DeleteCategory categoryId={category.category_id} />
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
