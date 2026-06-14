import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { DeleteNews } from "@/features/delete-news";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { newsModel } from "./model.ts";
import { formatDateTime } from "@/shared/utils";
import {
	Box,
	Link,
	Skeleton,
	TableContainer,
	TablePagination,
	Typography
} from "@mui/material";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { pxToRem } from "@/shared/css-utils";
import { Link as RouterLink } from "react-router-dom";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { languageModel } from "@/app/models/language-model";
import { useLanguagesStore } from "@/app/store";
import { CreateNews } from "@/features/create-news";

export const NewsTable = () => {
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const { languages, setLanguages } = useLanguagesStore();
	useQuery({
		queryKey: ["languages-key"],
		queryFn: () =>
			languageModel().then(res => {
				setLanguages(res.data.data.languages);
				return res;
			}),
		enabled: languages.length === 0
	});
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

	const rows = data?.data.data.rows ?? [];
	const pendingRows = rows.filter(row => row.status === "pending");
	const approvedRows = rows.filter(row => row.status === "approved");
	const resolveLanguage = (languageId?: number) => {
		if (!languageId) return "-";
		const language = languages.find(lang => lang.language_id === languageId);
		return language?.language_code ?? String(languageId);
	};
	const resolvePreferredTranslation = (
		newsTranslations?: Array<{
			title: string;
			link: string;
			language_id: number;
		}>
	) => {
		if (!newsTranslations || newsTranslations.length === 0) return null;

		const englishId = languages.find(lang => lang.language_code === "en")
			?.language_id;
		const russianId = languages.find(lang => lang.language_code === "ru")
			?.language_id;

		const byIdAsc = [...newsTranslations].sort(
			(a, b) => a.language_id - b.language_id
		);

		return (
			(englishId
				? newsTranslations.find(t => t.language_id === englishId)
				: undefined) ??
			(russianId
				? newsTranslations.find(t => t.language_id === russianId)
				: undefined) ??
			byIdAsc[0] ??
			null
		);
	};

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
		<Box display='flex' flexDirection='column' gap={pxToRem(20)}>
			{pendingRows.length > 0 && (
				<Box>
					<Typography variant='h2' mb={pxToRem(12)}>
						Pending review
					</Typography>
					<TableContainer component={Paper} sx={{ boxShadow: "none" }}>
						<Table sx={{ minWidth: 650 }}>
							<TableHead>
								<TableRow>
									<TableCell>ID</TableCell>
									<TableCell>Date</TableCell>
									<TableCell>Title</TableCell>
									<TableCell>Language</TableCell>
									<TableCell></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{pendingRows.map(
									({ news_id, newsTranslations, createdAt }) => {
										const translation =
											resolvePreferredTranslation(newsTranslations);
										const title = translation?.title ?? "-";
										const languageId = translation?.language_id;

										return (
											<TableRow hover key={`pending-${news_id}`}>
												<TableCell>{news_id}</TableCell>
												<TableCell>{formatDateTime(createdAt)}</TableCell>
												<TableCell title={title}>
													{title.length > 40
														? `${title.slice(0, 40)}...`
														: title}
												</TableCell>
												<TableCell>{resolveLanguage(languageId)}</TableCell>
												<TableCell>
													<Box
														display='flex'
														alignItems='center'
														gap={pxToRem(10)}
													>
														<DeleteNews newsId={news_id} />
														<Link
															title='Edit news'
															component={RouterLink}
															to={`/news/review/${news_id}`}
															sx={{
																width: "1.5rem",
																height: "1.5rem",
																display: "inline-block",
																color: "#434C6F"
															}}
														>
															<EditNoteIcon />
														</Link>
													</Box>
												</TableCell>
											</TableRow>
										);
									}
								)}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
			)}

			<Box>
				<Typography variant='h2' mb={pxToRem(12)}>
					Published
				</Typography>
				<Box sx={{ textAlign: "right", marginBottom: pxToRem(20) }}>
					<CreateNews />
				</Box>
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
								approvedRows.map(
									({ news_id, newsTranslations, views, createdAt }) => {
										const translation =
											resolvePreferredTranslation(newsTranslations);
										const title = translation?.title ?? "-";
										const link = translation?.link;

										return (
											<TableRow hover key={news_id}>
												<TableCell>{news_id}</TableCell>
												<TableCell>{formatDateTime(createdAt)}</TableCell>
												<TableCell title={title}>
													{title.length > 40
														? `${title.slice(0, 40)}...`
														: title}
												</TableCell>
												<TableCell>{views}</TableCell>
												<TableCell>
													<Box
														display='flex'
														alignItems='center'
														gap={pxToRem(10)}
													>
														<DeleteNews newsId={news_id} />
														<Link
															title='Edit news'
															component={RouterLink}
															to={`/news/${news_id}`}
															sx={{
																width: "1.5rem",
																height: "1.5rem",
																display: "inline-block",
																color: "#434C6F"
															}}
														>
															<EditNoteIcon />
														</Link>
														<Link
															title='Go to news'
															target='_blank'
															display='block'
															width='1.5rem'
															height='1.5rem'
															href={
																link
																	? `https://spaininter.com/news/${link}`
																	: undefined
															}
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
			</Box>
		</Box>
	);
};
