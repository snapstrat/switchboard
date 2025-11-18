export function parseWindowSearchParams(): Record<string, string> {
	const params: Record<string, string> = {};

	new URL(window.location.href).searchParams.forEach((value, key) => {
		params[key] = value;
	});

	return params;
}

export function createSelector(element: HTMLElement): string {
	const {
		tagName,
		id,
		className,
		parentNode
	} = element;

	if (tagName === 'HTML') return 'HTML';

	let str = tagName;

	str += (id !== '') ? `#${id}` : '';

	if (className) {
		const classes = className.split(/\s/);
		for (let i = 0; i < classes.length; i++) {
			str += `.${classes[i]}`;
		}
	}

	let childIndex = 1;

	for (let e = element; e.previousElementSibling; e = e.previousElementSibling as HTMLElement) {
		childIndex += 1;
	}

	str += `:nth-child(${childIndex})`;

	if (!parentNode) {
		return str;
	}

	return `${createSelector(parentNode as HTMLElement)} > ${str}`;
}