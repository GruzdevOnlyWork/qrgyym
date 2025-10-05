import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET_CODE || "";
const JWT_SECRET = SECRET; 

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (code !== SECRET) {
      return NextResponse.json({ error: "Неверный код" }, { status: 401 });
    }

    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });

    const response = NextResponse.json({ message: "Авторизация успешна" });

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8, // 8 часов
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (_e) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
