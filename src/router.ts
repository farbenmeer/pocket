import fs from "fs/promises";

export async function generateRouter() {
  async function parseDirectory(path: string, root: any) {
    const routes = await fs.readdir(path);

    for (const entry of routes) {
      if (entry === "route.ts") {
        root.index = true;
        return;
      }

      if ((await fs.stat(path + "/" + entry)).isDirectory()) {
        root[entry] = {};
        await parseDirectory(path + "/" + entry, tree[entry]);
      }
    }
  }

  const tree: any = {};
  await parseDirectory("examples/todo/routes", tree);

  console.log({ tree });
  // read routes directory
  // figure out routes
  // build imports for get-function from each route
  // correctly handle requests
  //  console.log(`
  //  import * as homeRoute from "routes/route.ts"
  //  import * as contactRoute from "routes/contact/route.ts"
  //
  //  export default function router(req: Request) {
  //      const url = new URL(req.url)
  //      const segments = url.pathname.split('/')
  //
  //      // code that finally calls homeRoute or contactRoute
  //
  //      return new Response(homeRoute.get(req) or contactRoute.get(req))
  //  }
  //`);
}
