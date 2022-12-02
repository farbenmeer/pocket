import { RequestCookies } from "./cookies";

export class PocketRequest extends Request {
  constructor(req: Request, public cookies: RequestCookies) {
    super(req);
  }
}
