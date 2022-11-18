import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { build } from "./build";
import { startServer } from "./server-runtime";

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
  .demandCommand(1)
  .parse();
