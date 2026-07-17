import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ShopContextValue = {
  cart: number[]
  favorites: number[]
  toggleCart: (id: number) => void
  toggleFavorite: (id: number) => void
  clearCart: () => void
}

const ShopContext = createContext<ShopContextValue | null>(null)
const readIds = (key: string) => {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as number[] } catch { return [] }
}

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<number[]>(() => readIds('stilte-draad-cart'))
  const [favorites, setFavorites] = useState<number[]>(() => readIds('stilte-draad-favorites'))
  useEffect(() => localStorage.setItem('stilte-draad-cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('stilte-draad-favorites', JSON.stringify(favorites)), [favorites])
  const toggle = (setter: React.Dispatch<React.SetStateAction<number[]>>, id: number) => setter((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  return <ShopContext.Provider value={{ cart, favorites, toggleCart: (id) => toggle(setCart, id), toggleFavorite: (id) => toggle(setFavorites, id), clearCart: () => setCart([]) }}>{children}</ShopContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useShop = () => {
  const value = useContext(ShopContext)
  if (!value) throw new Error('useShop moet binnen ShopProvider worden gebruikt')
  return value
}
