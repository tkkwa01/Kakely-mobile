import { apiClient } from "./client";
import type { Household, HouseholdDetail } from "../types/api.types";

export async function createHousehold(name: string): Promise<Household> {
  return apiClient.post("api/households", { json: { name } }).json<Household>();
}

export async function listHouseholds(): Promise<Household[]> {
  const res = await apiClient.get("api/households").json<{ households: Household[] }>();
  return res.households;
}

export async function getHousehold(id: string): Promise<HouseholdDetail> {
  return apiClient.get(`api/households/${id}`).json<HouseholdDetail>();
}

export async function updateHousehold(id: string, name: string): Promise<HouseholdDetail> {
  return apiClient.patch(`api/households/${id}`, { json: { name } }).json<HouseholdDetail>();
}

export async function joinHousehold(householdId: string, inviteCode: string): Promise<void> {
  await apiClient.post(`api/households/${householdId}/join`, { json: { inviteCode } });
}

export async function leaveHousehold(householdId: string): Promise<void> {
  await apiClient.post(`api/households/${householdId}/leave`);
}

export async function removeMember(householdId: string, memberId: string): Promise<void> {
  await apiClient.delete(`api/households/${householdId}/members/${memberId}`);
}

export async function refreshInviteCode(householdId: string): Promise<string> {
  const res = await apiClient
    .post(`api/households/${householdId}/invite/refresh`)
    .json<{ inviteCode: string }>();
  return res.inviteCode;
}
