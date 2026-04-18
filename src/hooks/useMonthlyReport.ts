import { useQuery } from "@tanstack/react-query";
import { getMonthlyReport, getTrend } from "../api/reports.api";

export function useMonthlyReport(
  householdId: string | null,
  year: number,
  month: number
) {
  return useQuery({
    queryKey: ["report", householdId, year, month],
    queryFn: () => getMonthlyReport(householdId!, year, month),
    enabled: !!householdId,
  });
}

export function useTrend(householdId: string | null, months = 6) {
  return useQuery({
    queryKey: ["trend", householdId, months],
    queryFn: () => getTrend(householdId!, months),
    enabled: !!householdId,
  });
}
