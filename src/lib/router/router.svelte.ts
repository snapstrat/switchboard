import { getContext, setContext, type Snippet } from 'svelte';
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
  private constructor(
    public readonly parts: readonly RoutePart[],
    public readonly is404: boolean = false,
  ) {}

  public static fromString(path: string): RoutePath {
    if (path == '/') {
      return new RoutePath([]);
    }
    return new RoutePath(
      path.split('/').map((part) => {
        if (part.startsWith(':')) {
          return new RouteParam(part.substring(1));
        } else {
          return part;
        }
      }),
    );
  }

  public static fromParts(parts: readonly RoutePart[]): RoutePath {
    return new RoutePath(parts);
  }

  public static create404() {
    return new RoutePath([], true);
  }
}

/**
 * A route in the application. This is not necessarily the route that is currently active.
 */
export interface ApplicationRoute {
  path: RoutePath;
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

/**
 * A router used to switch between routes in an application.
 */
export interface Router {
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
   * Create a route.
   * @param route
   */
  registerRoute(route: ApplicationRoute): void;

  /**
   * Remove a route
   * @param route
   */
  unregisterRoute(route: ApplicationRoute): void;

  /**
   * Get the current route.
   */
  currentRoute: ActiveRoute | undefined;

  getRoute(path: string): ApplicationRoute;

  /**
   * Get all routes, except for the 404 route.
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
  getQueryParam(name: string): string;
}

export interface ActiveRoute {
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

export type RouteParams = Map<string, string>;

export const ROUTER_CONTEXT_KEY = 'switchboard::router::';
export const ROUTER_DEFAULT = 'default';

export type AvailableContext = keyof Switchboard.Contexts;

export type ContextsMap = {
  [K in AvailableContext]: Switchboard.Contexts[K];
}

export function getRouter<Id extends AvailableContext = typeof ROUTER_DEFAULT>(identifier?: Id) : ContextsMap[Id] {
  return getContext(ROUTER_CONTEXT_KEY + (identifier ?? ROUTER_DEFAULT));
}



export function setRouterContext(
  identifier: string = "default",
  router: Router,
): void {
  // set the router in the context
  setContext(ROUTER_CONTEXT_KEY + identifier, router);
}

export const link: Attachment = () => {

}