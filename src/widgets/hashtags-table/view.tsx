import { useQuery } from "@tanstack/react-query";
import { hashtagsModel } from "@/app/models/hashtags-model";
import { Paper, Skeleton, Typography, Box, Link } from "@mui/material";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { formatDateTime } from "@/shared/utils";
import Table from "@mui/material/Table";
import { DeleteHashtag } from "@/features/delete-hashtag";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { Link as RouterLink } from "react-router-dom";
import { pxToRem } from "@/shared/css-utils";

export const HashtagsTable = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["get-hashtags-table-key"],
		queryFn: () => hashtagsModel.getHashtags()
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
						<TableCell>Hashtag</TableCell>
						<TableCell>Added</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data &&
						!isLoading &&
						data.data.data.hashtags.map(hashtag => {
							return (
								<TableRow key={hashtag.hashtag_id}>
									<TableCell>{hashtag.hashtag_id}</TableCell>
									<TableCell>
										<Typography
											variant='body1'
										>
											{hashtag.hashtag_name}
										</Typography>
									</TableCell>
									<TableCell>{formatDateTime(hashtag.createdAt)}</TableCell>
									<TableCell>
										<Box display='flex' alignItems='center' gap={pxToRem(10)}>
											<DeleteHashtag hashtagId={hashtag.hashtag_id} />
											<Link
												title='Edit hashtag'
												component={RouterLink}
												to={`/hashtag/${hashtag.hashtag_id}`}
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
						})}
					{isLoading && loadingRow}
				</TableBody>
			</Table>
		</Paper>
	);
};
