export const formatDate = (value: string | Date): string => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Invalid Date";

	return date.toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};

export const formatDay = (value: string | Date): string =>
	new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
