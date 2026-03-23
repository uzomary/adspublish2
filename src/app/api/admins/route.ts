import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/admins - List all admins
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [admins] = await query("SELECT id, email, name, created_at FROM admins ORDER BY created_at DESC") as [any[], any];
    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/admins - Create new admin
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { email, password, name } = await request.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminId = 'admin-' + Math.random().toString(36).substr(2, 9);

    await query(
      "INSERT INTO admins (id, email, password_hash, name) VALUES ($1, $2, $3, $4)",
      [adminId, email, passwordHash, name]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as any).code === '23505') {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admins - Update password
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { password } = await request.json();
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);
    await query("UPDATE admins SET password_hash = $1 WHERE email = $2", [passwordHash, session.email]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admins - Delete admin
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');

  if (!id || !email) return NextResponse.json({ error: "Missing info" }, { status: 400 });

  // Prevent self-deletion
  if (email === session.email) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  try {
    await query("DELETE FROM admins WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
