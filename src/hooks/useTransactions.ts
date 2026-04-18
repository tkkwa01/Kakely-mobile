import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactions.api";

export function useTransactions(
  householdId: string | null,
  year: number,
  month: number
) {
  return useQuery({
    queryKey: ["transactions", householdId, year, month],
    queryFn: () => listTransactions(householdId!, { year, month }),
    enabled: !!householdId,
  });
}

export function useCreateTransaction(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof createTransaction>[1]) =>
      createTransaction(householdId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", householdId] });
      qc.invalidateQueries({ queryKey: ["report", householdId] });
    },
  });
}

export function useUpdateTransaction(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      transactionId,
      updates,
    }: {
      transactionId: string;
      updates: Parameters<typeof updateTransaction>[2];
    }) => updateTransaction(householdId, transactionId, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", householdId] });
      qc.invalidateQueries({ queryKey: ["report", householdId] });
    },
  });
}

export function useDeleteTransaction(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transactionId: string) =>
      deleteTransaction(householdId, transactionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", householdId] });
      qc.invalidateQueries({ queryKey: ["report", householdId] });
    },
  });
}
