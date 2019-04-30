import { default as Subject } from "./EnvironmentHelper";

describe(Subject.name, () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const loadSubject = async () => (await import("./EnvironmentHelper")).default;

  it("get home directory", () => {
    Object.defineProperty(process, "platform", {
      value: "win32"
    });
    expect(Subject.getHomeDir()).toBe(process.env.USERPROFILE);

    Object.defineProperty(process, "platform", {
      value: "unix"
    });
    Object.defineProperty(process.env, "HOME", {
      value: process.env.USERPROFILE
    });
    expect(Subject.getHomeDir()).toBe(process.env.USERPROFILE);
  });

  it("loadUserConfig test", async () => {
    expect((await loadSubject()).loadUserConfig()).toEqual({});
  });

  it("loadUserConfig", async () => {
    const fs = {
      pathExistsSync: () => true
    };
    jest.doMock("fs-extra", () => fs);
    jest.doMock("require-uncached", () =>
      jest.fn().mockImplementation(() => ({
        dbBasePath: "./test"
      }))
    );
    expect((await loadSubject()).loadUserConfig(true)).toEqual({
      dbBasePath: "./test"
    });
  });
});
