import { RequestCookies, ResponseCookies } from "@edge-runtime/cookies";
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

    expect(res.getHeader("Set-Cookie")).not.toContain("test=test");
  });

  it("sets a cookie through the ResponseCookies API", async () => {
    const code = `
        addEventListener("fetch", (evt) => {
            const res = new Response(null)
            const cookies = new ResponseCookies(res.headers)
            cookies.set("test", "test")
            evt.respondWith(res)
        })
    `;

    const runtime = new EdgeRuntime({
      initialCode: code,
      extend(context) {
        context.ResponseCookies = ResponseCookies;
        return context;
      },
    });

    const { handler } = createHandler({ runtime });

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await handler(req, res);

    console.log(res.getHeaders());
    expect(res.getHeader("Set-Cookie")).toContainEqual(
      expect.stringContaining("test=test")
    );
  });

  it("counts cookies", async () => {
    const requestCookies = new RequestCookies(
      new Headers({ Cookie: "test=test;a=b;c=d" })
    );

    expect(requestCookies.size).toBe(3);
  });
});
