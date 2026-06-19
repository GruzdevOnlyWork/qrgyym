import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET_CODE || "";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    jwt.verify(token, SECRET);
    return NextResponse.json({ authenticated: true });
  } catch (_err) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
