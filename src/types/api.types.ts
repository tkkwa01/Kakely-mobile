export type TransactionType = "income" | "expense";

export type User = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  defaultHouseholdId: string | null;
};

export type Household = {
  householdId: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  inviteCode: string;
  createdAt: string;
  updatedAt?: string;
};

export type Member = {
  userId: string;
  displayName: string;
  photoURL: string | null;
  role: "owner" | "member";
  joinedAt: string;
};

export type HouseholdDetail = Household & { members: Member[] };

export type Category = {
  categoryId: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
};

export type Transaction = {
  transactionId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  memo: string | null;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MonthlyReport = {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: CategorySummary[];
};

export type CategorySummary = {
  categoryId: string;
  categoryName: string;
  type: TransactionType;
  color: string;
  total: number;
  percentage: number;
  transactionCount: number;
};

export type TrendMonth = {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
};
