import { Fragment, useState } from "react";
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography
} from "@mui/material";
import { pxToRem } from "@/shared/css-utils";
import AddIcon from "@mui/icons-material/Add";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks";
import { AddChannelDto, channelsModel } from "@/app/models/channels-model";
import { schema } from "./model.ts";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const AddChannel = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const queryClient = useQueryClient();
	const toast = useToast();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema)
	});
	const { mutate, isPending } = useMutation({
		mutationKey: ["add-channel-key"],
		mutationFn: (dto: AddChannelDto) => channelsModel.create(dto),
		onSuccess: async () => {
			setIsOpen(false);
			toast.success("Creator registered successfully");
			reset();
		},
		onError: () => {
			toast.error("Failed to register creator");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-channels-key"] });
		}
	});

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => {
		if (isPending) return;
		setIsOpen(false);
	};

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = data => {
		mutate(data);
	};

	return (
		<Fragment>
			<Button
				sx={{
					display: "inline-flex",
					gap: pxToRem(6),
					textDecoration: "none"
				}}
				onClick={handleOpen}
				variant={"contained"}
			>
				Add City <AddIcon />
			</Button>
			<Dialog open={isOpen} onClose={handleClose}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogTitle>Add CHANNEL</DialogTitle>
					<DialogContent>
						<Typography mb={pxToRem(15)}>Enter the channel ID</Typography>
						<TextField
							{...register("channelId")}
							label='Channel ID'
							fullWidth
							error={!!errors.channelId}
							helperText={errors.channelId?.message}
							type={"number"}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>Cancel</Button>
						<Button type='submit' disabled={isPending}>
							{isPending ? <CircularProgress size={20} /> : "Add"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</Fragment>
	);
};
