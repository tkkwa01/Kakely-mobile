import { apiClient } from "./client";
import type { MonthlyReport, TrendMonth } from "../types/api.types";

export async function getMonthlyReport(
  householdId: string,
  year: number,
  month: number
): Promise<MonthlyReport> {
  return apiClient
    .get(`api/households/${householdId}/reports/monthly`, {
      searchParams: { year, month },
    })
    .json<MonthlyReport>();
}

export async function getTrend(
  householdId: string,
  months = 6
): Promise<{ months: TrendMonth[] }> {
  return apiClient
    .get(`api/households/${householdId}/reports/trend`, {
      searchParams: { months },
    })
    .json<{ months: TrendMonth[] }>();
}
