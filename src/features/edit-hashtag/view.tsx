import { FC, Fragment } from "react";
import {
	Box,
	Button,
	Skeleton,
	TextField
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { hashtagsModel } from "@/app/models/hashtags-model";
import { pxToRem } from "@/shared/css-utils";
import {
	Controller,
	SubmitHandler,
	useForm
} from "react-hook-form";
import { schema } from "./model.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UpdateHashtagDto } from "@/app/models/hashtags-model/types.ts";
import { useToast } from "@/shared/hooks";
import { useNavigate } from "react-router-dom";

type Props = {
	hashtagId: number;
};

export const EditHashtag: FC<Props> = ({ hashtagId }) => {
	const navigate = useNavigate();
	const toast = useToast();
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors }
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema)
	});
	const { data, isLoading, isError } = useQuery({
		queryKey: [`hashtag-${hashtagId}-key`, hashtagId],
		queryFn: () =>
			hashtagsModel.getHashtag(hashtagId).then(res => {
				setValue("hashtag_name", res.data.data.hashtag.hashtag_name);
				return res;
			})
	});
	const { mutate } = useMutation({
		mutationKey: [`update-hashtag-${hashtagId}-key`],
		mutationFn: (dto: UpdateHashtagDto) => hashtagsModel.updateHashtag(dto),
		onSuccess: async () => {
			navigate("/hashtags");
			toast.success("Hashtag updated successfully");
		},
		onError: () => {
			toast.error("Failed to update hashtag");
		}
	});

	if (isLoading) {
		return (
			<Fragment>
				<Skeleton
					variant='rectangular'
					width={400}
					height={56}
					sx={{
						borderRadius: "4px",
						marginBottom: pxToRem(20)
					}}
				/>
				<Skeleton
					variant='rectangular'
					width={66}
					height={36}
					sx={{
						borderRadius: "4px",
						marginBottom: pxToRem(20)
					}}
				/>
			</Fragment>
		);
	}

	if (isError) {
		return <div>Hashtag not found!</div>;
	}

	const onSubmit: SubmitHandler<z.infer<typeof schema>> = data => {
		const dto: UpdateHashtagDto = {
			hashtagId: Number(hashtagId),
			hashtagName: data.hashtag_name
		};
		mutate(dto);
	};

	return (
		<Box>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Box mb={pxToRem(20)} maxWidth={400}>
					<Controller
						name='hashtag_name'
						control={control}
						defaultValue={data?.data.data.hashtag.hashtag_name || ""}
						render={({ field }) => (
							<TextField
								{...field}
								label='Hashtag name'
								placeholder='tech_news'
								error={!!errors.hashtag_name}
								helperText={
									errors.hashtag_name?.message || "Lowercase, numbers, underscores only"
								}
								fullWidth
							/>
						)}
					/>
				</Box>
				<Button type='submit' variant='contained'>
					Save
				</Button>
			</form>
		</Box>
	);
};
