import { type Router, type ApplicationRoute, type ActiveRoute, RouteParam, type RouteParams } from '$lib';
/**
 * A router used for an entire application on the web.
 */
class WebRouterSvelte implements Router {
	private readonly _routes: ApplicationRoute[] = [];
	public currentRoute: ActiveRoute | undefined = $state(undefined);

	public constructor() {
		// we want to listen to popstate events to update the current route
		// in this router
		window.addEventListener('popstate', (ev) => {
			ev.preventDefault();
			this.switchTo(
				window.location.pathname + window.location.search,
				{},
				false,
			);
		});
	}

	public getRouteParam(name: string): string {
		return this.currentRoute!.params.get(name)!;
	}

	public getQueryParam(name: string): string {
		return this.currentRoute!.queryParams.get(name)!;
	}

	public refresh(): void {
		this.switchTo(
			this.currentRoute!.path,
			this.currentRoute!.queryParams,
			true,
		);
	}

	public switchTo(
		path: string,
		queryParams: Record<string, string> | Map<string, string> = {},
		pushNewState: boolean = true,
	): ActiveRoute {
		const getQueryParam : (k: string) => string = queryParams instanceof Map
			? (k) => queryParams.get(k)!
			: (k) => queryParams[k]

		const queryParamKeys = queryParams instanceof Map
			? [...queryParams.keys()]
			: Object.keys(queryParams)

		// create a url to easily manipulate the route params
		const url = new URL(window.location.href);
		// remove old query params
		url.searchParams.forEach((value, key) => {
			url.searchParams.delete(key);
		});
		url.pathname = path.split('?')[0];
		url.search = '?' + (path.split('?')[1] ?? '');
		const route = this.getRoute(url.pathname);

		// set the query params in the url to the new ones
		for (const key in queryParamKeys) {
			url.searchParams.set(key, getQueryParam(key));
		}

		// create the new active route object
		const params = this.createParams(path);
		const queryParamsMap = new Map<string, string>();
		url.searchParams.forEach((value, key) => {
			queryParamsMap.set(key, value);
		});
		const selectedRoute = {
			route,
			params,
			path: url.pathname,
			queryParams: queryParamsMap,
		};
		// push a new state if we need to
		if (pushNewState)
			window.history.pushState({}, '', url.pathname + url.search);

		this.currentRoute = selectedRoute;

		return selectedRoute;
	}

	public registerRoute(route: ApplicationRoute): void {
		this._routes.push(route);

		// switch to the new route if it's a 404 route and the current route is undefined
		if (
			this.currentRoute?.route == undefined ||
			this.currentRoute.route.path.is404
		) {
			this.switchTo(window.location.pathname, {}, false);
		}
	}

	/**
	 * Get a route by its path. Accounts for route parameters.
	 * @param path
	 */
	public getRoute(path: string): ApplicationRoute {
		if (path == '/') {
			return (
				this._routes.find(
					(route) => route.path.parts.length === 0 && !route.path.is404,
				) ?? this._routes.find((route) => route.path.is404)!
			);
		}
		const routes = this._routes.filter((route) => {
			const parts = path.split('/');
			if (parts.length != route.path.parts.length) return false;
			return route.path.parts.every((part, index) => {
				if (part instanceof RouteParam) return true;
				return part == parts[index];
			});
		});

		return routes[0] ?? this._routes.find((route) => route.path.is404)!;
	}

	// extract the route (not query) params from the path
	public createParams(path: string): RouteParams {
		if (path == '/') return new Map();
		const route = this.getRoute(path);
		if (route == undefined) {
			throw new Error(`Route not found for path: ${path}`);
		}

		const parts = path.split('/');
		const params = new Map<string, string>();
		route.path.parts.forEach((part, index) => {
			if (part instanceof RouteParam) {
				params.set(part.name, parts[index]);
			}
		});
		return params;
	}

	public unregisterRoute(route: ApplicationRoute): void {
		const toRemove = this._routes.indexOf(route);
		if (toRemove == -1) return;
		if (this.currentRoute?.route == route) {
			this.switchTo(this.currentRoute.path, {}, false);
		}
		this._routes.splice(toRemove, 1);
	}

	public getAllRoutes(): ApplicationRoute[] {
		return this._routes.filter((it) => !it.path.is404);
	}
}

/**
 * Creates a {@link Router} that interfaces with the Web Browser's history API.
 */
export const createWebRouter = () : Router => {
	return new WebRouterSvelte();
}