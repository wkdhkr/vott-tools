import touch from "touch";
import pify from "pify";
import winattr from "winattr";
import fs from "fs-extra";
import path from "path";
import FileSystemHelper from "../../helpers/FileSystemHelper";
import { Config } from "../../../types";

export default class AttributeService {
  private config: Config;

  public constructor(config: Config) {
    this.config = config;
  }

  public isExists = async (targetPath?: string): Promise<boolean> =>
    fs.pathExists(targetPath || this.getSourcePath());

  public isSameDir(a: string, b?: string): boolean {
    return this.getDirPath(a) === this.getDirPath(b || undefined);
  }

  public getSourcePath = (targetPath?: string): string => {
    if (this.config.path) {
      return path.resolve(targetPath || this.config.path);
    }
    throw new Error("no target path.");
  };

  private getParsedPath = (
    targetPath?: string
  ): {
    base: string;
    dir: string;
    ext: string;
    name: string;
    root: string;
  } => path.parse(targetPath || this.getSourcePath());

  public getFileName(targetPath?: string): string {
    const { name, ext } = this.getParsedPath(targetPath);
    return `${name}${ext}`;
  }

  public getDirPath = (targetPath?: string): string => {
    if (targetPath && this.isDirectory(targetPath)) {
      return targetPath;
    }

    return this.getParsedPath(targetPath).dir;
  };

  public getDirName = (targetPath?: string): string =>
    path.basename(this.getDirPath(targetPath));

  public getFileStat(targetPath?: string): Promise<fs.Stats> {
    return this.getStat(targetPath || this.getSourcePath());
  }

  public getStat = (targetPath: string): Promise<fs.Stats> =>
    fs.stat(targetPath);

  public getDirStat(targetPath?: string): Promise<fs.Stats> {
    return this.getStat(targetPath || this.getDirPath());
  }

  public isDeadLink = async (targetPath?: string): Promise<boolean> => {
    try {
      const finalTargetPath = targetPath || this.getSourcePath();
      const destPath = await fs.readlink(finalTargetPath);

      try {
        await fs.stat(destPath);
        return false;
      } catch (e) {
        return true;
      }
    } catch (e) {
      return false;
    }
  };

  public isDirectory = (targetPath?: string): boolean =>
    FileSystemHelper.isDirectory(targetPath || this.getSourcePath());

  public touch = async (
    targetPath: string,
    force: boolean = false
  ): Promise<void> =>
    !this.config.dryrun || force ? pify(touch)(targetPath) : Promise.resolve();

  public hide = async (
    targetPath: string,
    force: boolean = false
  ): Promise<void> =>
    !this.config.dryrun || force
      ? pify(winattr.set)(targetPath, { hidden: true })
      : Promise.resolve();

  public touchHide = async (
    targetPath: string,
    force: boolean = false
  ): Promise<void> => {
    await this.touch(targetPath, force);
    await this.hide(targetPath, force);
  };

  public async isAccessible(targetPath?: string): Promise<boolean> {
    if (targetPath === this.config.dummyPath) {
      return Promise.resolve(false);
    }
    try {
      await fs.access(
        targetPath || this.getSourcePath(),
        // eslint-disable-next-line no-bitwise
        fs.constants.R_OK | fs.constants.W_OK
      );
      return true;
    } catch (e) {
      return false;
    }
  }
}
