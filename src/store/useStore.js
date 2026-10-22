import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set) => ({
      favorites: [],
      cart: [],

      toggleFavorite: (product) =>
        set((state) => ({
          favorites: state.favorites.some((p) => p.id === product.id)
            ? state.favorites.filter((p) => p.id !== product.id)
            : [...state.favorites, product],
        })),

      addToCart: (product) =>
        set((state) => {
          const found = state.cart.find((p) => p.id === product.id);

          return {
            cart: found
              ? state.cart.map((p) =>
                  p.id === product.id
                    ? { ...p, quantity: p.quantity + 1 }
                    : p
                )
              : [...state.cart, { ...product, quantity: 1 }],
          };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((p) => p.id !== id),
        })),

      changeQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart
            .map((p) => (p.id === id ? { ...p, quantity } : p))
            .filter((p) => p.quantity > 0),
        })),

      clearCart: () => set({ cart: [] }),
    }),
    { name: "marketplace" }
  )
);