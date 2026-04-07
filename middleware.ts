import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users to login
  if (!token && (pathname.startsWith("/teacher") || pathname.startsWith("/student"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login
  if (token && pathname === "/login") {
    const redirectTo = token.role === "teacher" ? "/teacher" : "/student";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Prevent students from accessing teacher pages and vice versa
  if (token?.role === "student" && pathname.startsWith("/teacher")) {
    return NextResponse.redirect(new URL("/student", request.url));
  }
  if (token?.role === "teacher" && pathname.startsWith("/student")) {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/login"],
};
