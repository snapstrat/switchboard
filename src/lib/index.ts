// Reexport your entry components here

import type { Router, ROUTER_DEFAULT } from '$lib/router';

export * from './router'
export { createWebRouter } from "./router/impl"


declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Switchboard {
		interface Contexts {
			[ROUTER_DEFAULT]: Router
		}
	}
}