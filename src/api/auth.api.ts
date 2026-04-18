import { apiClient } from "./client";
import type { User } from "../types/api.types";

export async function registerUser(displayName: string): Promise<User> {
  return apiClient.post("api/auth/register", { json: { displayName } }).json<User>();
}

export async function getMe(): Promise<User> {
  return apiClient.get("api/auth/me").json<User>();
}

export async function updateMe(updates: {
  displayName?: string;
  defaultHouseholdId?: string | null;
}): Promise<User> {
  return apiClient.patch("api/auth/me", { json: updates }).json<User>();
}
