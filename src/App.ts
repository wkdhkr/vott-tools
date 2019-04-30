import maxListenersExceededWarning from "max-listeners-exceeded-warning";
import { Logger } from "log4js";
import Cli from "./core/Cli";
import EnvironmentHelper from "./core/helpers/EnvironmentHelper";
import defaultConfig from "./config/DefaultConfig";
import LoggerHelper from "./core/helpers/LoggerHelper";
import { Config, Class, LogLevel } from "./types";
import ProcessService from "./core/services/ProcessService";
import ProcessHelper from "./core/helpers/ProcessHelper";

export default class App {
  private cli: Cli;

  private log: Logger;

  private config: Config;

  private processService: ProcessService;

  public constructor() {
    this.cli = new Cli();
    const userConfig = EnvironmentHelper.loadUserConfig();

    const config: Config = {
      ...defaultConfig,
      ...userConfig,
      ...this.cli.parseArgs(),
      getLogger: x => LoggerHelper.getLogger(x) // dummy
    };

    if (EnvironmentHelper.isTest()) {
      maxListenersExceededWarning();
      config.dryrun = true;
    }

    const logLevel = config.verbose
      ? LogLevel.TRACE
      : config.logLevel || config.defaultLogLevel;

    config.getLogger = (clazz: Class) => {
      const logger = LoggerHelper.getLogger(clazz);
      if (this.config.quiet) {
        logger.level = LogLevel.DEBUG;
      } else {
        logger.level = logLevel;
      }
      return logger;
    };
    this.config = config;
    if (this.config.logConfig) {
      if (this.config.dryrun) {
        this.config.log4jsConfig.categories.default.appenders = ["out"];
      }
      if (!this.config.quiet) {
        LoggerHelper.configure(config.log4jsConfig);
      }
    }
    this.log = this.config.getLogger(this);

    if (this.config.path) {
      this.processService = new ProcessService(this.config, this.config.path);
    } else {
      this.processService = new ProcessService(
        this.config,
        this.config.defaultPath
      );
    }
  }

  public async run(): Promise<void> {
    this.log.debug("application start!");
    let isError = false;

    try {
      if (this.config.dryrun) {
        this.log.info("dryrun mode.");
      }
      const result = await this.processService.process();
      if (!result) {
        isError = true;
      }
    } catch (e) {
      isError = true;
      this.log.fatal(e);
    }

    await this.close(isError);
  }

  private close(isError: boolean) {
    const exitCode = isError ? 1 : 0;
    if (this.config.wait) {
      setTimeout(
        // eslint-disable-next-line no-console
        () => console.log("\ndone.\nPress any key or two minutes to exit..."),
        500
      );
      setTimeout(() => ProcessHelper.exit(exitCode), 1000 * 120);
      ProcessHelper.setStdInHook("data", () => ProcessHelper.exit(exitCode));
    } else if (isError) {
      ProcessHelper.exit(exitCode);
    }
  }
}
