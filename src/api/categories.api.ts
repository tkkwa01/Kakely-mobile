import { apiClient } from "./client";
import type { Category } from "../types/api.types";

export async function listCategories(
  householdId: string,
  type?: "income" | "expense"
): Promise<Category[]> {
  const searchParams = type ? { type } : undefined;
  const res = await apiClient
    .get(`api/households/${householdId}/categories`, { searchParams })
    .json<{ categories: Category[] }>();
  return res.categories;
}

export async function createCategory(
  householdId: string,
  input: {
    name: string;
    type: "income" | "expense";
    icon: string;
    color: string;
    sortOrder: number;
  }
): Promise<Category> {
  return apiClient
    .post(`api/households/${householdId}/categories`, { json: input })
    .json<Category>();
}

export async function updateCategory(
  householdId: string,
  categoryId: string,
  updates: Partial<{
    name: string;
    type: "income" | "expense";
    icon: string;
    color: string;
    sortOrder: number;
  }>
): Promise<Category> {
  return apiClient
    .patch(`api/households/${householdId}/categories/${categoryId}`, { json: updates })
    .json<Category>();
}

export async function deleteCategory(
  householdId: string,
  categoryId: string
): Promise<void> {
  await apiClient.delete(`api/households/${householdId}/categories/${categoryId}`);
}

export async function reorderCategories(
  householdId: string,
  orders: { categoryId: string; sortOrder: number }[]
): Promise<void> {
  await apiClient.patch(`api/households/${householdId}/categories/reorder`, {
    json: { orders },
  });
}
