import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncAddr(a: string) {
  return a.slice(0, 6) + "…" + a.slice(-4)
}

export function fmt(n: number) {
  return n.toLocaleString("en-US")
}
