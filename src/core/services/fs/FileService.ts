import waitOn from "wait-on";
import sleep from "await-sleep";
import mv from "mv";
import path from "path";
// import mkdirp from "mkdirp";
import fs from "fs-extra";
import recursiveReadDir from "recursive-readdir";
import pify from "pify";
import trash from "trash";

import { Logger } from "log4js";
import { isObject } from "util";
import AttributeService from "./AttributeService";
import { Config } from "../../../types";

const mvAsync: (from: string, to: string) => Promise<void> = pify(mv);
// const mkdirAsync: (x: string) => Promise<void> = pify(mkdirp);

export default class FileService {
  private log: Logger;

  private config: Config;

  private as: AttributeService;

  public getSourcePath: (targetPath?: string) => string;

  public getDirPath: (targetPath?: string) => string;

  public isDirectory: (targetPath?: string) => boolean;

  public constructor(config: Config) {
    this.log = config.getLogger(this);
    this.config = config;
    this.as = new AttributeService(config);
    this.getSourcePath = this.as.getSourcePath;
    this.getDirPath = this.as.getDirPath;
    this.isDirectory = this.as.isDirectory;
  }

  public wait = (targetPath?: string): Promise<void> =>
    new Promise((resolve, reject) => {
      waitOn(
        {
          resources: [path.resolve(targetPath || this.getSourcePath())],
          timeout: 60000
        },
        err => {
          if (err) {
            reject();
            return;
          }
          resolve();
        }
      );
    });

  public unlink = async (targetPath?: string): Promise<void> => {
    const finalTargetPath = this.getSourcePath(targetPath);
    this.log.debug(`unlink: path = ${finalTargetPath}`);
    if (this.config.dryrun) {
      return;
    }
    await fs.unlink(finalTargetPath);
    await this.waitDelete(finalTargetPath);
  };

  public collectFilePaths = async (targetPath?: string): Promise<string[]> =>
    recursiveReadDir(targetPath || this.getSourcePath());

  public async delete(
    targetPath?: string,
    isRetry: boolean = false
  ): Promise<void> {
    const finalTargetPath = this.getSourcePath(targetPath);
    if (!(await fs.pathExists(finalTargetPath))) {
      return;
    }
    try {
      if (!isRetry) {
        this.log.warn(`delete file/dir: path = ${finalTargetPath}`);
      }

      if (!this.config.dryrun) {
        await trash([finalTargetPath], { glob: false });
        await this.waitDelete(finalTargetPath);
      }
    } catch (e) {
      // retry. avoid EBUSY error
      // this.log.warn(e);
      if (await fs.pathExists(finalTargetPath)) {
        await sleep(200);
        await this.delete(finalTargetPath);
      }
    }
  }

  public waitDelete = async (targetPath: string): Promise<void> => {
    let i = 0;
    // eslint-disable-next-line no-await-in-loop
    while (await fs.pathExists(targetPath)) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(200);
      i += 1;
      if (i === 60 * 5) {
        throw new Error(`wait delete timeout path = ${targetPath}`);
      }
    }
  };

  public async rename(
    from: string,
    to?: string,
    isRetry: boolean = false
  ): Promise<void> {
    const finalFrom = to ? from : this.getSourcePath();
    const finalTo = to || from;
    if (finalFrom === finalTo) {
      return;
    }
    if (!isRetry) {
      this.log.info(`rename file: from = ${finalFrom}, to = ${finalTo}`);
    }
    if (this.config.dryrun) {
      return;
    }
    try {
      await mvAsync(finalFrom, finalTo);
      return;
    } catch (e) {
      // retry. avoid EBUSY error
      // this.log.warn(e);
      if (await fs.pathExists(finalFrom)) {
        await sleep(200);
        await this.rename(finalFrom, finalTo, true);
        return;
      }
      throw e;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async write(content: string | Record<string, any>, target?: string) {
    const finalTarget = this.getSourcePath(target);
    if (!this.config.dryrun) {
      if (isObject(content)) {
        await fs.writeJSON(finalTarget, content);
      } else {
        await fs.writeFile(finalTarget, content);
      }
    }
  }
}
