import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { Resend } from "resend";
import { query } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Query admin from database
    const [admins] = await query(
      "SELECT email, password_hash, name FROM admins WHERE email = $1 LIMIT 1",
      [email]
    ) as [any[], any];

    const admin = admins[0];

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 2. Verify password hash
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3. Create session with name
    await createSession(email, admin.name || "Admin User");

    // 4. Send Notification (Optional)
    if (resend) {
      try {
        await resend.emails.send({
          from: "Staker Choice Ads <admin@stakerschoiceads>",
          to: admin.email,
          subject: "New Admin Login Detected",
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #020617; color: #f8fafc; border-radius: 12px;">
              <h2 style="color: #3b82f6;">Login Alert</h2>
              <p>Someone just logged into your AdTrack admin dashboard.</p>
              <p style="font-size: 12px; color: #64748b;">If this wasn't you, please change your password immediately.</p>
              <hr style="border: 1px solid #1e293b;" />
              <p style="font-size: 10px; color: #475569;">&copy; 2026 AdTrack Enterprise</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Failed to send login notification:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Critical Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error (Database or API Failure)" },
      { status: 500 }
    );
  }
}
