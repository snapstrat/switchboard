import { getContext, hasContext, setContext, type Snippet } from 'svelte';
import type { Attachment } from 'svelte/attachments';

// A part of a route. Can either be a string (static), or a RouteParam (dynamic).
export type RoutePart = string | RouteParam;

// A dynamic route parameter.
export class RouteParam {
  constructor(public readonly name: string) {}
}

/**
 * A full path in the router.
 * Can be created from a string, or from parts.
 *
 * Examples with created parts array:
 * ```js
 * RoutePath.fromString('/users/:userId')  // ['users', RouteParam('userId')]
 * RoutePath.fromParts(['users', new RouteParam('userId')])  // ['users', RouteParam('userId')]
 * RoutePath.create404()  // 404 route, no parts
 * ```
 */
export class RoutePath {
	protected constructor(
    public readonly parts: readonly RoutePart[],
  ) {}

  public static fromString(path: string, is404: boolean = false): RoutePath {
		const ctor = is404 ? Route404Path : RoutePath;
    if (path == '/' || path === '') {
      return new ctor([]);
    }
		path = RoutePath.normalizePath(path)
    return new ctor(
      path.split('/').map((part) => {
        if (part.startsWith(':')) {
          return new RouteParam(part.substring(1));
        } else {
          return part;
        }
      })
    );
  }

  public static fromParts(parts: readonly RoutePart[]): RoutePath {
    return new RoutePath(parts);
  }

  public static create404(layout: readonly RoutePart[] = []): RoutePath {
    return new Route404Path(layout);
  }

	public static readonly concatPaths = (base: string, ...rest: string[]): string => {
		base = RoutePath.normalizePath(base);
		const normalizedRest = rest.map(p => RoutePath.normalizePath(p));
		const restStr = normalizedRest.join('/');

		if (base === '') {
			return RoutePath.normalizePath(restStr);
		}

		return RoutePath.normalizePath([...base.split("/"), ...restStr.split("/")].join("/"));
	}

	/**
	 * Normalize a path by removing leading and trailing slashes.
	 * @param path The path to normalize.
	 */
	public static readonly normalizePath = (path: string) : string => {
		if (path.startsWith('/')) {
			path = path.substring(1); // remove leading slash
		}
		if (path.endsWith('/')) {
			path = path.slice(0, -1); // remove trailing slash
		}
		return path;
	}

	public readonly matches = (path: string): boolean => {
		const parts = RoutePath.normalizePath(path).split('/');
		if (parts.length != this.parts.length) return false;
		return this.parts.every((part, index) => {
			if (part instanceof RouteParam) return true;
			return part == parts[index];
		});
	}
}

export class Route404Path extends RoutePath {
	public constructor(
		public readonly parts: readonly RoutePart[],
	) {
		super(parts);
	}
}

/**
 * A route in the application. This is not necessarily the route that is currently active.
 */
export interface ApplicationRoute {
  path: RoutePath;
	layout?: LayoutData;
  name?: string;
  parents?: string[];
  component?: Snippet;
}

export type RouterEvents = {
  'route:afterSwitch': (
    oldRoute: ActiveRoute | undefined,
    newRoute: ActiveRoute,
  ) => void;
};

export type RouterOptions = Partial<{
	/**
	 * The default page title to be used when no specific title is set for a route.
	 */
	defaultTitle: string;

	basePath: string;
}>

export function defaultRouterOptions(): RouterOptions {
	return {
		defaultTitle: 'App',
	};
}

/**
 * A container for routes, either a router or a layout.
 */
export interface RouteContainer {
	/**
	 * Create a route.
	 * @param route The route to register.
	 * @param layout The layout to register the route under.
	 */
	registerRoute(route: ApplicationRoute, layout?: LayoutData): void;

	/**
	 * Create a 404 route.
	 * @param route The route to register as a 404 route.
	 * @param layout The layout to register the route under.
	 */
	registerRoute404(route: ApplicationRoute, layout?: LayoutData): void;


	/**
	 * Remove a route
	 * @param route The route to unregister.
	 * @param layout The layout to unregister the route from.
	 */
	unregisterRoute(route: ApplicationRoute, layout?: LayoutData): void;

	/**
	 * Check if this route container is a router.
	 *
	 * @returns True if this is a router, false otherwise.
	 */
	isRouter(): this is Router;
}

/**
 * A router used to switch between routes in an application.
 */
export interface Router extends RouteContainer {
	readonly options: RouterOptions;

	/** Params specified in the route with : syntax, like /users/:userId */
	params: RouteParams;
	/** Query params specified after the route with ?, like /users/1234?showFullName=true */
	queryParams: RouteParams;

  /**
   * Switch to a route.
   * @param path
   * @param queryParams
   * @param pushNewState
   */
  switchTo(
    path: string,
    queryParams?: Record<string, string> | RouteParams,
    pushNewState?: boolean,
  ): ActiveRoute;

  /**
   * Get the current route.
   */
  currentRoute: ActiveRoute;

  getRoute(path: string): ApplicationRoute;

  /**
   * Get all routes, including 404 routes.
   */
  getAllRoutes(): ApplicationRoute[];

  createParams(path: string): RouteParams;

  /**
   * A quick refresh will not push a new state to the browser's history.
   * @param quick
   */
  refresh(quick?: boolean): void;

  /**
   * Get a route parameter by name from the current route.
   * @param name
   */
  getRouteParam(name: string): string;

  /**
   * Get a query parameter by name from the current route.
   * @param name
   */
  getQueryParam(name: string): string | undefined;
}

export interface ActiveRoute {
  /**
   * The route object that is currently active.
   */
  route: ApplicationRoute;
  /**
   * Note: this may differ from route.path if the route is a 404 route.
   */
  path: string;

  /** Params specified in the route with : syntax, like /users/:userId */
  params: RouteParams;
  /** Query params specified after the route with ?, like /users/1234?showFullName=true */
  queryParams: RouteParams;
}

export type RouteParams = { [key: string]: string };

export const ROUTER_CONTEXT_KEY = 'switchboard::router';
export const LAYOUT_CONTEXT_KEY = 'switchboard::layout';
export const ROUTE_NOT_FOUND_KEY = '__switchboard__404';

export type LayoutSnippet = Snippet<[Snippet]>

export interface LayoutData extends RouteContainer {
	path?: string;
	parent?: LayoutData;
	renderer: LayoutSnippet;
	notFoundRoute?: ApplicationRoute;
	joinedPath: string;
}

export function getLayout(): LayoutData | undefined {
	return hasContext(LAYOUT_CONTEXT_KEY)
		? getContext<LayoutData>(LAYOUT_CONTEXT_KEY)
		: undefined;
}

export function setLayoutContext(layout: LayoutData | undefined) {
	// set the layout in the context
	setContext(LAYOUT_CONTEXT_KEY, layout);
}

export function getRouter<T extends Router = Router>() : T {
  return getContext(ROUTER_CONTEXT_KEY);
}

export function getRouteParams(): RouteParams {
	const router = getRouter();
	return router.currentRoute.params;
}

export function getQueryParams(): RouteParams {
	const router = getRouter();
	return router.currentRoute.queryParams;
}

export function setRouterContext(
  router: Router,
): void {
  // set the router in the context
  setContext(ROUTER_CONTEXT_KEY, router);
}

/**
 * Gets the nearest route container, either a layout or the router.
 */
export function getRouteContainer(): RouteContainer {
	return getLayout() ?? getRouter();
}

/**
 * Create an attachment that sets the href of an anchor element
 * and switches to the route when clicked.
 * This is useful for creating links that work with the router, and won't cause a refresh when clicked.
 * @param href The href to set on the anchor element.
 *
 * @see Link
 */
export const href = (href: string): Attachment<HTMLAnchorElement> => {
  const router = getRouter();
	return (element) => {
    const handler = () => {
      router.switchTo(href)
    }
		element.href = href;
    element.addEventListener("click", handler)
    element.addEventListener("keydown", handler)

    return () => {
			element.href = "";
      element.removeEventListener("click", handler);
      element.removeEventListener("keydown", handler);
    };
  }
}

export const getAllLayouts = (layout?: LayoutData): LayoutData[] => {
	const list : LayoutData[] = []
	if (!layout) return list;
	while (layout) {
		list.push(layout);
		layout = layout.parent;
	}
	return list.reverse();
}