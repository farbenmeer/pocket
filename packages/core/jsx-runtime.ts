export function jsx(tag: string | Function, props: Record<string, any>) {
  if (typeof tag === "string") {
    const { children, ...attributes } = props;
    return `<${tag} ${Object.entries(
      attributes.map(([key, value]: [string, any]) => `key="${value}"`)
    ).join(" ")}>${children}</${tag}>`;
  }
}
