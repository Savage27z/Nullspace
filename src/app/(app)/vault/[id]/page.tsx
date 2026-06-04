"use client"

import { useState, useCallback } from "react"
import { use } from "react"
import Link from "next/link"
import { useAccount, useConnect, useConnectorClient } from "wagmi"
import { VAULTS, CONDITION_TYPES, queryHistoryFor } from "@/lib/mock-data"
import { useCDRClient, accessVault } from "@/lib/cdr-client"
import { useUserVaults } from "@/lib/vault-store"
import { fmt, truncAddr } from "@/lib/utils"
import VaultArt from "@/components/shared/VaultArt"
import {
  CheckIcon,
  LockIcon,
  BackArrowIcon,
  ExternalIcon,
  CONDITION_ICON_MAP,
} from "@/components/shared/Icons"
import type { ConditionType } from "@/types"

function ConditionRow({
  type,
  mode,
  met,
}: {
  type: ConditionType
  mode: "list" | "check"
  met?: boolean
}) {
  const c = CONDITION_TYPES[type]
  const IconComp = CONDITION_ICON_MAP[c.icon]
  return (
    <div
      className={
        "cond-row" +
        (mode === "check"
          ? met
            ? " cond-row--met"
            : " cond-row--unmet"
          : "")
      }
    >
      <span className="cond-row__icon">
        <IconComp size={16} />
      </span>
      <div className="cond-row__body">
        <div className="cond-row__label">{c.label}</div>
        <div className="cond-row__desc">{c.desc}</div>
      </div>
      {mode === "check" && (
        <span className="cond-row__state">
          {met ? (
            <CheckIcon size={15} />
          ) : (
            <span className="cond-row__dot"></span>
          )}
        </span>
      )}
    </div>
  )
}

export default function VaultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { vaults: userVaults } = useUserVaults()
  const v = VAULTS.find((x) => x.id === id) || userVaults.find((x) => x.id === id) || VAULTS[0]
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { data: connectorClient } = useConnectorClient({ query: { enabled: isConnected } })
  const { getWriteClient } = useCDRClient()

  const [unlocked, setUnlocked] = useState(false)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState("")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [decryptedData, setDecryptedData] = useState<string | null>(null)
  const col = v.schema[1] || v.schema[0] || "column"
  const [query, setQuery] = useState(
    `SELECT ${col}, COUNT(*)\nFROM vault\nGROUP BY ${col}\nORDER BY 2 DESC\nLIMIT 20;`
  )

  const condState: Record<string, boolean> = {
    price: isConnected,
    whitelist: isConnected,
    time: false,
    deadman: true,
  }
  const history = queryHistoryFor(v.id)

  // CDR SDK — vault unlock flow
  // Attempts real accessCDR() call. If the vault UUID doesn't exist on-chain
  // (mock vaults), falls back to wallet signature demo.
  const unlock = useCallback(async () => {
    if (!isConnected || !connectorClient || !address) {
      setStatus("Connect wallet first")
      return
    }

    setRunning(true)
    setStatus("Initializing CDR WASM…")

    try {
      const cdrClient = await getWriteClient(
        connectorClient.transport,
        address
      )

      // Try real CDR access if this is a real vault UUID (numeric id in the URL)
      const numericUuid = parseInt(id)
      if (!isNaN(numericUuid) && numericUuid > 0) {
        const result = await accessVault(cdrClient, numericUuid, setStatus)
        setDecryptedData(result.data)
        setTxHash(result.txHash.slice(0, 10) + "…" + result.txHash.slice(-4))
        setUnlocked(true)
        setStatus("")
        return
      }

      // Fallback for mock vaults: sign a CDR read request message
      setStatus("Signing CDR read request…")
      const message = `Nullspace CDR Read Request\nVault: ${v.id}\nQuery: ${query.slice(0, 64)}…\nTimestamp: ${Date.now()}`

      const viem = await import("viem")
      const walletClient = cdrClient.walletClient || viem.createWalletClient({
        transport: viem.custom(connectorClient.transport),
        account: address as `0x${string}`,
      })

      const signature = await walletClient.signMessage({
        message,
        account: address as `0x${string}`,
      })

      setStatus("Collecting validator partials…")
      await new Promise((r) => setTimeout(r, 600))

      setStatus("Decrypting via TEE…")
      await new Promise((r) => setTimeout(r, 400))

      setTxHash(signature.slice(0, 10) + "…" + signature.slice(-8))
      setUnlocked(true)
      setStatus("")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      if (msg.includes("rejected") || msg.includes("denied")) {
        setStatus("Transaction rejected")
      } else {
        setStatus("CDR error: " + msg.slice(0, 80))
      }
    } finally {
      setRunning(false)
    }
  }, [isConnected, connectorClient, address, id, v.id, query, getWriteClient])

  return (
    <div className="fade-in vault-detail">
      {/* Hero */}
      <div className="vd-hero">
        <VaultArt seed={v.id} style={{ position: "absolute", inset: 0 }} />
        <div className="vd-hero__veil"></div>
        <div className="vd-hero__content">
          <Link href="/marketplace" className="vd-hero__back">
            <BackArrowIcon />
            Back
          </Link>
          <div className="vd-hero__info">
            <span
              className="pill"
              style={{
                background: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                backdropFilter: "blur(6px)",
              }}
            >
              {v.category}
            </span>
            <h1 className="vd-hero__title serif">{v.name}</h1>
            <div className="vd-hero__meta mono">
              <span>{fmt(v.queries)} queries</span>
              <span>&middot;</span>
              <span className="t2">{truncAddr(v.provider)}</span>
              {v.liveQueried && (
                <>
                  <span>&middot;</span>
                  <span
                    className="teal"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      className="pulse"
                      style={{ width: 5, height: 5 }}
                    ></span>
                    live
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="vd-grid">
        <div className="vd-left">
          <div className="vd-section">
            <h2 className="vd-section__title">About</h2>
            <p className="vd-section__desc">{v.desc}</p>
          </div>

          <div className="vd-section">
            <h2 className="vd-section__title">Schema</h2>
            <p className="vd-section__sub">
              Column names are visible — values remain encrypted inside the
              enclave.
            </p>
            <div className="vd-schema">
              {v.schema.map((col, i) => (
                <div className="vd-schema__col" key={col}>
                  <span className="vd-schema__idx mono t3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="vd-schema__name mono">{col}</span>
                  <span className="vd-schema__cipher t3">
                    {"▓▓▒░ ▓░▒▓"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="vd-section">
            <h2 className="vd-section__title">Access Conditions</h2>
            <div className="cond-list">
              {v.conditions.map((t) => (
                <ConditionRow key={t} type={t} mode="list" />
              ))}
            </div>
          </div>
        </div>

        {/* Right: query panel */}
        <div className="vd-right">
          <div className="vd-panel">
            <div className="vd-panel__price">
              <span className="vd-panel__num mono">{fmt(v.price)}</span>
              <span className="vd-panel__unit">IP / query</span>
            </div>

            <div className="vd-panel__checks">
              {v.conditions.map((t) => (
                <div className="vd-panel__check" key={t}>
                  {condState[t] ? (
                    <CheckIcon
                      size={14}
                      style={{ color: "var(--accent)" }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          border: "1.5px solid var(--text-3)",
                          display: "block",
                        }}
                      ></span>
                    </span>
                  )}
                  <span
                    style={{
                      color: condState[t] ? "var(--text)" : "var(--text-3)",
                    }}
                  >
                    {CONDITION_TYPES[t].label}
                  </span>
                </div>
              ))}
            </div>

            {!isConnected && (
              <p className="t3" style={{ fontSize: 12, textAlign: "center" }}>
                Connect your wallet to unlock this vault
              </p>
            )}

            <button
              className="btn btn--primary btn--block btn--lg"
              onClick={() => {
                if (!isConnected) {
                  const connector = connectors[0]
                  if (connector) connect({ connector })
                } else {
                  unlock()
                }
              }}
              disabled={unlocked || running}
            >
              {running
                ? status || "Processing…"
                : unlocked
                ? <>
                    <CheckIcon size={15} /> Unlocked
                  </>
                : !isConnected
                ? "Connect Wallet"
                : "Unlock & Query"}
            </button>

            {txHash && (
              <p className="mono t3" style={{ fontSize: 11, textAlign: "center" }}>
                tx {txHash} &middot; Aeneid Testnet
              </p>
            )}

            {status && !running && (
              <p className="t3" style={{ fontSize: 12, textAlign: "center", color: status.includes("error") || status.includes("rejected") ? "var(--red)" : "var(--text-2)" }}>
                {status}
              </p>
            )}

            <div>
              <label className="vd-panel__label">Query</label>
              <textarea
                className="vd-panel__textarea mono"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                spellCheck={false}
                rows={5}
              />
            </div>

            <div>
              <label className="vd-panel__label">Result</label>
              <div
                className={
                  "vd-result" + (unlocked ? " vd-result--open" : "")
                }
              >
                {!unlocked && (
                  <div className="vd-result__lock">
                    <LockIcon size={18} />
                    <span>Unlock to reveal results</span>
                  </div>
                )}
                <pre className="vd-result__data mono">{decryptedData || `gene_symbol   count
TP53          1284
BRCA1          642
EGFR           511
KRAS           498
PTEN           377
─────────────────────
rows: 20   enclave: aeneid-cdr-3
hash: 0x4f9a…c012`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Query history */}
      <div style={{ marginTop: 24 }}>
        <div className="section__head">
          <span className="section__title">Query History</span>
          <span className="section__count">{history.length} queries</span>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                {["TIME", "QUERY", "RESULT HASH"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      fontSize: 11,
                      letterSpacing: "0.04em",
                      color: "var(--text-3)",
                      fontWeight: 500,
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
                <th
                  style={{
                    width: 40,
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                  }}
                ></th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < history.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  <td
                    className="mono"
                    style={{
                      padding: "10px 16px",
                      fontSize: 12,
                      color: "var(--text-3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.when}
                  </td>
                  <td
                    className="mono"
                    style={{
                      padding: "10px 16px",
                      fontSize: 12,
                      color: "var(--text-2)",
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.q}
                  </td>
                  <td
                    className="mono"
                    style={{
                      padding: "10px 16px",
                      fontSize: 12,
                      color: "var(--text-2)",
                    }}
                  >
                    {h.hash}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <a
                      href={`https://aeneid.storyscan.xyz`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: "inline-flex" }}
                    >
                      <ExternalIcon
                        size={14}
                        style={{ color: "var(--text-3)" }}
                      />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
