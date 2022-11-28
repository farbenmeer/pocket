# pocket
The framework that fits in your pocket

## Usage
Add pocket to your project
```bash
yarn add @farbenmeer/pocket
```

Create your first route
```bash
mkdir routes
echo 'import { html } from "pocket";\n\nexport function get() {\n  return html`\n    Hello from pocket\n  `\n}' > routes/route.ts
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