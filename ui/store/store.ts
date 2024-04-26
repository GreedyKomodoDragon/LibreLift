import { create } from "zustand";

interface State {
  error: string;
  updateError: (newError: string) => void;
}

export const useStore = create<State>((set) => ({
  error: "",
  position: "bottom-middle",
  updateError: (newError: string) => set({ error: newError }),
}));

interface AccountState {
  isLoggedIn: boolean;
  hasActivePaymentAccount: boolean;
  updateLogged: (newLog: boolean) => void;
  updateActivePayment: (active: boolean) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  isLoggedIn: false,
  hasActivePaymentAccount: false,
  updateLogged: (newLog: boolean) => set({ isLoggedIn: newLog }),
  updateActivePayment: (active: boolean) => set({ hasActivePaymentAccount: active }),
}));
