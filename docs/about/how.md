# How pocket works
From a high-level view pocket looks like a classic server-side web framework. I handles requests and renders HTML-templates. The main difference compared to other frameworks is that pocket is able to use the same code to handle requests directly in a service worker within the user's browser.

## HTML
Pocket (for now) has its own HTML templating engine. Pocket exports a tagged template function called `html`.
The name enables native html code highlighting in IDEs such as vscode (e.G. with the [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html) extension).

`html` returns instances of `Html`.

`html` is invoked like
```ts
html`
 <main>
   <h1>${title}</h1>
   <p>${content}</p>
 </main>
`
```
Title and content will be html-escaped. To pass raw values one would have to use `html.raw`:
```ts
html`
  <div>${html.raw(myRenderedHTML)}</div>
`
```

Interpolated values can be `string`, `number`, `null` (which will render nothing), `false` (which will also render nothing), 
more `Html`, an array of all those values or, notably, a `Promise<string>`, `Promise<Html>` etc.
`Html` renders not to a `string` but to a bytestream and resolves any passed in promises so streaming rendering is native to pocket using the browser's native streaming rendering capabilities.

[Learn more](../api/html.md)

## Routing
Pocket uses folder-based routing similar to next.js (because I really like that about next.js).
The router starts at the root of the `routes/` folder. Put a file called `route.ts` in there. That's the one that will handle requests to `/`. Subfolders are used for different paths, e.G. `/contact/route.ts` will handle requests to `/contact` etc.

Within your `route.ts` you'll typically export a couple of functions with special names:
```ts
export function body(context: RouteBodyContext): Html
```
returns the page body. The `RouteBodyContext` provides access to the `Request`-object as wenn as some props that we'll come back to later on.

If no other export is provided, this is sufficient to render an HTML-page.

```ts
export function head(context: RouteHeadContext): Html
```
returns HTML that will be appended to the `<head>` of the resulting page which is useful to add meta tags like titles, descriptions etc.

```ts
export function get(context: RouteHandlerContext): Response
```
can be used to manually handle the request. The `RouteHandlerContext` includes a `render`-function to render the
actual template (as defined by the `head` and `body` functions)

`get` allows modifying things like cookies, headers etc. and can work standalone (without a `body`) if you need to have an API-style route that returns something that's not HTML.

`post`, `delete`, `put` etc. work the same way as `get`.

[Learn more about the filesystem API](../api/filesystem.md)
[Learn more about the route APIs](../api/routes.md)

## Layouts
Pocket has native support for layouts. Any folder within `routes/` can, in addition to the `route.ts`, also contain a `layout.ts` with `body` and `head` exports very similar to the ones in `route.ts`. Routes are wrapped in every layout from its own folder up the tree to the `routes/` folder.

This means that in
```
routes/
 | - layout.ts
 | - app/
 |    | - layout.ts
 | .  | - contact/
 | .  |    | - layout.ts
 | .  | .  | - route.ts
 | - misc/
 | .  | - layout.ts
```
`routes/app/contact/route.ts` would match `routes/layout.ts`, `routes/app/layout.ts` and `routes/app/contact/layout.ts` but not `routes/misc/layout.ts`.

[Learn more](../api/layouts.md)

## Server-Side
When run as a standalone server or in dev mode, user code is executed in Vercel's [edge-runtime](https://edge-runtime.vercel.app/).
This means that roughly the same APIs as in a service worker are available to it (see [APIs](https://edge-runtime.vercel.app/features/available-apis)).

## Vercel
One huge advantage of limiting the server side to APIs available in a browser context is that node is not required for a pocket implementation to run. Pocket does actually leverage this by providing a build option (`pocket build --output vercel`) to output a vercel-compatible file-system format.
On vercel, pocket runs completely in vercel's edge-lambdas.