import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      agencyLogoUrl: null,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false, agencyLogoUrl: null }),

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      setAgencyLogoUrl: (url) => set({ agencyLogoUrl: url }),
    }),
    {
      name: 'freelotcare-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        agencyLogoUrl: state.agencyLogoUrl,
      }),
    }
  )
)

export default useAuthStore
