#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { build } from "./build.js";
import { clean } from "./clean.js";
import { startDevServer } from "./dev.js";
import { startServer } from "./server/start.js";
import buildForVercel from "./vercel/build.js";

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
    (yargs) => {
      return yargs.options("p", {
        alias: "port",
        type: "number",
        default: 3000,
        describe: "port on which to server the app",
      });
    },
    (argv) => {
      startServer({ port: argv.p });
    }
  )
  .command(
    "dev",
    "run dev server",
    (yargs) => {
      return yargs
        .option("disable-worker", {
          type: "boolean",
          describe: "disable service worker",
        })
        .option("p", {
          alias: "port",
          type: "number",
          default: 3000,
          describe: "port on which to serve the app",
        });
    },
    (argv) => {
      startDevServer({ disableWorker: argv["disable-worker"], port: argv.p });
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
