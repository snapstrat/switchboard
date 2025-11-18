<div align="center">
    <h1><img alt="SwitchBoard Logo" width="480" src="switchboard-logo.png"/></h1>
    <p><i>A simple, extensible, component-based Svelte 5 SPA router.</i></p>
    <img alt="License" src="https://img.shields.io/github/license/snapstrat/switchboard">
</div>

# Features

- A declarative, component-based method to declare routes.
- A simple API to programmatically navigate between routes.
- Layouts, nested routes, and route parameters.
- Svelte 5 compatibility, with TypeScript support.

# Why Switchboard?

Switchboard is designed to be a simple, extensible router for Svelte 5 applications. 
Using composition and a declarative API, developers are able to quickly create SPA routes without the complexity of larger routing libraries, or dealing with SSR.

Switchboard is ideal for applications which:
- don't require server-side rendering. See [Use with SvelteKit](#use-with-sveltekit) for more info.
- want a simple, component-based routing solution.
- want to stray away from strictly file-based routing systems, such as SvelteKit's routing.
- want more flexibility in defining routes and layouts.
- want to be able to define routes in a way that fits their application's architecture.

# Getting Started

To install Switchboard, run:

```sh
# npm
npm install @snapstrat/switchboard
# yarn
yarn add @snapstrat/switchboard
# pnpm
pnpm install @snapstrat/switchboard
# bun
bun install @snapstrat/switchboard
```

# Basic Usage

Switchboard exposes several components and functions to help you set up routing in your Svelte application.

## Creating a Router
Switchboard leaves the router setup to you. You can either use some form of global state management to hold a reference to it,
or create it directly in your root component.

Switchboard includes a `createWebRouter()` function to create a router instance that works with the browser's history API.

### Global Access
> main.ts

```ts
import App from './App.svelte';
import { createWebRouter } from '@snapstrat/switchboard';

// now anything can import router from here to access the router!
export const router = createWebRouter();

mount(App, {
	target: document.body,
});
```

### Creation in Root Component
> App.svelte
```svelte
<script lang="ts">
	import { BrowserRouter, createWebRouter } from '$lib';
	import PersistenceLayout from './PersistenceLayout.svelte';

    // we can also create the router here!
	const router = createWebRouter()
</script>

<!-- all BrowserRouter needs is a Router instance, constructed from anywhere. -->
<!-- any component nested in BrowserRouter gets access to getRouter() using Svelte contexts. -->
<BrowserRouter {router}>
    <!-- Your routes and layouts go here -->
</BrowserRouter>
```

## Defining Routes
Switchboard is very unopinionated about how you define your routes. 
The main building blocks are the `Route`, `Layout`, `PageInfo` and `Link` components.

```svelte
<script lang="ts">
    import { BrowserRouter, Route, Link } from '@snapstrat/switchboard'
    
    // maybe make a router here? or import one.
</script>

<BrowserRouter router={your_router_instance}>
    <Route path="/">
        <h1>Home Page</h1>
    </Route>

    <Route path="/users/:id">
        <h1>You're looking for a user with the id: {getRouteParams().id}</h1>
    </Route>
    
    <!-- You can use Route404 to catch all unmatched routes -->
    <Route404>
        <h1>404 - Page Not Found</h1>
    </Route404>
</BrowserRouter>
```

### Links
Links can be created using the `Link` component, which is a very, very thin wrapper around an `<a>` tag.
Alternatively, you can use the `Router.switchTo()` method to programmatically navigate between routes, or use
the `{@attach href('my/path')}` attachment to attach hrefs to any element.

```svelte

<script lang="ts">
	import { Link } from '@snapstrat/switchboard';
</script>

<!-- both are equivalent: -->
<Link href="/some/path">Go to Some Path</Link>
<a {@attach href("/some/path")}>Go to Some Path</a>

<!-- not recommended for accessibility, but possible: -->
<button on:click={() => router.switchTo('/some/path')}>
    Go to Some Path
</button>

<!-- not recommended at all, this will reload the page and lose SPA state: -->
<a href="/some/path">Go to Some Path</a>
```

### PageInfo

The `PageInfo` component allows you to declaratively set metadata for the current page, such as the document title and meta tags.

```svelte
<script lang="ts">
    import { PageInfo, Route } from '@snapstrat/switchboard';
</script>

<Route path="/my-cool-page">
    <PageInfo title="My Page Title" icon="/page-icon.ico" />
</Route>
```

### Layouts 
Layouts can be used to simplify routes that share common structure. State of a layout
will persist between __nested__ route changes. 
For example, if you start at `/user/1`, modify some state in the layout, then navigate to `/user/1/profile`, the layout state will persist.
However, if you navigate to `/user/2`, or `/`, or `/any-other-route-outside-of-this-layout` the layout will be re-created and state will be destroyed since the route parameter changed.

```svelte
<BrowserRouter router={your_router_instance}>
    <!-- Layouts can have parameters too! -->
    <!-- Layouts have two snippets they take in: `routes` and `layout` -->
    <Layout path="/user/:id">
        <!-- layout() holds the common layout structure. -->
        {#snippet layout(route: Snippet)}
            <p>You're looking at something for {getRouteParams().id}!</h1>
            {@render route()}
        {/snippet}
        
        <!-- routes() holds all nested routes -->
        {#snippet routes()}
            <Route path="profile">
                <h2>This is the profile page for user {getRouteParams().id}!</h2>
            </Route>
            
            <Route path="settings">
                <h2>This is the settings page for user {getRouteParams().id}!</h2>
            </Route>
            
            <!-- in this context, / will match for /user/:id/ -->
            <Route path="/">
                <h2>This is the settings page for user {getRouteParams().id}!</h2>
            </Route>
            
            <!-- You can also have a Route404 for unmatched nested routes. -->
            <Route404>
                <h1>404 - User Not Found</h1>
            </Route404>
        {/snippet}
    </Layout>
    
    <!-- You can use Route404 to catch all unmatched routes. -->
    <Route404>
        <h1>404 - Page Not Found</h1>
    </Route404>
</BrowserRouter>
```

## Use with SvelteKit
Switchboard is primarily designed for client-side routing in Svelte applications, and does NOT support server-side rendering (SSR), nor do we plan to ever support SSR.

However, you can still use Switchboard within a SvelteKit application for client-side routing needs. To do this, you'll need two main things:
1. A single, top-level SvelteKit route that will serve as the entry point for your Switchboard-powered SPA.
2. SSR disabled for that route.

In practice, this looks like:
```
- /src
  - /routes
    - /[...any]            <-- catch-all used to route all traffic your only +page.svelte, containing your Switchboard app
      - +page.svelte      <-- your Switchboard app goes here
      - +page.ts          <-- disable SSR here with `export const ssr = false;`
```

In a normal Svelte application, you don't need to worry about any of this, and can just place a `BrowserRouter` at the root of your component tree (probably in `App.svelte`).

# Advanced Usage
Advanced usage of Switchboard comes from the natural composition of its components. You can create your own custom route components, layouts, and even
extend the router itself to add functionality.

Any Route or Layout can be declared anywhere that is within a `BrowserRouter`, or a `Layout` component, and will function as expected, no matter how these
are nested, constructed, composed, or imported.

## Custom Route Component
You can wrap around the `Route` component to create your own custom route components. 

For example, you could create an authenticated route component that checks if a user is logged in before rendering the route.

> [!CAUTION]
> Note that this isn't inherently secure, as all routing is done client-side. Make sure that when dealing with sensitive data, you also have server-side checks in place.

> AuthenticatedRoute.svelte
```svelte
<script lang="ts">
    import { Route, getRouter } from '@snapstrat/switchboard';
    import { onMount } from 'svelte';
    import { isUserAuthed } from './auth'; // your auth logic here
    
    const { children, path } = $props();
</script>

<Route path={path}>
    {#if isUserAuthed()}
        {@render children()}
    {:else}
        <h1>Please log in to access this page.</h1>
    {/if}
</Route>
```

> App.svelte
```svelte
<script lang="ts">
    import { BrowserRouter } from '@snapstrat/switchboard';
    import AuthenticatedRoute from './AuthenticatedRoute.svelte';
</script>

<BrowserRouter router={your_router_instance}>
    <AuthenticatedRoute path="/dashboard">
        <h1>Welcome to your dashboard!</h1>
    </AuthenticatedRoute>
</BrowserRouter>
```

## Escaping Layouts
If you need to escape a layout for a specific route, you can set a custom 'container' on any route.

```svelte
<script lang="ts">
    import { BrowserRouter, Layout, LayoutData, Route } from '@snapstrat/switchboard';
    
    let otherLayout: LayoutData = $state();
</script>

<BrowserRouter router={your_router_instance}>
    <Layout path="/app">
        {#snippet layout(route: Snippet)}
            <div class="app-layout">
                <nav>...navigation...</nav>
                <main>
                    {@render route()}
                </main>
            </div>
        {/snippet}
        
        {#snippet routes()}
            <Route path="dashboard">
                <h1>Dashboard</h1>
            </Route>
            
            <Route path="settings">
                <h1>Settings</h1>
            </Route>
            
            <!-- 
            container can either be a Router instance or another Layout.
            setting to whatever your router instance is completely disables the layout. 
             -->
            <Route path="/login" container={your_router_instance}>
                <h1>Login Page</h1>
            </Route>
            
            
            <!--
            setting container to another layout makes the route use that layout instead 
            of the current one.
            
            note that this will NOT impact the path; this route still exists 
            at /app/landing-page, NOT /other/landing-page.
            -->
            <Route path="/landing-page" container={outerLayout}>
                <h1>Landing Page</h1>
            </Route>
        {/snippet}
    </Layout>
    
    <Layout path="/other" bind:ref={otherLayout}>
        <!-- another layout... -->
    </Layout>
</BrowserRouter>
```