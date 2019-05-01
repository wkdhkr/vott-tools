import { Logger } from "log4js";
import { Config, SearchMode } from "../types";
import AssetService from "./asset/AssetService";

export default class SearchService {
  private config: Config;

  private log: Logger;

  private as: AssetService;

  public constructor(config: Config) {
    this.config = config;
    this.as = new AssetService(config);
    this.log = config.getLogger(this);
  }

  public async check(): Promise<boolean> {
    const aw = await this.as.getWrapper();
    if (!aw) {
      return false;
    }
    const filePath = aw.getPath();

    let isHit = false;
    switch (this.config.searchMode) {
      case SearchMode.file:
        if (this.config.searchQuery) {
          if (filePath.includes(this.config.searchQuery)) {
            isHit = true;
          }
        }
        break;
      default:
    }
    if (isHit) {
      this.log.info(`HIT! path=${this.config.path} id=${aw.getId()}`);
    }
    return isHit;
  }
}
