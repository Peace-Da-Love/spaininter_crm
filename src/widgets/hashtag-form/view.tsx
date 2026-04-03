import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { schema } from "./model.ts";
import {
	SubmitHandler,
	useForm
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { hashtagsModel } from "@/app/models/hashtags-model";
import { useMutation } from "@tanstack/react-query";
import { CreateHashtagDto } from "@/app/models/hashtags-model/types.ts";
import { useToast } from "@/shared/hooks";
import { useNavigate } from "react-router-dom";

export const HashtagForm = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			hashtag_name: ""
		}
	});
	const toast = useToast();
	const navigate = useNavigate();
	const { mutate, isPending } = useMutation({
		mutationKey: ["create-hashtag"],
		mutationFn: (dto: CreateHashtagDto) => hashtagsModel.createHashtag(dto),
		onSuccess: async () => {
			toast.success("Hashtag created successfully");
			reset();
			navigate("/hashtags");
		},
		onError: () => {
			toast.error("Failed to create hashtag");
		}
	});

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = data => {
		mutate({
			hashtag_name: data.hashtag_name
		});
	};

	return (
		<Box>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Box mb='20px' maxWidth={400}>
					<TextField
						label='Hashtag name (Latin letters, numbers, underscores)'
						placeholder='news_tech'
						{...register("hashtag_name")}
						error={!!errors.hashtag_name}
						helperText={
							errors.hashtag_name?.message || "e.g., news_tech, sports, politics"
						}
						fullWidth
					/>
				</Box>
				<Button type='submit' disabled={isPending} variant='contained'>
					{isPending ? <CircularProgress size={24} /> : "Create hashtag"}
				</Button>
			</form>
		</Box>
	);
};
