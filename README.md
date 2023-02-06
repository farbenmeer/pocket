# pocket
The framework that fits in your pocket


## How it works
Pocket is a server-side web framework that runs in a service worker.

[Learn more](docs/about/how.md)

## Why another web framework?
* It works offline. Service workers are available offline. This is a feature that, so far, only client side apps could provide and even then only when used with clever caching.
* It does not need a hydration step to get interactive. Pocket sites are served from the server until the service worker loads so large bundle sizes are not a problem anymore.
As soon as the worker is ready it will switch from server-side rendering to rendering in a worker for subsequent requests.
* Client side frameworks (react, vue, svelte, angular) used to make websites appear faster as they did client side navigation which updates the DOM in small steps.
This prevented the page from showing up blank between loads and prevented a complete reload. This is not necessary anymore as browsers can now make native navigations
feel _really_ smooth.

[Learn more](docs/about/why.md)

## Caveats
* Very early state. Not production ready at all.
* Does not currently support any client side state.
* Navigation always requires the page to reload so state such as scroll position and form state will be lost.
* Due to low adoption of the CookieStore API cookie handling is a huge workaround. Cookies only work for `path=/` and on a best-effort basis.
* Regarding available APIs pocket routes are limited to the least common denominator which is mostly what's available in a service worker.

## Databases
To unlock the full potential of pocket's architecture one needs a distributed database that can run on a server and on a client and be queried directly as well as synchronized
to a client. This is a hard problem that has been only half-way solved so far but there's a bunch of promising projects working on it right now.

[Learn more](docs/about/databases.md)

## The Future
Pocket has a lot of potential that might be unlocked in the future. There is even massive potential beyond pure web applications.

[Learn more](docs/about/future.md)

## Usage
Add pocket to your project
```bash
yarn add @farbenmeer/pocket
```

Create your first route
```bash
mkdir routes
echo 'import { html } from "pocket";\n\nexport function body() {\n  return html`\n    Hello from pocket\n  `\n}' > routes/route.ts
```
Then use the dev server to see it in your browser
```bash
yarn pocket dev
```
or create a production build and run it
```bash
yarn pocket build
yarn pocket start
```

## Development
### Setup
install dependencies:
```bash
yarn
```

### Build
build a production build of the framework and example app
```bash
yarn build
```

### Run
the prod server for the example app
```bash
yarn start
```
then open [the todo-app](http://localhost:3000)

### Dev Server
the dev server will watch all dirs and even re-render
the example app when the framework is changed.
```bash
yarn dev
```

If you need to see the output from the server instead of the worker go to `examples/todo`
and run
```bash
yarn dev --disable-worker
```