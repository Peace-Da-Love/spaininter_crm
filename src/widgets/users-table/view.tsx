import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Avatar,
	Link,
	Paper,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TablePagination,
	TableRow
} from "@mui/material";
import { usersModel } from "@/app/models/users-model";
import { formatDateTime } from "@/shared/utils";

const emptyValue = "-";

export const UsersTable = () => {
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const { data, isLoading, isError } = useQuery({
		queryKey: ["users-key", { page, limit }],
		queryFn: () => usersModel.getUsers({ page, limit })
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

	const loadingRows = [...Array(limit)].map((_item, index) => (
		<TableRow key={`Loading user row - ${index}`}>
			{[...Array(8)].map((_cell, cellIndex) => (
				<TableCell key={`Loading user cell - ${index}-${cellIndex}`}>
					<Skeleton variant='rounded' width={80} height={20} />
				</TableCell>
			))}
		</TableRow>
	));

	return (
		<Paper sx={{ width: "100%", boxShadow: "none", overflowX: "auto" }}>
			<Table sx={{ minWidth: 1100 }}>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Telegram ID</TableCell>
						<TableCell>Username</TableCell>
						<TableCell>First name</TableCell>
						<TableCell>Last name</TableCell>
						<TableCell>Photo</TableCell>
						<TableCell>Created</TableCell>
						<TableCell>Updated</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data &&
						!isLoading &&
						data.data.data.users.map(user => (
							<TableRow key={user.id}>
								<TableCell>{user.id}</TableCell>
								<TableCell>{user.tg_id}</TableCell>
								<TableCell>
									{user.username ? (
										<Link
											href={`https://t.me/${user.username}`}
											target='_blank'
											rel='noopener noreferrer'
											underline='hover'
										>
											{user.username}
										</Link>
									) : (
										emptyValue
									)}
								</TableCell>
								<TableCell>{user.first_name || emptyValue}</TableCell>
								<TableCell>{user.last_name || emptyValue}</TableCell>
								<TableCell>
									<Avatar
										src={user.photo_url || undefined}
										alt={user.username || user.first_name || "User"}
										sx={{ width: 36, height: 36 }}
									/>
								</TableCell>
								<TableCell>{formatDateTime(user.createdAt)}</TableCell>
								<TableCell>{formatDateTime(user.updatedAt)}</TableCell>
							</TableRow>
						))}
					{isLoading && loadingRows}
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
