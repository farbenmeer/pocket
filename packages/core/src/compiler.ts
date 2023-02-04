export function define(
  environment: "worker" | "server" | "edge" | "client",
  disableWorker: boolean
) {
  return {
    "process.env.POCKET_DISABLE_WORKER": disableWorker ? "true" : "false",
    "process.env.POCKET_IS_WORKER": environment === "worker" ? "true" : "false",
    "process.env.POCKET_IS_SERVER": environment === "server" ? "true" : "false",
    "process.env.POCKET_IS_EDGE": environment === "edge" ? "true" : "false",
    "process.env.POCKET_IS_CLIENT": environment === "client" ? "true" : "false",
  };
}
