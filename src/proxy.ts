import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Locale routing for public pages only: skip admin, API, uploaded media, Next internals and files.
  matcher: ["/((?!admin|api|media|_next|_vercel|.*\\..*).*)"],
};
