import { default as Subject } from "./QueueHelper";

describe(Subject.name, () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const loadSubject = async () => (await import("./QueueHelper")).default;

  it("append and wait", async () => {
    const subject = await loadSubject();
    subject.appendOperationWaitPromise(new Promise(x => x()));
    subject.appendOperationWaitPromise(new Promise(x => x()));
    expect(subject.operationWaitPromises.length).toBeGreaterThan(0);
    await subject.waitOperationWaitPromises();
    expect(subject.operationWaitPromises.length).toBe(0);
  });
});
