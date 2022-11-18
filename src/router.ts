import fs from "fs/promises";

export function generateRouter() {
  // read routes directory
  // figure out routes
  // build imports for get-function from each route
  // correctly handle requests
  console.log(`
  import * as homeRoute from "routes/route.ts"
  import * as contactRoute from "routes/contact/route.ts"

  export default function router(req: Request) {
      const url = new URL(req.url)
      const segments = url.pathname.split('/')

      // code that finally calls homeRoute or contactRoute

      return new Response(homeRoute.get(req) or contactRoute.get(req))
  }
`);
}
