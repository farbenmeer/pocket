import { RequestCookies } from "./cookies.js";

export class PocketRequest extends Request {
  constructor(req: Request, public cookies: RequestCookies) {
    super(req);
  }
}
