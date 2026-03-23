import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // 1. Check if admin exists
    const [admins] = await query("SELECT id, name FROM admins WHERE email = $1", [email]) as [any[], any];
    if (admins.length === 0) {
      // Security: Don't reveal if email exists, just say "If account exists..."
      return NextResponse.json({ success: true });
    }

    const admin = admins[0];

    // 2. Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // 3. Save token
    await query(
      "INSERT INTO admin_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)",
      [email, token, expiresAt]
    );

    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    let emailSent = false;

    // 4. Send Email
    if (resend) {
      try {
        await resend.emails.send({
          from: "Staker Choice Ads <admin@stakerschoiceads>",
          to: email,
          subject: "Reset Your Staker Choice Ads Password",
          html: `
            <div style="font-family: sans-serif; padding: 40px; background: #020617; color: #f8fafc; border-radius: 24px; max-width: 600px; margin: auto;">
              <h1 style="color: #3b82f6; font-size: 24px; font-weight: 900; letter-spacing: -1px;">ADTRACK SECURITY</h1>
              <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Hello ${admin.name},</p>
              <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">We received a request to reset your administrative access. Click the button below to set a new password. This link expires in 60 minutes.</p>
              <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 24px 0;">Reset Password</a>
              <p style="font-size: 12px; color: #475569;">If you didn't request this, you can safely ignore this email.</p>
              <hr style="border: 1px solid #1e293b; margin: 32px 0;" />
              <p style="font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 2px;">&copy; 2026 AdTrack Enterprise</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (err) {
        console.error("Resend error:", err);
      }
    } else {
      console.warn("Resend API key missing. Reset link:", resetLink);
    }

    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    return NextResponse.json({ 
      success: true,
      ...(isDev && !emailSent ? { debugLink: resetLink } : {})
    });
  } catch (error) {
    console.error("Reset request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
