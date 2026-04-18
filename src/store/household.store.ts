import { create } from "zustand";
import type { Household } from "../types/api.types";

type HouseholdState = {
  activeHouseholdId: string | null;
  household: Household | null;
  setActiveHouseholdId: (id: string | null) => void;
  setHousehold: (h: Household | null) => void;
};

export const useHouseholdStore = create<HouseholdState>((set) => ({
  activeHouseholdId: null,
  household: null,
  setActiveHouseholdId: (activeHouseholdId) => set({ activeHouseholdId }),
  setHousehold: (household) => set({ household }),
}));
