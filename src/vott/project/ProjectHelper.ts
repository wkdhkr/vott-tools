export default class ProjectHelper {
  public static isProjectFileName(fileName: string) {
    return Boolean(fileName.match(/\.vott$/));
  }
}
