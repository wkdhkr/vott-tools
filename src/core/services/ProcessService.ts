import maxListenersExceededWarning from "max-listeners-exceeded-warning";
import events from "events";
import pLimit from "p-limit";

import { Logger } from "log4js";
import ProcessHelper from "../helpers/ProcessHelper";
import EnvironmentHelper from "../helpers/EnvironmentHelper";
import QueueHelper from "../helpers/QueueHelper";
import LoggerHelper from "../helpers/LoggerHelper";
import FileService from "./fs/FileService";
import { Config } from "../../types";
import AssetService from "../../vott/asset/AssetService";

export default class ProcessService {
  private log: Logger;

  private config: Config;

  public isParent: boolean;

  private fileService: FileService;

  private assetService: AssetService;

  public constructor(config: Config, path: string, isParent: boolean = true) {
    let { dryrun } = config;
    if (EnvironmentHelper.isTest()) {
      maxListenersExceededWarning();
      dryrun = true;
    }
    this.config = {
      ...config,
      dryrun,
      path
    };
    this.isParent = isParent;

    this.log = this.config.getLogger(this);
    this.fileService = new FileService(this.config);
    this.assetService = new AssetService(this.config);
  }

  public async process(): Promise<boolean> {
    let result;
    if (await this.fileService.isDirectory()) {
      result = (await this.processDirectory()).every(Boolean);
    } else {
      result = await this.processFile();
    }
    await QueueHelper.waitOperationWaitPromises();
    if (this.isParent) {
      await LoggerHelper.flush();
    }
    return result;
  }

  private async processDirectory(): Promise<boolean[]> {
    const filePaths = await this.fileService.collectFilePaths();
    const limit = pLimit(this.config.maxWorkers);
    const eventEmitter = new events.EventEmitter();
    eventEmitter.setMaxListeners(
      eventEmitter.getMaxListeners() * this.config.maxWorkers
    );

    const results = await Promise.all(
      filePaths.map(f =>
        limit(async () => {
          const ps = new ProcessService(this.config, f, false);
          return ps.process();
        })
      )
    );
    await QueueHelper.waitOperationWaitPromises();
    return results;
  }

  private async processRegularFile() {
    if (this.config.fixHash) {
      await this.assetService.fixOldVersionHash();
    }
    return true;
  }

  private async processFile(): Promise<boolean> {
    // TODO: config
    if (QueueHelper.operationWaitPromises.length > 100) {
      await QueueHelper.waitOperationWaitPromises();
    }
    await ProcessHelper.waitCpuIdle(this.config.maxCpuLoadPercent);
    await QueueHelper.waitOperationWaitPromises();
    try {
      // TODO: implement
      return this.processRegularFile();
    } catch (e) {
      if (EnvironmentHelper.isTest()) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
      this.log.fatal(e);
      return false;
    }
  }
}
