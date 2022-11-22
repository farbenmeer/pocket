#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { build } from "./build";
import { startDevServer } from "./dev";
import { startServer } from "./server";

yargs(hideBin(process.argv))
  .command(
    "build",
    "emit a production build",
    () => {},
    () => {
      build();
    }
  )
  .command(
    "start",
    "run a production build",
    () => {},
    () => {
      startServer();
    }
  )
  .command(
    "dev",
    "run dev server",
    (yargs) => {
      return yargs
        .boolean("disable-worker")
        .describe("disable-worker", "disable service worker");
    },
    (flags) => {
      startDevServer({ disableWorker: flags["disable-worker"] });
    }
  )
  .demandCommand(1)
  .parse();
