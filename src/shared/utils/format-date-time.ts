export const formatDateTime = (inputDateTime: Date | string) => {
	const date = new Date(inputDateTime);

	const formattedDate = date
		.toLocaleDateString("en-GB", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		})
		.replace(/\//g, ".");

	const options = { timeZone: "Europe/Moscow", hour12: false };
	const formattedTime = date.toLocaleTimeString("en-GB", options);

	return `${formattedDate} ${formattedTime}`;
};
