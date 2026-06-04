"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { VAULTS, CATEGORIES, SORTS } from "@/lib/mock-data"
import { useUserVaults } from "@/lib/vault-store"
import { fmt } from "@/lib/utils"
import VaultArt from "@/components/shared/VaultArt"
import { ChevronIcon, CheckIcon } from "@/components/shared/Icons"
import type { Vault } from "@/types"

function VaultCard({ v, featured }: { v: Vault; featured: boolean }) {
  return (
    <Link
      href={`/vault/${v.id}`}
      className={"vc" + (featured ? " vc--feat" : "")}
    >
      <VaultArt seed={v.id} className="vc__art">
        <div className="vc__art-veil"></div>
        <span className="vc__cat">
          <span className="pill">{v.category}</span>
        </span>
        {v.liveQueried && (
          <span className="vc__live">
            <span className="pulse"></span>
          </span>
        )}
        <div className="vc__overlay">
          <h3 className="vc__name serif">{v.name}</h3>
          <div className="vc__meta mono">
            <span className="vc__price">
              {fmt(v.price)} <span className="vc__unit">IP</span>
            </span>
            <span className="vc__sep">&middot;</span>
            <span>{fmt(v.queries)} queries</span>
          </div>
        </div>
      </VaultArt>
    </Link>
  )
}

function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="dd">
      <button
        className="dd__btn"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      >
        <span className="t3" style={{ fontSize: 12 }}>
          Sort
        </span>
        <span>{value}</span>
        <ChevronIcon size={13} />
      </button>
      {open && (
        <div className="dd__menu">
          {options.map((o) => (
            <button
              key={o}
              className={"dd__opt" + (o === value ? " dd__opt--active" : "")}
              onMouseDown={() => {
                onChange(o)
                setOpen(false)
              }}
            >
              {o}
              {o === value && <CheckIcon size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MarketplacePage() {
  const [cat, setCat] = useState("All")
  const [sort, setSort] = useState("Newest")
  const { vaults: userVaults } = useUserVaults()

  const allVaults = useMemo(() => [...userVaults, ...VAULTS], [userVaults])
  const totalVaults = allVaults.length
  const queriesToday = 1426
  const totalVolume = allVaults.reduce((s, v) => s + v.earnings, 0)

  const filtered = useMemo(() => {
    let list = allVaults.filter((v) => cat === "All" || v.category === cat)
    if (sort === "Price") list = [...list].sort((a, b) => b.price - a.price)
    else if (sort === "Most Queried")
      list = [...list].sort((a, b) => b.queries - a.queries)
    return list
  }, [cat, sort, allVaults])

  return (
    <div className="fade-in">
      <div className="page-head">
        <h1>Marketplace</h1>
        <p>
          Browse and query confidential datasets. Data stays encrypted — you
          only see results.
        </p>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat__label">Total Vaults</div>
          <div className="stat__num">{totalVaults}</div>
          <div className="stat__delta stat__delta--up">&uarr; +2 this week</div>
        </div>
        <div className="stat">
          <div className="stat__label">Queries Today</div>
          <div className="stat__num">{fmt(queriesToday)}</div>
          <div className="stat__delta stat__delta--up">&uarr; +218</div>
        </div>
        <div className="stat">
          <div className="stat__label">Total Volume</div>
          <div className="stat__num">
            {fmt(totalVolume)}
            <span className="unit">IP</span>
          </div>
          <div className="stat__sub">across {totalVaults} vaults</div>
        </div>
      </div>

      <div className="filter-row">
        <div className="cat-tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={"cat-tab" + (c === cat ? " cat-tab--active" : "")}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <Dropdown value={sort} options={SORTS} onChange={setSort} />
      </div>

      <div className="vault-gallery">
        {filtered.map((v, i) => (
          <VaultCard key={v.id} v={v} featured={i === 0} />
        ))}
      </div>
    </div>
  )
}
