import { Logger } from "log4js";
import path from "path";
import { Config, ClearMode } from "../types";
import AssetService from "./asset/AssetService";
import AssetWrapper from "./asset/AssetWrapper";
import ProjectService from "./project/ProjectService";
import ProjectHelper from "./project/ProjectHelper";
import FileService from "../core/services/fs/FileService";
import { AssetState } from "../types/vott";

export default class ClearService {
  private config: Config;

  private as: AssetService;

  private fs: FileService;

  private log: Logger;

  public constructor(config: Config) {
    this.config = config;
    this.as = new AssetService(this.config);
    this.fs = new FileService(this.config);
    this.log = this.config.getLogger(this);
  }

  private async runTagMode(aw: AssetWrapper) {
    if (this.config.clearMode === ClearMode.tag) {
      const isInvalid = this.checkAsset(aw);
      if (isInvalid) {
        const projectFilePath = await this.detectProjectFilePath();
        const ps = new ProjectService({
          ...this.config,
          path: projectFilePath
        });
        const meta = aw.getMeta();
        meta.asset.state = AssetState.NotVisited;
        // meta.regions = [];

        Promise.all([
          ps.resetAssetById(aw.getId()),
          this.fs.delete(this.config.path)
        ]);
      }
    }
  }

  private async runFileMode(aw: AssetWrapper) {
    if (this.config.clearMode === ClearMode.file) {
      const filePath = aw.getRealPath();
      if (!(await this.fs.as.isExists(filePath))) {
        this.log.warn(
          `image file not found. id=${aw.getId()} path=${aw.getPath()}`
        );
        const ps = new ProjectService({
          ...this.config,
          path: await this.detectProjectFilePath()
        });
        await Promise.all([
          ps.resetAssetById(aw.getId()),
          this.fs.delete(this.config.path)
        ]);
      } else {
        /*
        this.log.debug(
          `image file found. id=${aw.getId()} path=${aw.getPath()}`
        );
        */
      }
    }
  }

  public async run() {
    const aw = await this.as.getWrapper();
    if (!aw) {
      return;
    }
    Promise.all([this.runTagMode(aw), this.runFileMode(aw)]);
  }

  private async detectProjectFilePath() {
    const dirPath = this.fs.getDirPath(this.config.path);
    const files = await this.fs.readDir(dirPath);
    const pjFileName = files.find(ProjectHelper.isProjectFileName);
    if (!pjFileName) {
      throw new Error("project file not found.");
    }
    return path.join(dirPath, pjFileName);
  }

  private checkAsset(aw: AssetWrapper) {
    const regions = aw.getRegions();
    return regions.some(region => {
      if (region.tags.length > 1 || region.tags.length === 0) {
        this.log.warn(
          `multiple tag region detected. id=${aw.getId()} path=${aw.getPath()}`
        );
        return true;
      }
      return false;
    });
  }
}
