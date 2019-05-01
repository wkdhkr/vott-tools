export default class AssetHelper {
  public static getFileNameByHash(hash: string) {
    return `${hash}-asset.json`;
  }

  public static isAssetFileName(fileName: string) {
    return Boolean(fileName.match(/-asset.json$/));
  }
}
