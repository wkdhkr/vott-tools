import sleep from "await-sleep";
import { default as Subject } from "./LockHelper";

describe(Subject.name, () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const loadSubject = async () => (await import("./LockHelper")).default;

  it("lockKey, unlockKey", async () => {
    const subject = await loadSubject();
    await subject.lockKey("hoge");
    subject.lockKey("hoge");
    await subject.unlockKey("hoge");
    await sleep(1500);
    let keyLockMap = subject.getKeyLockMap();
    expect(keyLockMap.hoge).toBeTruthy();
    await subject.unlockKey("hoge");
    keyLockMap = subject.getKeyLockMap();
    expect(keyLockMap.hoge).toBeUndefined();
  });

  it("lockProcess, unlockProcess", async () => {
    const subject = await loadSubject();
    await subject.lockProcess();
    subject.unlockProcess();
    await sleep(1500);
    await subject.unlockProcess();
    await subject.unlockProcess();
  });
});
