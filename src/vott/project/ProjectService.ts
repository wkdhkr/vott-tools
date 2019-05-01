import { join } from "path";
import fs from "fs-extra";
import { Logger } from "log4js";
import { Config } from "../../types";
import { IProject, IAsset } from "../../types/vott";
import ProjectWrapper from "./ProjectWrapper";
import AssetService from "../asset/AssetService";
import FileService from "../../core/services/fs/FileService";
import ProjectHelper from "./ProjectHelper";

export default class ProjectService {
  private config: Config;

  private log: Logger;

  private assetService: AssetService;

  private fs: FileService;

  public constructor(config: Config) {
    this.config = config;
    this.assetService = new AssetService(config);
    this.fs = new FileService(config);
    this.log = config.getLogger(this);
  }

  public async read(target?: string): Promise<IProject> {
    const finalPath = target || this.config.path;
    const content: IProject = JSON.parse(await fs.readFile(finalPath, "utf-8"));
    return content;
  }

  public async fixOldVersionHash(target?: string) {
    const finalPath = target || this.config.path;
    if (ProjectHelper.isProjectFileName(finalPath) === false) {
      // this.log.debug(`is not project file. skip. path=${finalPath}`);
      return;
    }
    const project = await this.read();
    const pw = new ProjectWrapper(project);
    const assets = pw.getAssets();

    const fixedAssets: { [index: string]: IAsset } = {};

    Object.keys(assets).forEach((id: string) => {
      const asset = assets[id];
      const hash = this.assetService.calculateHash(asset.path);
      if (asset.id !== hash) {
        this.log.warn(`detect incorrect hash. from=${asset.id} to=${hash}`);
        asset.id = hash;
      }
      fixedAssets[asset.id] = asset;
    });

    pw.setAssets(fixedAssets);
    await this.write(pw.getProject());
  }

  public async write(project: IProject, destPath?: string) {
    const finalDestDirPath = this.fs.getDirPath(destPath || this.config.path);
    const fileName = `${project.name}.vott`;
    const finalDestPath = join(finalDestDirPath, fileName);
    await this.fs.write(project, finalDestPath);
    this.log.info(`write correct hash file. path=${finalDestPath}`);
  }
}
