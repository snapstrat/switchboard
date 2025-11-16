import {
	type Router,
	type ApplicationRoute,
	type ActiveRoute,
	RouteParam,
	type RouteParams,
	type RouterOptions,
	RoutePath,
	Route404Path,
} from '$lib';
import { parseWindowSearchParams } from '$lib/router/internals/paramsUtils';

/**
 * A router used for an entire application on the web.
 */
class WebRouter implements Router {
	private readonly _routes: ApplicationRoute[] = [];
	private readonly _routes404: ApplicationRoute[] = [];

	// routes are stored in reverse order for easier matching
	// the most recently added routes are matched first
	private get routes() {
		return this._routes.toReversed();
	}

	private get routes404() {
		return this._routes404.toReversed();
	}

	// this is undefined for a short time during initialization,
	// after tick() it's always defined.
	public currentRoute: ActiveRoute = $state.raw(undefined!);

	public readonly options: RouterOptions;

	public constructor(options: RouterOptions) {
		this.options = Object.freeze(options);
		// we want to listen to popstate events to update the current route
		// in this router
		window.addEventListener('popstate', (ev) => {
			ev.preventDefault();
			this.switchTo(window.location.pathname + window.location.search, {}, false);
		});
	}
	public get params(): RouteParams {
		return this.currentRoute?.queryParams ?? {};
	}
	public get queryParams(): RouteParams {
		return this.currentRoute?.queryParams ?? {};
	}

	public getRouteParam(name: string): string {
		return this.currentRoute!.params[name]!;
	}

	public getQueryParam(name: string): string | undefined {
		return this.currentRoute!.queryParams[name];
	}

	public refresh(): void {
		this.switchTo(this.currentRoute!.path, this.currentRoute!.queryParams, true);
	}

	public switchTo(
		path: string,
		queryParams: Record<string, string> | Map<string, string> = {},
		pushNewState: boolean = true
	): ActiveRoute {
		const getQueryParam: (k: string) => string =
			queryParams instanceof Map ? (k) => queryParams.get(k)! : (k) => queryParams[k];

		const queryParamKeys =
			queryParams instanceof Map ? [...queryParams.keys()] : Object.keys(queryParams);

		// create a url to easily manipulate the route params
		const url = new URL(window.location.origin + path);

		const route = this.getRoute(url.pathname);

		// set the query params in the url to the new ones
		for (const key of queryParamKeys) {
			url.searchParams.set(key, getQueryParam(key));
		}

		path = url.pathname;

		// create the new active route object
		const params = this.createParams(path);
		const queryParamsMap: RouteParams = {};
		url.searchParams.forEach((value, key) => {
			queryParamsMap[key] = value;
		});
		const selectedRoute = {
			route,
			params,
			path: url.pathname,
			queryParams: queryParamsMap
		};
		// push a new state if we need to
		if (pushNewState) window.history.pushState({}, '', url);

		this.currentRoute = selectedRoute;

		return selectedRoute;
	}

	public registerRoute(route: ApplicationRoute): void {
		this._routes.push(route);
	}

	public registerRoute404(route: ApplicationRoute): void {
		this._routes404.push(route);

		// switch to the new route if it's a 404 route and the current route is undefined
		if (this.currentRoute?.route == undefined) {
			this.switchTo(window.location.pathname, parseWindowSearchParams(), false);
		}
	}

	/**
	 * Get a route by its path. Accounts for route parameters.
	 * @param path
	 */
	public getRoute(path: string): ApplicationRoute {
		if (path == '/') {
			return this.routes.find((route) => route.path.parts.length === 0) ?? this.getBase404();
		}
		// find the route that matches the path
		const routes = this.findBestFit(path);

		return routes ?? this.getClosest404(path)!;
	}

	private findBestFit(path: string): ApplicationRoute | undefined {
		return this.routes.find((route) => {
			return route.path.matches(path);
		});
	}

	private getBase404(): ApplicationRoute {
		// return the global 404 route
		return this.routes404.find(
			(route) => route.path instanceof Route404Path && route.path.parts.length == 0
		)!;
	}

	private getClosest404(path: string): ApplicationRoute {
		// get the path minus the last segment
		const splitPath = RoutePath.normalizePath(path).split('/').slice(0, -1);

		for (let i = splitPath.length; i >= 0; i--) {
			const subPath = '/' + splitPath.slice(0, i).join('/');
			const route = this.routes404.find((route) => route.path.matches(subPath));
			if (route) {
				return route;
			}
		}
		return this.getBase404();
	}

	// extract the route (not query) params from the path
	public createParams(path: string): RouteParams {
		if (path == '/') return {};
		const route = this.getRoute(path);
		if (route == undefined) {
			throw new Error(`Route not found for path: ${path}`);
		}

		const parts = RoutePath.normalizePath(path).split('/');
		const params: RouteParams = {};
		route.path.parts.forEach((part, index) => {
			if (part instanceof RouteParam) {
				params[part.name] = parts[index];
			}
		});
		return params;
	}

	public unregisterRoute(route: ApplicationRoute): void {
		const toRemove = this._routes.indexOf(route);
		if (toRemove == -1) return;
		if (this.currentRoute?.route == route) {
			// switch to what will now be a 404 page if we're currently here
			this.switchTo(this.currentRoute.path, parseWindowSearchParams(), false);
		}
		this._routes.splice(toRemove, 1);
	}

	public getAllRoutes(): ApplicationRoute[] {
		return [...this.routes];
	}

	isRouter(): this is Router { return true; }
}

/**
 * Creates a {@link Router} that interfaces with the Web Browser's history API.
 *
 * @param options Options for the router, such as base path or initial route.
 */
export const createWebRouter = (options: RouterOptions = {}) : Router => {
	return new WebRouter(options);
}