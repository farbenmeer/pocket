/**
 * @jest-environment jsdom
 */

import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
import "web-streams-polyfill/es2018";
import { registerLinks } from "./link";
import { html } from "../html";

describe("links", () => {
  it("attaches it's listeners", async () => {
    document.body.innerHTML = await html`
      <a id="link" href="/">home</a>
    `.renderToString();
    registerLinks();

    expect(document.querySelector("#link")).toBeDefined();
  });
});
