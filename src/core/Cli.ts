import { Command } from "commander";
import { CommanderConfig } from "../types";

const program = new Command();

export default class Cli {
  private commander: Command;

  public constructor() {
    this.commander = program;
    this.init();
  }

  private init(): void {
    this.commander
      // .allowUnknownOption()
      .option("-v, --verbose", "show debug log")
      .option("-q, --quiet", "no prompt window")
      .option("-w, --wait", "wait on process end")
      .option("-l, --log-level [level]", "log level")
      .option("-L, --no-log-config", "no log config")
      .option("-p, --path [path]", "path to process")
      .option("-f, --fix-hash", "fix old version hash")
      .option("-n, --dryrun", "dryrun mode");
  }

  public parseArgs(): CommanderConfig {
    this.commander.parse(process.argv);
    return this.commander as CommanderConfig;
  }
}
