import * as program from "commander";
import { Logger, Configuration } from "log4js";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface Class {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): any;
}

type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U }
  ? U
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequiredOnly<T extends Record<any, any>> = Pick<T, KnownKeys<T>>;

export enum SearchMode {
  file = "file",
  hash = "hash",
  tag = "tag"
}

export enum LogLevel {
  ALL = "ALL",
  MARK = "MARK",
  TRACE = "TRACE",
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
  OFF = "OFF"
}

export interface DefaultConfig {
  log4jsConfig: Configuration;
  dummyPath: string;
  defaultLogLevel: LogLevel;
  /** When cpu load exceeds this value, program will wait to process the next file. */
  maxCpuLoadPercent: number;
  /** Number of concurrent executions. */
  maxWorkers: number;
  /** target to process */
  path: string;
}

// export interface UserConfig extends Partial<DefaultConfig> {}
export type UserConfig = Partial<DefaultConfig>;

export interface CommanderConfig extends RequiredOnly<program.CommanderStatic> {
  /** dryrun mode. */
  dryrun?: boolean;
  /** debug log. */
  verbose?: boolean;
  /** prevent log output */
  quiet?: boolean;
  /** Wait at the end of processing. */
  wait?: boolean;
  /** log level for log4js. */
  logLevel?: LogLevel;
  /** use log config */
  logConfig: boolean;
  /** search mode */
  searchMode?: SearchMode;
  /** search query */
  searchQuery?: string;
  /** fix old version hash */
  fixHash?: boolean;
}

export interface Config extends DefaultConfig, CommanderConfig {
  getLogger(x: InstanceType<Class>): Logger;
}
