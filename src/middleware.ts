import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_ONLY_PREFIXES = ["/admin"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const isAdminRoute = ADMIN_ONLY_PREFIXES.some((p) => path.startsWith(p));
    if (isAdminRoute) {
      const role = token?.role as string | undefined;
      if (role !== "SUPER_ADMIN" && role !== "COLLEGE_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/learn/:path*", "/admin/:path*"],
};