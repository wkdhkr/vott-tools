import path from "path";
import requireUncached from "require-uncached";
import fs from "fs-extra";
import { UserConfig } from "../../types";

export default class EnvironmentHelper {
  public static getHomeDir(): string {
    return process.env.USERPROFILE || ".";
  }

  public static isTest(): boolean {
    return process.env.NODE_ENV === "test";
  }

  public static getAppName(): string {
    return process.env.npm_package_name || "vott-tools";
  }

  private static detectUserConfigPath(): string {
    const fileName = ["", this.getAppName(), "config", "js"].join(".");
    return path.join(this.getHomeDir(), fileName);
  }

  public static loadUserConfig(force: boolean = false): UserConfig {
    let userConfig: UserConfig = {};
    if (this.isTest() && force === false) {
      return userConfig;
    }

    const userConfigPath = this.detectUserConfigPath();
    if (fs.pathExistsSync(userConfigPath)) {
      userConfig = requireUncached(userConfigPath);
    }
    return userConfig;
  }
}
