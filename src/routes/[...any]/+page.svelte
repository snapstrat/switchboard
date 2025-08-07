<script>
	import { BrowserRouter, createWebRouter, Route, Route404 } from '$lib';

	const router = createWebRouter()
</script>

<BrowserRouter {router}>
	<Route404>
		page-not-found
	</Route404>

	<Route path="home">
		Hello!
	</Route>
</BrowserRouter>