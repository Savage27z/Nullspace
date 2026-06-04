"use client"

import { useMemo, CSSProperties, ReactNode } from "react"
import { vaultArtURI } from "@/lib/genart"

export default function VaultArt({
  seed,
  className,
  style,
  children,
}: {
  seed: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const uri = useMemo(() => vaultArtURI(seed), [seed])
  return (
    <div
      className={"vart " + (className || "")}
      style={{ backgroundImage: `url("${uri}")`, ...style }}
    >
      <div className="vart__scan"></div>
      {children}
    </div>
  )
}
