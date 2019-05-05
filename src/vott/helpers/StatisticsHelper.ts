export default class StatisticsHelper {
  private static countMap: { [key: string]: number } = {};

  public static count(tag: string) {
    const normalizedTag = tag.replace(/-(Down|Right|Left)/g, "");
    StatisticsHelper.countMap[normalizedTag] =
      (StatisticsHelper.countMap[normalizedTag] || 0) + 1;
  }

  public static getCounts() {
    const map = StatisticsHelper.countMap;
    const counts: { name: string; count: number }[] = [];
    Object.keys(map).forEach(name => {
      const count = map[name];
      counts.push({
        name,
        count
      });
    });
    return counts.sort(({ count: a }, { count: b }) => b - a);
  }
}
