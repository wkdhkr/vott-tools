import sleep from "await-sleep";
import os from "os";
import path from "path";
import lockFile from "lockfile";
import EnvironmentHelper from "./EnvironmentHelper";

export default class LockHelper {
  private static keyLockMap: { [s: string]: true } = {};

  public static getKeyLockMap(): { [s: string]: true } {
    return { ...this.keyLockMap };
  }

  private static getLockFilePath(name: string): string {
    const appName = EnvironmentHelper.getAppName();
    return path.join(os.tmpdir(), `${appName}.${name}.lock`);
  }

  public static async lockKey(key: string): Promise<void> {
    if (key === "") {
      return;
    }
    let count = 1;
    while (this.keyLockMap[key]) {
      if (count === 60 * 10) {
        throw new Error(`key lock fail. key = ${key}`);
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(1000);
      count += 1;
    }
    LockHelper.keyLockMap[key] = true;
  }

  public static unlockKey(key: string) {
    if (key === "") {
      return;
    }
    delete LockHelper.keyLockMap[key];
  }

  public static async lockProcess(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      lockFile.lock(
        this.getLockFilePath("process"),
        {
          wait: Infinity,
          pollPeriod: 1000,
          retries: 5
        },
        err => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  }

  public static unlockProcess(): Promise<void> {
    return new Promise(resolve => {
      lockFile.unlock(this.getLockFilePath("process"), () => resolve());
    });
  }
}
