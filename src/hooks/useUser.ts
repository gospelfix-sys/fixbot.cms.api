"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@/types/auth";
import {
  AUTH_QUERY_KEY,
  fetchAuthMe,
  type AuthMeResponse,
} from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchAuthMe,
  });

  const profile = data?.profile ?? null;

  const setProfile = (
    updater:
      UserProfile | null | ((prev: UserProfile | null) => UserProfile | null),
  ) => {
    queryClient.setQueryData<AuthMeResponse>(AUTH_QUERY_KEY, (prev) => {
      const prevProfile = prev?.profile ?? null;
      const nextProfile =
        typeof updater === "function" ? updater(prevProfile) : updater;
      return { user: prev?.user ?? null, profile: nextProfile };
    });
  };

  return { profile, setProfile };
}
