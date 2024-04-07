import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authModel } from "@/app/models/auth-model";
import { Skeleton, TablePagination } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import { formatDateTime } from "@/shared/utils";
import { DeleteAdmin } from "@/features/delete-admin";

export const CreatorsTable = () => {
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const { data, isLoading, isError } = useQuery({
		queryKey: ["creators-key", { page, limit }],
		queryFn: () => authModel.getCreators({ page, limit })
	});

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage + 1);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setLimit(+event.target.value);
		setPage(1);
	};

	if (isError) return <div>Error!</div>;

	const loadingRow = [...Array(limit)].map((_item, index) => {
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
						<TableCell>Telegram</TableCell>
						<TableCell>Added</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data &&
						!isLoading &&
						data.data.data.creators.map(admin => {
							return (
								<TableRow key={admin.id}>
									<TableCell>{admin.id}</TableCell>
									<TableCell>{admin.tg_id}</TableCell>
									<TableCell>{formatDateTime(admin.createdAt)}</TableCell>
									<TableCell>
										<DeleteAdmin adminId={admin.id} />
									</TableCell>
								</TableRow>
							);
						})}
					{isLoading && loadingRow}
				</TableBody>
			</Table>
			{data && !isLoading && (
				<TablePagination
					rowsPerPageOptions={[10, 25, 100]}
					component='div'
					count={data.data.data.count}
					rowsPerPage={limit}
					page={page - 1}
					onRowsPerPageChange={handleChangeRowsPerPage}
					onPageChange={handleChangePage}
				/>
			)}
		</Paper>
	);
};
