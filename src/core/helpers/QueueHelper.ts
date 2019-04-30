/* eslint-disable @typescript-eslint/no-explicit-any */
export default class QueueHelper {
  public static operationWaitPromises: Promise<any>[] = [];

  public static waitOperationWaitPromises = async (): Promise<void> => {
    await Promise.all(QueueHelper.operationWaitPromises);
    QueueHelper.operationWaitPromises = [];
  };

  public static appendOperationWaitPromise = (p: Promise<any>) => {
    QueueHelper.operationWaitPromises.push(p);
  };
}
