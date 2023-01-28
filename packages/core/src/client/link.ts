import { syncCookies } from "./cookies";

export function registerLinks() {
  document.querySelectorAll("a[soft]").forEach((anchor) => {
    anchor.addEventListener("click", async (evt) => {
      if (!anchor.hasAttribute("soft")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }

      const targetUrl = new URL(href, window.location.href);
      if (targetUrl.host !== window.location.host) {
        return;
      }

      evt.preventDefault();

      const commonAncestors = getCommonAncestors(
        targetUrl,
        anchor.getAttribute("root") ?? ""
      );

      const response = await fetch(href, {
        headers: {
          "X-Pocket-Root": "/" + commonAncestors.join("/"),
        },
      });
      if (!process.env.POCKET_DISABLE_WORKER) {
        await syncCookies();
      }

      window.history.pushState(null, "", targetUrl);

      if (!response.ok) {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(
          await response.text(),
          "text/html"
        );
        window.document.head.replaceChildren(
          ...Array.from(newDoc.head.childNodes)
        );
        window.document.body.replaceChildren(
          ...Array.from(newDoc.body.childNodes)
        );
        return;
      }

      const renderTarget = response.headers.get("X-Pocket-Target");
      if (renderTarget) {
        await replaceBetween(
          `_pocket-b${renderTarget}`,
          `_pocket-a${renderTarget}`,
          response.text()
        );
        return;
      }

      const parser = new DOMParser();
      const newDoc = parser.parseFromString(await response.text(), "text/html");
      window.document.head.replaceChildren(
        ...Array.from(newDoc.head.childNodes)
      );
      window.document.body.replaceChildren(
        ...Array.from(newDoc.body.childNodes)
      );
    });
  });
}

function getCommonAncestors(target: URL, root: string) {
  const targetSegments = target.pathname.split("/");
  const currentSegments = window.location.pathname.split("/");
  const rootSegments = root ? root.split("/") : targetSegments;

  for (const index in targetSegments) {
    if (
      targetSegments[index] !== currentSegments[index] ||
      targetSegments[index] !== rootSegments[index]
    ) {
      return targetSegments.slice(0, index as any);
    }
  }
  return [];
}

async function replaceBetween(
  startId: string,
  endId: string,
  newContent: Promise<string>
) {
  const start = document.getElementById(startId);
  const end = document.getElementById(endId);
  const parent = start?.parentNode;

  if (!start || !end || !parent) {
    throw new Error("Invalid Render Target");
  }

  let remove = false;
  for (const child of Array.from(start.parentNode.childNodes)) {
    if (child === start) {
      remove = true;
      continue;
    }
    if (child === end) {
      break;
    }
    if (remove) {
      parent.removeChild(child);
    }
  }

  end.insertAdjacentHTML("beforebegin", await newContent);
  return;
}
