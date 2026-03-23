import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
    }

    // 1. Verify token
    const [tokens] = await query(
      "SELECT email FROM admin_reset_tokens WHERE token = $1 AND expires_at > NOW() LIMIT 1",
      [token]
    ) as [any[], any];

    if (tokens.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const { email } = tokens[0];

    // 2. Update password
    const passwordHash = await bcrypt.hash(password, 10);
    await query("UPDATE admins SET password_hash = $1 WHERE email = $2", [passwordHash, email]);

    // 3. Delete token
    await query("DELETE FROM admin_reset_tokens WHERE token = $1", [token]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset confirm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
