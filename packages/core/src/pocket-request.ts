import { CookieStore } from "./cookie-store";

export class PocketRequest extends Request {
  constructor(req: Request, public cookies: CookieStore) {
    super(req);
  }
}
