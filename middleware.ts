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
      //Invalid token
      isAuth = false;
    }
  }

  // Добавляем в заголовок ответа признак авторизации, чтобы фронтенд мог прочитать
  const response = NextResponse.next();

  response.headers.set("x-admin-auth", isAuth ? "true" : "false");

  return response;
}

// Middleware не перенаправляет, но устанавливает header для всех путей
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
