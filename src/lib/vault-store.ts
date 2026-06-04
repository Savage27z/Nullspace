"use client"

import { useState, useEffect, useCallback, useSyncExternalStore } from "react"
import type { Vault } from "@/types"

const STORAGE_KEY = "ns-user-vaults"

let listeners: (() => void)[] = []

function emitChange() {
  listeners.forEach((l) => l())
}

function getSnapshot(): Vault[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function getServerSnapshot(): Vault[] {
  return []
}

function subscribe(listener: () => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function useUserVaults() {
  const vaults = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addVault = useCallback((vault: Vault) => {
    const current = getSnapshot()
    const updated = [vault, ...current.filter((v) => v.id !== vault.id)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    emitChange()
  }, [])

  const removeVault = useCallback((id: string) => {
    const current = getSnapshot()
    const updated = current.filter((v) => v.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    emitChange()
  }, [])

  return { vaults, addVault, removeVault }
}
