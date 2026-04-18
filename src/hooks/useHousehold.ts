import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHousehold,
  listHouseholds,
  createHousehold,
  updateHousehold,
  joinHousehold,
  leaveHousehold,
  refreshInviteCode,
  removeMember,
} from "../api/households.api";
import { useHouseholdStore } from "../store/household.store";

export function useHousehold(householdId: string | null) {
  return useQuery({
    queryKey: ["household", householdId],
    queryFn: () => getHousehold(householdId!),
    enabled: !!householdId,
  });
}

export function useHouseholds() {
  return useQuery({
    queryKey: ["households"],
    queryFn: listHouseholds,
  });
}

export function useCreateHousehold() {
  const qc = useQueryClient();
  const setActiveHouseholdId = useHouseholdStore((s) => s.setActiveHouseholdId);
  return useMutation({
    mutationFn: (name: string) => createHousehold(name),
    onSuccess: (household) => {
      qc.invalidateQueries({ queryKey: ["households"] });
      setActiveHouseholdId(household.householdId);
    },
  });
}

export function useUpdateHousehold(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => updateHousehold(householdId, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household", householdId] }),
  });
}

export function useJoinHousehold() {
  const qc = useQueryClient();
  const setActiveHouseholdId = useHouseholdStore((s) => s.setActiveHouseholdId);
  return useMutation({
    mutationFn: ({ householdId, inviteCode }: { householdId: string; inviteCode: string }) =>
      joinHousehold(householdId, inviteCode),
    onSuccess: (_data, { householdId }) => {
      qc.invalidateQueries({ queryKey: ["households"] });
      setActiveHouseholdId(householdId);
    },
  });
}

export function useLeaveHousehold(householdId: string) {
  const qc = useQueryClient();
  const setActiveHouseholdId = useHouseholdStore((s) => s.setActiveHouseholdId);
  return useMutation({
    mutationFn: () => leaveHousehold(householdId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["households"] });
      setActiveHouseholdId(null);
    },
  });
}

export function useRefreshInviteCode(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => refreshInviteCode(householdId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household", householdId] }),
  });
}

export function useRemoveMember(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(householdId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household", householdId] }),
  });
}
