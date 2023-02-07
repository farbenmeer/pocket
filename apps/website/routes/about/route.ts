import { docsPage } from "components/docs-page.js";
import { html } from "pocket";
import databases from "../../../../docs/about/databases.md";
import future from "../../../../docs/about/future.md";
import how from "../../../../docs/about/how.md";
import why from "../../../../docs/about/why.md";

export function body() {
  return docsPage({
    items: [
      { id: "how", title: "How?", content: how },
      { id: "why", title: "Why?", content: why },
      { id: "future", title: "Future", content: future },
      { id: "databases", title: "Databases", content: databases },
    ],
  });
}
