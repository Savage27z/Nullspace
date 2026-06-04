"use client"

import { useState, useEffect, useCallback } from "react"
import type { Vault } from "@/types"

const STORAGE_KEY = "ns-user-vaults"

function readVaults(): Vault[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeVaults(vaults: Vault[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vaults))
  // Notify other hook instances in the same page
  window.dispatchEvent(new Event("ns-vaults-changed"))
}

export function useUserVaults() {
  const [vaults, setVaults] = useState<Vault[]>([])

  // Load from localStorage after mount (avoids SSR/hydration mismatch)
  useEffect(() => {
    setVaults(readVaults())

    const onStorageChange = () => setVaults(readVaults())
    window.addEventListener("ns-vaults-changed", onStorageChange)
    window.addEventListener("storage", onStorageChange)
    return () => {
      window.removeEventListener("ns-vaults-changed", onStorageChange)
      window.removeEventListener("storage", onStorageChange)
    }
  }, [])

  const addVault = useCallback((vault: Vault) => {
    const current = readVaults()
    const updated = [vault, ...current.filter((v) => v.id !== vault.id)]
    writeVaults(updated)
    setVaults(updated)
  }, [])

  const updateVault = useCallback((id: string, patch: Partial<Vault>) => {
    const current = readVaults()
    const updated = current.map((v) => (v.id === id ? { ...v, ...patch } : v))
    writeVaults(updated)
    setVaults(updated)
  }, [])

  const removeVault = useCallback((id: string) => {
    const current = readVaults()
    const updated = current.filter((v) => v.id !== id)
    writeVaults(updated)
    setVaults(updated)
  }, [])

  return { vaults, addVault, updateVault, removeVault }
}
