export declare const promiser: (func: Function) => (() => Promise<unknown>);
export declare const promiserNoRejection: (func: Function) => (() => Promise<unknown>);
export declare const timeoutPromiser: (millis: number) => Promise<void>;
