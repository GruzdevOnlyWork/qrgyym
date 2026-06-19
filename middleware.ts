import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET_CODE || "";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  let isAuth = false;

  if (token) {
    try {
      jwt.verify(token, SECRET);
      isAuth = true;
    } catch {
      isAuth = false;
    }
  }

  const response = NextResponse.next();

  response.headers.set("x-admin-auth", isAuth ? "true" : "false");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
