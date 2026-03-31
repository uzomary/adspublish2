import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET() {
  try {
    const [admins] = await query("SELECT id FROM admins LIMIT 1") as [any[], any];
    return NextResponse.json({ setupRequired: admins.length === 0 });
  } catch (error) {
    console.error("Critical Setup Audit Error:", error);
    return NextResponse.json({ error: "Database connectivity error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Double check that no admin exists
    const [existing] = await query("SELECT id FROM admins LIMIT 1") as [any[], any];
    if (existing.length > 0) {
      return NextResponse.json({ error: "Setup already completed" }, { status: 403 });
    }

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Hash password and save
    const adminId = 'admin-' + Math.random().toString(36).substr(2, 9);
    const passwordHash = await bcrypt.hash(password, 10);

    await query(
      "INSERT INTO admins (id, email, password_hash, name) VALUES ($1, $2, $3, $4)",
      [adminId, email, passwordHash, name]
    );

    // 3. Create initial session
    await createSession(email, name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
