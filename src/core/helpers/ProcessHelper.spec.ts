import { default as Subject } from "./ProcessHelper";

describe(Subject.name, () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const loadSubject = async () => (await import("./ProcessHelper")).default;

  it("setStdInHook", async () => {
    const event = "dummy";
    const cb = jest.fn();

    const subject = await loadSubject();

    if (!process.stdin.setRawMode) {
      process.stdin.setRawMode = () => {};
    }

    const spySetRawMode = jest.spyOn(process.stdin, "setRawMode");
    const spyResume = jest.spyOn(process.stdin, "resume");
    const spyOn = jest.spyOn(process.stdin, "on");

    spySetRawMode.mockImplementation(() => {});
    spyOn.mockImplementation((_e, f: any) => f());
    subject.setStdInHook(event, cb);

    // expect(spySetRawMode).toBeCalledWith(true);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(spyResume).toHaveBeenCalledTimes(1);
  });

  it("exit", async () => {
    const subject = await loadSubject();
    const spyExit = jest.spyOn(process, "exit");
    spyExit.mockImplementation((() => {}) as any);
    subject.exit(3);
    expect(spyExit).toBeCalledWith(3);
  });
});
