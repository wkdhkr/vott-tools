/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
// eslint-disable-next-line @typescript-eslint/class-name-casing
declare class index {
  addListener(ev: any, fn: any): any;

  cork(): void;

  destroy(err: any, cb: any): any;

  digest(encoding: any): any;

  emit(type: any, args: any): any;

  end(chunk: any, encoding: any, cb: any): any;

  eventNames(): any;

  getMaxListeners(): any;

  isPaused(): any;

  listenerCount(type: any): any;

  listeners(type: any): any;

  off(type: any, listener: any): any;

  on(ev: any, fn: any): any;

  once(type: any, listener: any): any;

  pause(): any;

  pipe(dest: any, pipeOpts: any): any;

  prependListener(type: any, listener: any): any;

  prependOnceListener(type: any, listener: any): any;

  push(chunk: any, encoding: any): any;

  rawListeners(type: any): any;

  read(n: any): any;

  removeAllListeners(ev: any): any;

  removeListener(ev: any, fn: any): any;

  resume(): any;

  setDefaultEncoding(encoding: any): any;

  setEncoding(enc: any): any;

  setMaxListeners(n: any): any;

  uncork(): void;

  unpipe(dest: any): any;

  unshift(chunk: any): any;

  update(data: any, encoding?: any): any;

  wrap(stream: any): any;

  write(chunk: any, encoding: any, cb: any): any;
}

export = index;
