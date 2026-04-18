import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "../api/categories.api";

export function useCategories(householdId: string | null) {
  return useQuery({
    queryKey: ["categories", householdId],
    queryFn: () => listCategories(householdId!),
    enabled: !!householdId,
  });
}

export function useCreateCategory(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof createCategory>[1]) =>
      createCategory(householdId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", householdId] }),
  });
}

export function useUpdateCategory(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      updates,
    }: {
      categoryId: string;
      updates: Parameters<typeof updateCategory>[2];
    }) => updateCategory(householdId, categoryId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", householdId] }),
  });
}

export function useDeleteCategory(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(householdId, categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", householdId] }),
  });
}

export function useReorderCategories(householdId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orders: { categoryId: string; sortOrder: number }[]) =>
      reorderCategories(householdId, orders),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", householdId] }),
  });
}
