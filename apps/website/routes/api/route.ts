import { container } from "components/container.js";
import { docsPage } from "components/docs-page.js";
import cookies from "../../../../docs/api/cookies.md";
import filesystem from "../../../../docs/api/filesystem.md";
import routes from "../../../../docs/api/routes.md";
import layouts from "../../../../docs/api/layouts.md";
import htmlContent from "../../../../docs/api/html.md";
import request from "../../../../docs/api/request.md";
import response from "../../../../docs/api/response.md";

export function body() {
  return docsPage({
    items: [
      { id: "filesystem", title: "The Filesystem API", content: filesystem },
      { id: "routes", title: "Routes", content: routes },
      { id: "layouts", title: "Layouts", content: layouts },
      { id: "html", title: "Templates", content: htmlContent },
      { id: "request", title: "PocketRequest", content: request },
      { id: "response", title: "PocketResponse", content: response },
      { id: "cookies", title: "Cookies", content: cookies },
    ],
  });
}
