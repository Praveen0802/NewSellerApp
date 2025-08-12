import { getMiddlewareCookieValue } from "@/utils/helperFunctions/cookie";
import { NextResponse } from "next/server";
import {
  checkAuthTokenValidationMiddleWare,
  currentTimeEpochTimeInMilliseconds,
} from "./utils/helperFunctions";
import {
  nonAuthRequiredAPI,
  nonAuthRequiredPages,
} from "./utils/constants/contants";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const authToken = decodeURIComponent(
    getMiddlewareCookieValue(request.headers.get("cookie"), "auth_token")
  );
  const authTokenValidity = getMiddlewareCookieValue(
    request.headers.get("cookie"),
    "auth_token_validity"
  );
  const validateAuthToken = await checkAuthTokenValidationMiddleWare(
    authToken,
    authTokenValidity
  );
  if (validateAuthToken?.error) {
    const response = NextResponse.redirect(new URL(`/login`, request.url));
    response.cookies.set("auth_token", "");
    response.cookies.set("auth_token_validity", "");
    return response;
  }
  
  if (
    nonAuthRequiredPages.some((path) => pathname.includes(path)) &&
    !validateAuthToken
  ) {
    return;
  }

  if (pathname.includes("/api")) {
    try {
      if (!validateAuthToken) {
        if (nonAuthRequiredAPI.some((path) => pathname.includes(path))) {
          return;
        } else {
          return NextResponse.redirect(new URL(`/login`, request.url));
        }
      }
      if (validateAuthToken) {
        if (validateAuthToken?.token) {
          const response = NextResponse.next();
          response.cookies.set(
            "auth_token",
            decodeURIComponent(validateAuthToken?.token),
            {
              httpOnly: true,
              sameSite: "strict",
            }
          );
          response.cookies.set(
            "auth_token_validity",
            currentTimeEpochTimeInMilliseconds().toString()
          );
          return response;
        } else {
          return;
        }
      }
    } catch (error) {
      console.error("Token validation error:", error);
      return NextResponse.redirect(new URL(`/login`, request.url));
    }
  }

  if (!authToken || !authTokenValidity) {
    if (pathname.startsWith("/login")) {
      return;
    } else {
      return NextResponse.redirect(new URL(`/login`, request.url));
    }
  } else if (!validateAuthToken) {
    const response = NextResponse.redirect(new URL(`/login`, request.url));
    response.cookies.set("auth_token", "");
    response.cookies.set("auth_token_validity", "");
    response.cookies.set("user_token", "");
    return response;
  } else if (validateAuthToken) {
    if (validateAuthToken?.token) {
      const response = NextResponse.next();
      response.cookies.set(
        "auth_token",
        decodeURIComponent(validateAuthToken?.token),
        {
          httpOnly: true,
          // secure: process.env.NODE_ENV === 'production',
          sameSite: "strict",
          // maxAge: 3600 // Optional: set expiration
        }
      );
      response.cookies.set(
        "auth_token_validity",
        currentTimeEpochTimeInMilliseconds().toString()
      );
      return response;
    } else {
      return;
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - serviceworker.js (service worker file)
     * - manifest.json (web app manifest file)
     */
    "/((?!_next/static|_next/image|favicon.ico|serviceworker.js|manifest.json).*)",
  ],
};
