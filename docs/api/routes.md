# Routes

Routes are files located within the `/routes` directory named `route.ts`.

Each route corresponds to an application endpoint. Routes can export a couple of special functions:

## body
If a route exports a function called `body` it is interpreted as a template for the response [html](./html.md) body.
```ts
export function body({ req, props }: RouteBodyContext<Props>) {
    return html`
        <main>
            <h1>This is a title</h1>
            <p>This is some content</p>
        </main>
    `
}
```
The `body` has access to the [request](./request.md) object:
```ts
export function body({ req, props }: RouteBodyContext<Props>) {
    return html`
        <main>
            <h1>This is a title</h1>
            <p>The current user is ${req.cookies.get('current-user')}</p>
        </main>
    `
}
```

## head
If a route exports a function called `head` it is interpreted as a template for the response [html](./html.md) head.
```ts
export function head({ req, props }: RouteHeadContext<Props>) {
    return html`
        <title>This is a title</title>
        <meta name="description" content="This is a description" />
    `
}
```

## methods
Additionally, routes can export arbitrary functions that will handle the matching http-methods, e.G.
```ts
export function get({ req, render }: RouteHandlerContext<Props>) {
    return new PocketResponse(null)
}
```
would return an empty response for the `get`-Method.

Methods can access properties of the [request](./request.md) and return either arbitrary data:
```ts
export function get() {
    return PocketResponse.json({
        title: 'This is a title',
        content: 'This is some content'
    })
}
```
or html from the `head` and `body` using the `render`-callback passed to it:
```ts
type Props = {
    title: string;
    content: string;
}

export function body({ props }: RouteBodyContext<Props>) {
    return html`
        <main>
            <h1>${props.title}</h1>
            <p>${props.content}</p>
        </main>
    `
}

export function get({ render }: RouteHandlerContext<Props>) {
    return render({ title: "This is a title", content: "This is some content" })
}

export function post({ req, render }: RouteHandlerContext<Props>) {
    const { title, content } = await req.json()
    return render({ title, content })
}
```

and these handlers can also set cookies:
```ts
export function post({ req, render }: RouteHandlerContext<Props>) {
    const { title, content } = await req.json()
    return new PocketResponse(render({ title, content }), { cookies: { title, content }})
}
```