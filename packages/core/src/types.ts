export type MaybePromise<T> = Promise<T> | T;
export type Thenable<T> = {
  then<O>(callback: (value: T) => MaybeThenable<O>): Thenable<O>;
};
export type MaybeArray<T> = T | T[];
export type MaybeThenable<T> = T | Thenable<T>;

export function isThenable<T>(obj: MaybeThenable<T>): obj is Thenable<T> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "then" in obj &&
    typeof obj.then === "function"
  );
}
