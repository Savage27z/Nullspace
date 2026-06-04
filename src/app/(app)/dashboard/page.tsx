"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MY_VAULTS } from "@/lib/mock-data"
import { useUserVaults } from "@/lib/vault-store"
import { fmt } from "@/lib/utils"
import VaultArt from "@/components/shared/VaultArt"
import { PlusIcon, PauseIcon, RenewIcon } from "@/components/shared/Icons"
import type { Vault, VaultStatus } from "@/types"

function StatusBadge({ status }: { status: VaultStatus }) {
  const map: Record<VaultStatus, string> = {
    active: "pill--teal",
    expired: "pill--red",
    paused: "pill--gray",
  }
  return <span className={"pill " + map[status]}>{status}</span>
}

export default function DashboardPage() {
  const router = useRouter()
  const { vaults: userVaults, addVault, updateVault } = useUserVaults()

  // Merge user vaults (from store) with mock vaults
  // Mock vaults that aren't in the store yet get shown as-is
  const mockIds = new Set(userVaults.map((v) => v.id))
  const mockVaults = MY_VAULTS.filter((v) => !mockIds.has(v.id))
  const mine = [...userVaults, ...mockVaults]

  const published = mine.length
  const earnings = mine.reduce((s, v) => s + v.earnings, 0)
  const queries = mine.reduce((s, v) => s + v.queries, 0)

  function handlePause(e: React.MouseEvent, v: Vault) {
    e.preventDefault()
    e.stopPropagation()
    const newStatus: VaultStatus = v.status === "paused" ? "active" : "paused"

    // If it's a mock vault not yet in store, copy it in first
    if (!userVaults.find((uv) => uv.id === v.id)) {
      addVault({ ...v, status: newStatus })
    } else {
      updateVault(v.id, { status: newStatus })
    }
  }

  function handleRenew(e: React.MouseEvent, v: Vault) {
    e.preventDefault()
    e.stopPropagation()
    const patch = { status: "active" as VaultStatus, lastQueried: "just now" }

    if (!userVaults.find((uv) => uv.id === v.id)) {
      addVault({ ...v, ...patch })
    } else {
      updateVault(v.id, patch)
    }
  }

  return (
    <div className="fade-in dashboard">
      <div
        className="page-head"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1>My Vaults</h1>
          <p>Datasets you&apos;ve published to the Confidential Data Rails.</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => router.push("/publish")}
        >
          <PlusIcon size={15} /> Publish
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat__label">Published</div>
          <div className="stat__num">{published}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Earnings</div>
          <div className="stat__num teal">
            {fmt(earnings)}
            <span className="unit">IP</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Queries</div>
          <div className="stat__num">{fmt(queries)}</div>
        </div>
      </div>

      <div className="section__head">
        <span className="section__title">Published Vaults</span>
        <span className="section__count">{mine.length} vaults</span>
      </div>

      <div className="dash-cards">
        {mine.map((v) => (
          <Link
            href={`/vault/${v.id}`}
            className="dash-card"
            key={v.id}
          >
            <VaultArt seed={v.id} className="dash-card__art">
              <div className="vc__art-veil"></div>
            </VaultArt>
            <div className="dash-card__body">
              <div className="dash-card__top">
                <h3 className="dash-card__name serif">{v.name}</h3>
                <StatusBadge status={v.status} />
              </div>
              <div className="dash-card__meta mono">
                <span>{fmt(v.queries)} queries</span>
                <span className="t3">&middot;</span>
                <span className="teal">{fmt(v.earnings)} IP earned</span>
                <span className="t3">&middot;</span>
                <span className="t3">{v.lastQueried}</span>
              </div>
              <div className="dash-card__actions">
                <button
                  className="btn btn--ghost"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  title={v.status === "paused" ? "Resume" : "Pause"}
                  onClick={(e) => handlePause(e, v)}
                >
                  <PauseIcon size={13} />{" "}
                  {v.status === "paused" ? "Resume" : "Pause"}
                </button>
                <button
                  className="btn btn--ghost"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  title="Renew"
                  onClick={(e) => handleRenew(e, v)}
                >
                  <RenewIcon size={13} /> Renew
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
