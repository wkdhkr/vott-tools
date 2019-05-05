import { Logger } from "log4js";
import { Config } from "../types";
import AssetService from "./asset/AssetService";
import StatisticsHelper from "./helpers/StatisticsHelper";

export default class StatisticsService {
  private config: Config;

  private as: AssetService;

  private log: Logger;

  public constructor(config: Config) {
    this.config = config;
    this.as = new AssetService(this.config);
    this.log = this.config.getLogger(this);
  }

  public async run() {
    const aw = await this.as.getWrapper();
    if (!aw) {
      return;
    }
    aw.getRegions().forEach(region =>
      region.tags.forEach(tag => StatisticsHelper.count(tag))
    );
  }

  public finish() {
    const counts = StatisticsHelper.getCounts();
    counts.forEach(c => {
      this.log.info(`count=${c.count}\ttag=${c.name}`);
    });
  }
}
