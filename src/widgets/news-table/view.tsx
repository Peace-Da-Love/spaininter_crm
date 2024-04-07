import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { DeleteNews } from "@/features/delete-news";
import { EditNews } from "@/features/edit-news";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { newsModel } from "./model.ts";
import { formatDateTime } from "@/shared/utils";
import {
	Box,
	Link,
	Skeleton,
	TableContainer,
	TablePagination
} from "@mui/material";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { pxToRem } from "@/shared/css-utils";

export const NewsTable = () => {
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const { data, isLoading, isError } = useQuery({
		queryKey: ["news-key", { page, limit }],
		queryFn: () => newsModel({ page, limit })
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
		<TableContainer component={Paper} sx={{ boxShadow: "none" }}>
			<Table sx={{ minWidth: 650 }}>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Date</TableCell>
						<TableCell>Title</TableCell>
						<TableCell>Views</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data &&
						!isLoading &&
						data.data.data.rows.map(
							({ news_id, newsTranslations, views, createdAt }) => {
								const title = newsTranslations[0].title;
								const link = newsTranslations[0].link;

								return (
									<TableRow hover key={news_id}>
										<TableCell>{news_id}</TableCell>
										<TableCell>{formatDateTime(createdAt)}</TableCell>
										<TableCell title={title}>
											{title.length > 40 ? `${title.slice(0, 40)}...` : title}
										</TableCell>
										<TableCell>{views}</TableCell>
										<TableCell>
											<Box display='flex' alignItems='center' gap={pxToRem(10)}>
												<DeleteNews newsId={news_id} />
												<EditNews newsId={news_id} />
												<Link
													title='Go to news'
													target='_blank'
													display='block'
													width='1.5rem'
													height='1.5rem'
													href={`https://spaininter.com/news/${link}`}
												>
													<InsertLinkIcon />
												</Link>
											</Box>
										</TableCell>
									</TableRow>
								);
							}
						)}

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
		</TableContainer>
	);
};
