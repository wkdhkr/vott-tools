import { Logger } from "log4js";
import { Config, SearchMode } from "../types";
import AssetService from "./asset/AssetService";
import ProjectService from "./project/ProjectService";
import AssetWrapper from "./asset/AssetWrapper";
import ProjectWrapper from "./project/ProjectWrapper";

export default class SearchService {
  private config: Config;

  private log: Logger;

  private as: AssetService;

  private ps: ProjectService;

  public constructor(config: Config) {
    this.config = config;
    this.as = new AssetService(config);
    this.ps = new ProjectService(config);
    this.log = config.getLogger(this);
  }

  private async checkAsset(aw: AssetWrapper) {
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
      this.log.info(
        `HIT! type=asset path=${this.config.path} id=${aw.getId()}`
      );
    }
    return isHit;
  }

  private async checkProject(pw: ProjectWrapper) {
    const assets = pw.getAssets();
    let isHitEntire = false;
    Object.keys(assets).forEach(id => {
      const asset = assets[id];
      let isHit = false;
      switch (this.config.searchMode) {
        case SearchMode.file:
          if (this.config.searchQuery) {
            if (asset.path.includes(this.config.searchQuery)) {
              isHit = true;
              isHitEntire = true;
            }
          }
          break;
        default:
      }
      if (isHit) {
        this.log.info(`HIT! type=project path=${asset.path} id=${asset.id}`);
      }
    });
    return isHitEntire;
  }

  public async check(): Promise<boolean> {
    const aw = await this.as.getWrapper();
    if (aw) {
      return this.checkAsset(aw);
    }
    const pw = await this.ps.getWrapper();

    if (pw) {
      return this.checkProject(pw);
    }
    return false;
  }
}
