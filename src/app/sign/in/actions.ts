"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signInAction(
  email: string,
  password: string,
): Promise<{ error: string } | void> {
  if (process.env.NODE_ENV === "production") {
    return { error: "mock 인증은 프로덕션 환경에서 사용할 수 없습니다." };
  }

  const validEmail = process.env.MOCK_EMAIL ?? "";
  const validPassword = process.env.MOCK_PASSWORD ?? "";

  if (
    !email ||
    !password ||
    email !== validEmail ||
    password !== validPassword
  ) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  // 이 시점에서 NODE_ENV는 항상 production이 아님(위 가드에서 이미 반환됨)
  const cookieStore = await cookies();
  cookieStore.set("mock-auth", "true", {
    path: "/",
    httpOnly: true,
    maxAge: 86400,
    sameSite: "strict",
    secure: false,
  });

  redirect("/users");
}
