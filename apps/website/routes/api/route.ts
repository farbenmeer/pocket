import { container } from "components/container.js";
import { docsPage } from "components/docs-page.js";
import markdown from "components/markdown.module.css";
import { html } from "pocket";
import cookies from "../../../../docs/api/cookies.md";
import filesystem from "../../../../docs/api/filesystem.md";

export function body() {
  return docsPage({
    items: [
      { id: "filesystem", title: "The Filesystem API", content: filesystem },
    ],
  });
}
