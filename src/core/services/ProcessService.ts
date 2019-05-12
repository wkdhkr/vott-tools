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
import ProjectService from "../../vott/project/ProjectService";
import SearchService from "../../vott/SearchService";
import ClearService from "../../vott/ClearService";
import LockHelper from "../helpers/LockHelper";
import StatisticsService from "../../vott/StatisticService";

export default class ProcessService {
  private static LOCK_KEY = "process-service";

  private log: Logger;

  private config: Config;

  public isParent: boolean;

  private fileService: FileService;

  private assetService: AssetService;

  private projectService: ProjectService;

  private searchService: SearchService;

  private clearService: ClearService;

  private statisticsService: StatisticsService;

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
    this.projectService = new ProjectService(this.config);
    this.searchService = new SearchService(this.config);
    this.clearService = new ClearService(this.config);
    this.statisticsService = new StatisticsService(this.config);
  }

  public async process(): Promise<boolean> {
    let result;
    await LockHelper.unlockProcess();
    if (await this.fileService.isDirectory()) {
      result = (await this.processDirectory()).every(Boolean);
    } else {
      result = await this.processFile();
    }
    await QueueHelper.waitOperationWaitPromises();
    if (this.isParent) {
      this.statisticsService.finish();
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
      await this.projectService.fixOldVersionHash();
    }
    if (this.config.searchMode) {
      await this.searchService.run();
    }
    if (this.config.clearMode) {
      await this.clearService.run();
    }
    if (this.config.statistics) {
      await this.statisticsService.run();
    }
    if (this.config.tagSort) {
      await this.projectService.sortTag();
    }
    return true;
  }

  private async processFile(): Promise<boolean> {
    // TODO: config
    if (QueueHelper.operationWaitPromises.length > 100) {
      await QueueHelper.waitOperationWaitPromises();
    }
    await ProcessHelper.waitCpuIdle(this.config.maxCpuLoadPercent);
    try {
      await LockHelper.lockKey(ProcessService.LOCK_KEY);
      const result = await this.processRegularFile();
      await LockHelper.unlockKey(ProcessService.LOCK_KEY);
      return result;
    } catch (e) {
      if (EnvironmentHelper.isTest()) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
      this.log.fatal(e);
      return false;
    } finally {
      await LockHelper.unlockKey(ProcessService.LOCK_KEY);
    }
  }
}
