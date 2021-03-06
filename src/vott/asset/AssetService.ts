import { Logger } from "log4js";
import MD5 from "md5.js";
import requireUncached from "require-uncached";
import { join } from "path";
import { Config } from "../../types";
import { IAssetMetadata } from "../../types/vott";
import StringHelper from "../helpers/StringHelper";
import FileService from "../../core/services/fs/FileService";
import AssetHelper from "../helpers/AssetHelper";
import AssetWrapper from "./AssetWrapper";

export default class AssetService {
  private config: Config;

  private log: Logger;

  private fs: FileService;

  public constructor(config: Config) {
    this.log = config.getLogger(this);
    this.config = config;
    this.fs = new FileService(config);
  }

  public async read(target?: string): Promise<IAssetMetadata | null> {
    const finalPath = target || this.config.path;
    if (AssetHelper.isAssetFileName(finalPath) === false) {
      this.log.debug(`is not asset file. skip. path=${finalPath}`);
      return null;
    }
    const content: IAssetMetadata = await requireUncached(finalPath);
    return content;
  }

  public calculateHash(target: string) {
    const finalPath = StringHelper.normalizeSlashes(
      AssetHelper.removeFilePrefix(target.replace(/\//g, "\\"))
    );
    const normalizedPath = finalPath.toLowerCase();
    let filePath = finalPath;
    // If the path is not already prefixed with a protocol
    // then assume it comes from the local file system
    if (
      !normalizedPath.startsWith("http://") &&
      !normalizedPath.startsWith("https://") &&
      !normalizedPath.startsWith("file:")
    ) {
      // First replace \ character with / the do the standard url encoding then encode unsupported characters
      filePath = StringHelper.encodeFileURI(finalPath, true);
    }

    const finalHashSource = filePath;
    const md5 = (src: string): string => new MD5().update(src).digest("hex");
    const md5Hash = md5(finalHashSource);

    this.log.trace(`src=${target} hash=${md5(finalHashSource)}`);

    return md5Hash;
  }

  public async getWrapper(target?: string) {
    const finalPath = target || this.config.path;
    const meta = await this.read(finalPath);
    if (meta) {
      return new AssetWrapper(meta);
    }
    return null;
  }

  public async fixOldVersionHash(target?: string): Promise<void> {
    const finalPath = target || this.config.path;
    const aw = await this.getWrapper(finalPath);
    if (!aw) {
      return;
    }
    const calculatedHash = this.calculateHash(aw.getPath());
    if (calculatedHash === aw.getId()) {
      this.log.debug(`correct hash detected. path=${finalPath}`);
      return;
    }
    this.log.warn(`incorrect hash detected. path=${finalPath}`);
    const meta = aw.getMeta();
    meta.asset.id = calculatedHash;
    if (aw.isTagged()) {
      await this.write(meta);
    }
    await this.fs.delete(target);
  }

  public async write(meta: IAssetMetadata, destPath?: string) {
    const finalDestDirPath = this.fs.getDirPath(destPath || this.config.path);
    const fileName = AssetHelper.getFileNameByHash(meta.asset.id);
    const finalDestPath = join(finalDestDirPath, fileName);
    await this.fs.write(meta, finalDestPath);
    this.log.info(`write correct hash file. path=${finalDestPath}`);
  }
}
