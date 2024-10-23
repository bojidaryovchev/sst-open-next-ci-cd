import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // Get the pathname of the request (e.g. `/`, `/protected`, `/api/user`)
  const path = req.nextUrl.pathname;

  // Allow access to the auth page
  if (path === "/auth") {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  if (!req.auth) {
    // Redirect unauthenticated users to the auth page
    const newUrl = new URL("/auth", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  // Allow access to all other pages for authenticated users
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
