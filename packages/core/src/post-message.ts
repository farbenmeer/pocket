import { CookieOptions } from "./cookie-store";

export type ClientPostMessage =
  | {
      type: "set-cookie";
      cookie: string;
    }
  | {
      type: "get-cookies";
    };

export type WorkerPostMessage = {
  type: "return-cookies";
  cookie: string;
};
