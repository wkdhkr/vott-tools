import { default as Subject } from "./LoggerHelper";
import TestHelper from "./TestHelper";

describe(Subject.name, () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const loadSubject = async () => (await import("./LoggerHelper")).default;

  it("configure, flush, getLogger", async () => {
    jest.doMock("./EnvironmentHelper", () => ({
      isTest: () => false
    }));
    jest.doMock("log4js", () => ({
      configure: () => {},
      shutdown: (cb: () => void) => cb(),
      getLogger: () => ({})
    }));
    const subject = await loadSubject();

    expect(
      subject.configure(TestHelper.createDummyConfig().log4jsConfig)
    ).toBeUndefined();
    expect(subject.getLogger(Subject)).toEqual({});
    expect(await subject.flush()).toBeUndefined();
  });
});
