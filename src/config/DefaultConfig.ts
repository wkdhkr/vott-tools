// @flow
import path from "path";
import os from "os";

import { Configuration } from "log4js";
import { DefaultConfig, LogLevel } from "../types";
import EnvironmentHelper from "../core/helpers/EnvironmentHelper";

const log4jsConfig: Configuration = {
  appenders: {
    out: {
      type: "stdout",
      layout: { type: "pattern", pattern: "%[[%p] %c%] - %m" }
    },
    file: {
      type: "dateFile",
      filename: path.join(
        EnvironmentHelper.getHomeDir(),
        ".dedupper",
        "log",
        "process"
      ),
      pattern: ".yyyy-MM-dd.log",
      alwaysIncludePattern: true,
      // daysToKeep: 365,
      layout: {
        type: "pattern",
        pattern: "[%d][%z][%p] %c - %m"
      }
    }
  },
  categories: {
    default: { appenders: ["out", "file"], level: "info" }
  }
};

const defaultConfig: DefaultConfig = {
  log4jsConfig,
  dummyPath: "?",
  defaultLogLevel: LogLevel.DEBUG,
  defaultPath: ".",
  maxCpuLoadPercent: 60,
  maxWorkers: os.cpus().length
};

export default defaultConfig;
