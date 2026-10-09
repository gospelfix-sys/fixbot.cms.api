import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/auth";

export const dynamic = "force-dynamic";

const mockEmail = process.env.MOCK_EMAIL ?? "admin@gospelfix.com";

const MOCK_USER = {
  id: "mock-user-id",
  email: mockEmail,
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2026-01-01T00:00:00.000Z",
} as User;

const MOCK_PROFILE: UserProfile = {
  id: "mock-user-id",
  email: mockEmail,
  full_name: "Admin",
  avatar_url: null,
  role: "admin",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

export async function GET() {
  const cookieStore = cookies();
  const isMock =
    process.env.NODE_ENV !== "production" && cookieStore.get("mock-auth")?.value === "true";

  if (isMock) {
    return NextResponse.json({ user: MOCK_USER, profile: MOCK_PROFILE });
  }

  return NextResponse.json({ user: null, profile: null }, { status: 401 });
}
