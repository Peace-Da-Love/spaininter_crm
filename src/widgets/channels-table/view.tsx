import { useQuery } from "@tanstack/react-query";
import { channelsModel } from "@/app/models/channels-model";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Skeleton } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import { DeleteChannel } from "@/features/delete-channel";

export const ChannelsTable = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ["get-channels-key"],
		queryFn: () => channelsModel.get()
	});

	if (isError) return <div>Error!</div>;

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
			</TableRow>
		);
	});

	return (
		<Paper sx={{ width: "100%", boxShadow: "none" }}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Telegram ID</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data &&
						!isLoading &&
						data.data.data.channels.map(item => {
							return (
								<TableRow key={item.id}>
									<TableCell>{item.id}</TableCell>
									<TableCell>{item.channelId}</TableCell>
									<TableCell>
										<DeleteChannel channelId={item.id} />
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
