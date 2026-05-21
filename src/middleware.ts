import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale, countryLocaleMap, type Locale } from "./i18n/config";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: "always",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin pages — skip i18n entirely
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !(await verifyToken(token))) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Skip internal paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If pathname already has a locale prefix, use next-intl middleware
  const hasLocale = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  if (hasLocale) {
    return intlMiddleware(request);
  }

  // No locale prefix → detect from geo-IP or Accept-Language
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${cookieLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Try Vercel geo-IP
  const country = (request as any).geo?.country as string | undefined;
  if (country && countryLocaleMap[country]) {
    const geoLocale = countryLocaleMap[country];
    const url = request.nextUrl.clone();
    url.pathname = `/${geoLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Fall back to next-intl's default Accept-Language detection
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|api|static|.*\\..*).*)"],
};
