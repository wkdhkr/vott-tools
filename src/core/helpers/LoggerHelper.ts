import log4js, { Logger, Configuration } from "log4js";
import { Class, LogLevel } from "../../types";
import EnvironmentHelper from "./EnvironmentHelper";

export default class LoggerHelper {
  public static flush(): Promise<void> {
    if (EnvironmentHelper.isTest()) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) =>
      log4js.shutdown(err => {
        if (err) {
          reject(err);
        }
        resolve();
      })
    );
  }

  public static configure(config: Configuration): void {
    if (EnvironmentHelper.isTest()) {
      return;
    }
    log4js.configure(config);
  }

  public static getLogger(clazz: Class): Logger {
    const logger = log4js.getLogger(`${clazz.constructor.name}`);
    if (EnvironmentHelper.isTest()) {
      logger.level = LogLevel.OFF;
    }
    return logger;
  }
}
