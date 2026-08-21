import { create } from 'zustand';

interface NotificationsState {
  pendingCount: number;
  setPendingCount: (count: number) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  pendingCount: 0,
  setPendingCount: (count) => set({ pendingCount: count }),
}));