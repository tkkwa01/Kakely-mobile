import { apiClient } from "./client";
import type { Transaction } from "../types/api.types";

export async function listTransactions(
  householdId: string,
  params: {
    year: number;
    month: number;
    type?: "income" | "expense";
    categoryId?: string;
    limit?: number;
    startAfter?: string;
  }
): Promise<{ transactions: Transaction[]; nextCursor: string | null }> {
  const searchParams: Record<string, string | number> = {
    year: params.year,
    month: params.month,
  };
  if (params.type) searchParams["type"] = params.type;
  if (params.categoryId) searchParams["categoryId"] = params.categoryId;
  if (params.limit) searchParams["limit"] = params.limit;
  if (params.startAfter) searchParams["startAfter"] = params.startAfter;

  return apiClient
    .get(`api/households/${householdId}/transactions`, { searchParams })
    .json<{ transactions: Transaction[]; nextCursor: string | null }>();
}

export async function createTransaction(
  householdId: string,
  input: {
    type: "income" | "expense";
    amount: number;
    categoryId: string;
    memo?: string | null;
    date: string;
  }
): Promise<Transaction> {
  return apiClient
    .post(`api/households/${householdId}/transactions`, { json: input })
    .json<Transaction>();
}

export async function getTransaction(
  householdId: string,
  transactionId: string
): Promise<Transaction> {
  return apiClient
    .get(`api/households/${householdId}/transactions/${transactionId}`)
    .json<Transaction>();
}

export async function updateTransaction(
  householdId: string,
  transactionId: string,
  updates: Partial<{
    type: "income" | "expense";
    amount: number;
    categoryId: string;
    memo: string | null;
    date: string;
  }>
): Promise<Transaction> {
  return apiClient
    .patch(`api/households/${householdId}/transactions/${transactionId}`, {
      json: updates,
    })
    .json<Transaction>();
}

export async function deleteTransaction(
  householdId: string,
  transactionId: string
): Promise<void> {
  await apiClient.delete(
    `api/households/${householdId}/transactions/${transactionId}`
  );
}
