"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { SunIcon, MoonIcon } from "@/components/shared/Icons"
import { truncAddr } from "@/lib/utils"
import { storyAeneid } from "@/lib/wagmi-config"

function getInitialTheme(): string {
  if (typeof window === "undefined") return "dark"
  try {
    const saved = localStorage.getItem("ns-theme")
    if (saved === "light" || saved === "dark") return saved
  } catch {}
  return "dark"
}

function applyTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme)
  try {
    localStorage.setItem("ns-theme", theme)
  } catch {}
}

export default function Topbar() {
  const pathname = usePathname()
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [theme, setTheme] = useState("dark")
  const [showWalletPicker, setShowWalletPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = getInitialTheme()
    setTheme(t)
    applyTheme(t)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowWalletPicker(false)
      }
    }
    if (showWalletPicker) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showWalletPicker])

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }

  const tabs = [
    { key: "/marketplace", label: "Marketplace" },
    { key: "/publish", label: "Publish" },
    { key: "/dashboard", label: "My Vaults" },
  ]

  const isActive = (k: string) => {
    if (k === "/marketplace" && (pathname === "/marketplace" || pathname.startsWith("/vault/"))) return true
    if (k !== "/marketplace" && pathname.startsWith(k)) return true
    return false
  }

  const isWrongNetwork = isConnected && chainId !== storyAeneid.id

  // Deduplicate connectors by name (EIP-6963 can surface duplicates)
  const uniqueConnectors = connectors.filter(
    (c, i, arr) => arr.findIndex((x) => x.name === c.name) === i
  )

  function handleWallet() {
    if (isConnected) {
      if (isWrongNetwork) {
        switchChain({ chainId: storyAeneid.id })
      } else {
        disconnect()
      }
    } else if (uniqueConnectors.length === 1) {
      connect({ connector: uniqueConnectors[0] })
    } else {
      setShowWalletPicker((v) => !v)
    }
  }

  function connectWith(connector: (typeof connectors)[number]) {
    connect({ connector })
    setShowWalletPicker(false)
  }

  return (
    <header className="topnav">
      <Link href="/" className="topnav__left">
        <div className="topnav__mark"></div>
        <span className="topnav__brand">Nullspace</span>
      </Link>

      <nav className="topnav__tabs">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key}
            className={"topnav__tab" + (isActive(t.key) ? " topnav__tab--active" : "")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="topnav__spacer"></div>

      <div className="topnav__right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        <span className="net-badge" style={isWrongNetwork ? { borderColor: "var(--amber)", color: "var(--amber)" } : undefined}>
          <span className="dot" style={isWrongNetwork ? { background: "var(--amber)" } : undefined}></span>
          {isWrongNetwork ? "Wrong Network" : "Aeneid Testnet"}
        </span>

        <div style={{ position: "relative" }} ref={pickerRef}>
          <button
            className="wallet-chip"
            onClick={handleWallet}
            title={isConnected ? (isWrongNetwork ? "Switch to Aeneid" : "Disconnect") : "Connect wallet"}
            style={isWrongNetwork ? { borderColor: "rgba(224,168,69,0.4)" } : undefined}
          >
            <span className="avatar"></span>
            {isWrongNetwork ? "Switch Network" : isConnected && address ? truncAddr(address) : "Connect"}
          </button>

          {showWalletPicker && !isConnected && (
            <div className="dd__menu" style={{ right: 0, top: "calc(100% + 8px)", minWidth: 220 }}>
              <div style={{ padding: "8px 10px 4px", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.04em" }}>
                SELECT WALLET
              </div>
              {uniqueConnectors.map((c) => (
                <button
                  key={c.uid}
                  className="dd__opt"
                  onMouseDown={() => connectWith(c)}
                  style={{ gap: 10 }}
                >
                  {c.icon && (
                    <img
                      src={typeof c.icon === "string" ? c.icon : undefined}
                      alt=""
                      width={20}
                      height={20}
                      style={{ borderRadius: 4 }}
                    />
                  )}
                  <span style={{ flex: 1, textAlign: "left" }}>{c.name}</span>
                </button>
              ))}
              {uniqueConnectors.length === 0 && (
                <div style={{ padding: "12px 10px", fontSize: 12, color: "var(--text-3)" }}>
                  No wallets detected. Install MetaMask, Rabby, or Zerion.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
