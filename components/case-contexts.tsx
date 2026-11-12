"use client"

import { createContext, useContext } from "react"

export const TabContext = createContext<{
  activeTab: string
  setActiveTab: (tab: string) => void
}>({ activeTab: "clinical-summary", setActiveTab: () => {} })

export const CareLensContext = createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({ isOpen: false, setIsOpen: () => {} })

export const useTabContext = () => useContext(TabContext)
export const useCareLensContext = () => useContext(CareLensContext)
