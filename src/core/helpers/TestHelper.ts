import { Logger } from "log4js";
import DefaultConfig from "../../config/DefaultConfig";
import Cli from "../Cli";
import LoggerHelper from "./LoggerHelper";
import { Config, Class, LogLevel } from "../../types";

export default class TestHelper {
  public static getLogger(clazz: Class): Logger {
    const logger = LoggerHelper.getLogger(clazz);
    logger.level = LogLevel.DEBUG;
    return logger;
  }

  public static createDummyConfig(): Config {
    const cli = new Cli();
    return {
      ...DefaultConfig,
      ...cli.parseArgs(),
      getLogger: this.getLogger
    };
  }
}
