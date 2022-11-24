import { createHandler, EdgeRuntime } from "edge-runtime";
import * as httpMocks from "node-mocks-http";

describe("edge runtime", () => {
  it("sets a cookie", async () => {
    const code = `
        addEventListener("fetch", (evt) => {
            evt.respondWith(new Response(null, { headers: { 'Set-Cookie': 'test=test' }}))
        })
    `;

    const runtime = new EdgeRuntime({
      initialCode: code,
    });

    const response = await runtime.dispatchFetch("http://test.test");

    expect(response.headers.get("Set-Cookie")).toBe("test=test");
  });

  it("sets a cookie after the response has been created", async () => {
    const code = `
        addEventListener("fetch", (evt) => {
            const res = new Response("This is some text")

            res.headers.set('Set-Cookie', 'test=test')

            evt.respondWith(res)
        })
    `;

    const runtime = new EdgeRuntime({
      initialCode: code,
    });

    const response = await runtime.dispatchFetch("http://test.test");

    expect(response.headers.get("Set-Cookie")).toBe("test=test");
  });

  it("does not set a cookie when using createHandler", async () => {
    const code = `
        addEventListener("fetch", (evt) => {
            evt.respondWith(new Response(null, { headers: { 'Set-Cookie': 'test=test' }}))
        })
    `;

    const runtime = new EdgeRuntime({
      initialCode: code,
    });

    const { handler } = createHandler({ runtime });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await handler(req, res);

    console.log(res.getHeaders());
    expect(res.getHeader("Set-Cookie")).not.toContain("test=test");
  });
});
