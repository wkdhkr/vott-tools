export default class AssetHelper {
  public static getFileNameByHash(hash: string) {
    return `${hash}-asset.json`;
  }

  public static isAssetFileName(fileName: string) {
    return Boolean(fileName.match(/-asset.json$/));
  }

  public static removeFilePrefix(fileName: string): string {
    return fileName.replace(/^file:/, "");
  }

  public static preparePrefix(fileName: string): string {
    return `file:${AssetHelper.removeFilePrefix(fileName)}`;
  }
}
