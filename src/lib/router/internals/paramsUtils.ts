export function parseWindowSearchParams(): Record<string, string> {
	const params: Record<string, string> = {};

	new URL(window.location.href).searchParams.forEach((value, key) => {
		params[key] = value;
	});

	return params;
}