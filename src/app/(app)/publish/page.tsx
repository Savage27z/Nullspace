"use client"

import { useState, Fragment, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAccount, useConnectorClient } from "wagmi"
import { CONDITION_TYPES } from "@/lib/mock-data"
import { useCDRClient, createVault } from "@/lib/cdr-client"
import {
  CheckIcon,
  UploadIcon,
  FileIcon,
  ArrowIcon,
  ChevronIcon,
  SkullIcon,
  CONDITION_ICON_MAP,
} from "@/components/shared/Icons"
import type { ConditionType } from "@/types"

function StepIndicator({ step }: { step: number }) {
  const steps = ["Upload", "Access conditions", "Confirm"]
  return (
    <div className="steps">
      {steps.map((s, i) => {
        const n = i + 1
        const done = step > n
        const active = step === n
        return (
          <Fragment key={s}>
            <div
              className={
                "step" +
                (active ? " step--active" : "") +
                (done ? " step--done" : "")
              }
            >
              <span className="step__circle">
                {done ? <CheckIcon size={13} /> : n}
              </span>
              <span className="step__label">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={"step__line" + (done ? " step__line--done" : "")}
              ></span>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      className={"toggle" + (on ? " toggle--on" : "")}
      onClick={onClick}
      aria-pressed={on}
    >
      <span className="toggle__knob"></span>
    </button>
  )
}

function Select({
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
    <div className="dd dd--block">
      <button
        className="dd__btn dd__btn--block"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      >
        <span>{value}</span>
        <ChevronIcon size={13} />
      </button>
      {open && (
        <div className="dd__menu dd__menu--block">
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

function ConditionConfig({
  type,
  cfg,
  set,
}: {
  type: string
  cfg: Record<string, string>
  set: (p: Record<string, string>) => void
}) {
  if (type === "price")
    return (
      <div className="cond-config">
        <label className="field">
          <span className="field__label">IP token amount per query</span>
          <div className="field__mono-wrap">
            <input
              className="field__input mono"
              type="number"
              value={cfg.price}
              onChange={(e) => set({ price: e.target.value })}
            />
            <span className="field__suffix mono">IP</span>
          </div>
        </label>
      </div>
    )
  if (type === "time")
    return (
      <div className="cond-config">
        <label className="field">
          <span className="field__label">Lock duration</span>
          <Select
            value={cfg.time}
            options={["1h", "6h", "24h", "7d", "30d"]}
            onChange={(v) => set({ time: v })}
          />
        </label>
      </div>
    )
  if (type === "whitelist")
    return (
      <div className="cond-config">
        <label className="field">
          <span className="field__label">
            Whitelisted addresses — one per line
          </span>
          <textarea
            className="field__input mono"
            rows={3}
            placeholder={"0x7Ad4c91F…\n0x33Bc7E10…"}
            value={cfg.whitelist}
            onChange={(e) => set({ whitelist: e.target.value })}
          />
        </label>
      </div>
    )
  if (type === "deadman")
    return (
      <div className="cond-config">
        <label className="field">
          <span className="field__label">Renewal interval</span>
          <Select
            value={cfg.deadman}
            options={["7d", "14d", "30d", "90d"]}
            onChange={(v) => set({ deadman: v })}
          />
        </label>
        <div className="warn-note">
          <SkullIcon size={15} /> Vault auto-deletes if not renewed before
          interval lapses.
        </div>
      </div>
    )
  return null
}

export default function PublishPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { data: connectorClient } = useConnectorClient({ query: { enabled: isConnected } })
  const { getWriteClient } = useCDRClient()
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function formatFileSize(bytes: number) {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB"
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB"
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + " KB"
    return bytes + " B"
  }

  function handleFile(f: File) {
    setFile(f.name)
    setFileSize(formatFileSize(f.size))
  }
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [category, setCategory] = useState("Medical")
  const [conds, setConds] = useState<Record<string, boolean>>({
    price: true,
    time: false,
    whitelist: false,
    deadman: false,
  })
  const [cfg, setCfg] = useState<Record<string, string>>({
    price: "240",
    time: "24h",
    whitelist: "",
    deadman: "30d",
  })
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [pubStatus, setPubStatus] = useState("")
  const [pubTxHash, setPubTxHash] = useState("")

  const toggleCond = (t: string) =>
    setConds((c) => ({ ...c, [t]: !c[t] }))
  const setCfgPart = (p: Record<string, string>) =>
    setCfg((c) => ({ ...c, ...p }))

  const [pubUuid, setPubUuid] = useState<number | null>(null)

  const publish = useCallback(async () => {
    if (!isConnected || !connectorClient || !address) return

    setPublishing(true)
    setPubStatus("Initializing CDR WASM…")

    try {
      const cdrClient = await getWriteClient(
        connectorClient.transport,
        address
      )

      const secretPayload = JSON.stringify({
        vault: name,
        category,
        desc,
        schema: file,
        price: cfg.price,
        conditions: Object.keys(conds).filter((k) => conds[k]),
        created: new Date().toISOString(),
      })

      const result = await createVault(
        cdrClient,
        address,
        secretPayload,
        setPubStatus
      )

      setPubUuid(result.uuid)
      const hash = result.writeTxHash || result.allocateTxHash
      setPubTxHash(
        hash.slice(0, 10) + "…" + hash.slice(-4)
      )
      setPublished(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      if (msg.includes("rejected") || msg.includes("denied")) {
        setPubStatus("Transaction rejected by wallet")
      } else {
        setPubStatus("CDR error: " + msg.slice(0, 80))
      }
      setPublishing(false)
    }
  }, [isConnected, connectorClient, address, name, category, desc, file, cfg, conds, getWriteClient])

  if (published)
    return (
      <div
        className="fade-in"
        style={{ textAlign: "center", padding: "60px 0" }}
      >
        <div className="done-mark">
          <CheckIcon size={28} />
        </div>
        <h1 className="serif" style={{ fontSize: 30, margin: "20px 0 8px" }}>
          {name || "Untitled Vault"}
        </h1>
        <p className="t2" style={{ marginBottom: 6 }}>
          Published to Confidential Data Rails.
        </p>
        {pubUuid !== null && (
          <p className="mono teal" style={{ fontSize: 13, marginBottom: 6 }}>
            CDR Vault UUID: {pubUuid}
          </p>
        )}
        <p
          className="mono t3"
          style={{ fontSize: 12, marginBottom: 28 }}
        >
          tx {pubTxHash} &middot; Story Aeneid Testnet
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            className="btn btn--primary"
            onClick={() => router.push("/dashboard")}
          >
            Go to my vaults
          </button>
          <button className="btn" onClick={() => router.push("/marketplace")}>
            View marketplace
          </button>
        </div>
      </div>
    )

  return (
    <div className="fade-in publish">
      <div className="page-head">
        <h1>Publish Vault</h1>
        <p>
          Seal a dataset into the enclave and define how others may query it.
        </p>
      </div>

      <StepIndicator step={step} />

      {/* STEP 1 */}
      {step === 1 && (
        <div className="step-pane">
          {/* TODO: CDR SDK — encrypt file with CDR DataProtector */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.parquet,.json,.enc,.tsv,.xlsx"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
          <div
            className={
              "dropzone" +
              (dragging ? " dropzone--over" : "") +
              (file ? " dropzone--filled" : "")
            }
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              const f = e.dataTransfer.files[0]
              if (f) handleFile(f)
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? <FileIcon size={26} /> : <UploadIcon size={26} />}
            <div className="dropzone__title">
              {file || "Drop your encrypted dataset"}
            </div>
            <div className="dropzone__sub mono">
              {file
                ? `${fileSize} · client-side encrypted · ready`
                : "CSV / Parquet / JSON · click or drag to upload"}
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span className="field__label">Vault name</span>
              <input
                className="field__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Helix Cohort 7"
              />
            </label>
            <label className="field">
              <span className="field__label">Category</span>
              <Select
                value={category}
                options={[
                  "Medical",
                  "Financial",
                  "Environmental",
                  "Other",
                ]}
                onChange={setCategory}
              />
            </label>
            <label className="field field--full">
              <span className="field__label">Description</span>
              <textarea
                className="field__input"
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What does this dataset contain?"
              />
            </label>
          </div>

          <div className="wizard-foot">
            <span></span>
            <button
              className="btn btn--primary"
              onClick={() => setStep(2)}
              disabled={!file || !name}
            >
              Continue <ArrowIcon size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="step-pane">
          <div className="cond-toggles">
            {(
              Object.keys(CONDITION_TYPES) as ConditionType[]
            ).map((t) => {
              const c = CONDITION_TYPES[t]
              const IconComp = CONDITION_ICON_MAP[c.icon]
              const on = conds[t]
              return (
                <div
                  className={
                    "cond-toggle" + (on ? " cond-toggle--on" : "")
                  }
                  key={t}
                >
                  <div className="cond-toggle__row">
                    <span className="cond-toggle__icon">
                      <IconComp size={17} />
                    </span>
                    <div className="cond-toggle__body">
                      <div className="cond-toggle__label">{c.label}</div>
                      <div className="cond-toggle__desc">{c.desc}</div>
                    </div>
                    <Toggle on={on} onClick={() => toggleCond(t)} />
                  </div>
                  {on && (
                    <div className="cond-toggle__config">
                      <ConditionConfig
                        type={t}
                        cfg={cfg}
                        set={setCfgPart}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="wizard-foot">
            <button className="btn btn--ghost" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              className="btn btn--primary"
              onClick={() => setStep(3)}
            >
              Review <ArrowIcon size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="step-pane">
          <div className="summary-card">
            <div className="summary-row">
              <span className="summary-k">Name</span>
              <span className="summary-v serif" style={{ fontSize: 18 }}>
                {name || "Untitled"}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-k">Category</span>
              <span className="summary-v">
                <span className="pill">{category}</span>
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-k">Description</span>
              <span className="summary-v t2">{desc || "—"}</span>
            </div>
            <div className="summary-row">
              <span className="summary-k">Dataset</span>
              <span className="summary-v mono">{file || "—"}</span>
            </div>
            <div
              className="summary-row"
              style={{ alignItems: "flex-start" }}
            >
              <span className="summary-k">Conditions</span>
              <span className="summary-v">
                {Object.keys(conds)
                  .filter((t) => conds[t])
                  .map((t) => {
                    const c =
                      CONDITION_TYPES[t as ConditionType]
                    let detail = ""
                    if (t === "price") detail = `${cfg.price} IP / query`
                    if (t === "time") detail = `${cfg.time} lock`
                    if (t === "whitelist")
                      detail = `${
                        cfg.whitelist.split("\n").filter(Boolean).length
                      } addresses`
                    if (t === "deadman")
                      detail = `renew every ${cfg.deadman}`
                    return (
                      <div
                        key={t}
                        className="mono"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                          fontSize: 13,
                        }}
                      >
                        <CheckIcon
                          size={13}
                          style={{ color: "var(--accent)" }}
                        />{" "}
                        {c.label}{" "}
                        <span className="t3">&middot; {detail}</span>
                      </div>
                    )
                  })}
                {!Object.values(conds).some(Boolean) && (
                  <span className="t3">No conditions — open access</span>
                )}
              </span>
            </div>
          </div>

          {!isConnected && (
            <p className="t3" style={{ fontSize: 12, textAlign: "center", marginTop: 16 }}>
              Connect your wallet to publish this vault.
            </p>
          )}

          <button
            className="btn btn--primary btn--block btn--lg"
            onClick={publish}
            disabled={publishing || !isConnected}
            style={{ marginTop: 20 }}
          >
            {publishing ? pubStatus || "Publishing…" : !isConnected ? "Connect Wallet" : "Publish to CDR"}
          </button>
          <p
            className="t3"
            style={{ fontSize: 12, textAlign: "center", marginTop: 12 }}
          >
            This transaction will be recorded on Story Aeneid Testnet.
          </p>
          <div className="wizard-foot" style={{ marginTop: 18 }}>
            <button
              className="btn btn--ghost"
              onClick={() => setStep(2)}
            >
              Back
            </button>
            <span></span>
          </div>
        </div>
      )}
    </div>
  )
}
