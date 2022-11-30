export type ClientPostMessage =
  | {
      type: "set-cookie";
      cookie: string;
    }
  | {
      type: "get-cookies";
      requestId: number;
    };

export type WorkerPostMessage =
  | {
      type: "return-cookies";
      requestId: number;
      cookie: string;
    }
  | {
      type: "send-cookies";
      cookie: string;
      path: string;
    };
