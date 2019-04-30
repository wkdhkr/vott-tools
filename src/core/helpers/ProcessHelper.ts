import sleep from "await-sleep";
import os from "os-utils";

export default class ProcessHelper {
  private static stdin = process.stdin;

  private static stdout = process.stdout;

  private static currentCpuLoad = 1;

  public static setStdInHook = (event: string, cb: () => void) => {
    if (ProcessHelper.stdout.isTTY) {
      if (ProcessHelper.stdin.setRawMode) {
        ProcessHelper.stdin.setRawMode(true);
      }
    }
    ProcessHelper.stdin.resume();
    ProcessHelper.stdin.on(event, cb);
  };

  public static exit = (code: number) => {
    process.exit(code);
  };

  public static waitCpuIdle = async (max: number): Promise<void> => {
    // eslint-disable-next-line no-await-in-loop
    while ((await ProcessHelper.getCpuUsage()) > max / 100) {
      const randomSleepMs = (Math.random() * 10 + 1) * 1000;
      // console.log(`sleep for cpu idle.. sleepMs = ${randomSleepMs}`);
      // eslint-disable-next-line no-await-in-loop
      await sleep(randomSleepMs);
    }
  };

  private static setCurrentCpuLoad = (n: number) => {
    ProcessHelper.currentCpuLoad = n;
    // console.log(`cpu load: ${n}`);
  };

  public static getCpuUsage = (): Promise<number> =>
    new Promise(async resolve => {
      os.cpuUsage((v: number) => {
        ProcessHelper.setCurrentCpuLoad(v);
      });
      resolve(ProcessHelper.currentCpuLoad);
    });
}
