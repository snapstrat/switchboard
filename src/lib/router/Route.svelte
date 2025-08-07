<svelte:options runes={true} />

<script lang="ts" module>
	export type RouteProps = {
		path: string;
		name?: string;
		icon?: string;
		children?: Snippet;
		routerId?: AvailableContext;
	}
</script>

<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
	import {
		type ApplicationRoute, getRouter,
		RoutePath
	} from './router.svelte';



  let {
    path,
    name,
    icon,
    children,
		routerId = "default",
  }: RouteProps = $props();

	let router = getRouter(routerId);

  onMount(() => {
    let route: ApplicationRoute;
    // if this route is a 404 route, we need to unregister the old 404 route and use only this new one
    if (path == '404') {
      route = {
        path: RoutePath.create404(),
        component: children,
      };
      router.unregisterRoute(router.getRoute('404'));
      router.registerRoute(route);
    } else {
      // if this route is not a 404 route, we need to unregister the old route if it exists and use only this new one
      route = {
        path: RoutePath.fromString(path),
        component: children,
      };
      if (!router.getRoute(path).path.is404) {
        const old = router.getRoute(path);
        router.unregisterRoute(old);
        router.registerRoute(route);
        return;
      }
      router.registerRoute(route);
    }
  });
</script>
