#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { build } from "./build";
import { clean } from "./clean";
import { startDevServer } from "./dev";
import { startServer } from "./server";
import buildForVercel from "./vercel/build";

console.log("cli");
yargs(hideBin(process.argv))
  .command(
    "build",
    "emit a production build",
    (yargs) =>
      yargs
        .option("output", {
          choices: ["standalone", "vercel"],
          describe: "define output format",
          default: "standalone",
        })
        .option("disable-worker", {
          boolean: true,
          describe: "disable service worker",
          default: false,
        }),
    async (argv) => {
      console.log("build", argv);
      switch (argv.output) {
        case "standalone":
          await build({ disableWorker: argv["disable-worker"] });
          return;
        case "vercel":
          await buildForVercel({ disableWorker: argv["disable-worker"] });
          return;
      }
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
    (argv) => {
      startDevServer({ disableWorker: argv["disable-worker"] });
    }
  )
  .command(
    "clean",
    "clean up build files",
    () => {},
    () => {
      clean();
    }
  )
  .demandCommand(1)
  .parse();
