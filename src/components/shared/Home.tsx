"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { VAULTS } from "@/lib/mock-data"
import { fmt } from "@/lib/utils"
import { heroArtURI } from "@/lib/genart"
import { CTAArrowIcon } from "@/components/shared/Icons"

export default function Home() {
  const router = useRouter()
  const [entered, setEntered] = useState(false)
  const artUri = useMemo(() => heroArtURI(), [])

  const totalVaults = VAULTS.length
  const totalQueries = VAULTS.reduce((s, v) => s + v.queries, 0)

  function enter() {
    setEntered(true)
    setTimeout(() => router.push("/marketplace"), 500)
  }

  return (
    <div className={"hm" + (entered ? " hm--exit" : "")}>
      {/* Full-bleed art background */}
      <div
        className="hm-art-bg"
        style={{ backgroundImage: `url("${artUri}")` }}
      >
        <div className="vart__scan"></div>
      </div>

      {/* Top nav */}
      <nav className="hm-nav">
        <div className="hm-nav__left">
          <div className="hm-mark"></div>
          <span className="hm-nav__name">Nullspace</span>
        </div>
        <div className="hm-nav__right">
          <span className="hm-nav__link mono">Docs</span>
          <span className="hm-nav__link mono">GitHub</span>
          <button className="hm-nav__connect" onClick={enter}>
            <span className="pulse" style={{ width: 5, height: 5 }}></span>
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="hm-hero">
        <div className="hm-hero__title-wrap">
          <h1
            className="hm-hero__title"
            style={{ backgroundImage: `url("${artUri}")` }}
          >
            NULLSPACE
          </h1>
        </div>

        <p className="hm-hero__tagline">
          Query confidential datasets without ever touching the data.
        </p>

        <div className="hm-hero__actions">
          <button className="hm-cta" onClick={enter}>
            Enter Marketplace
            <CTAArrowIcon />
          </button>
          <span className="hm-hero__sub mono">
            {totalVaults} vaults &middot; {fmt(totalQueries)} queries &middot;
            Story Aeneid Testnet
          </span>
        </div>
      </div>

      {/* Scrolling marquee */}
      <div className="hm-marquee">
        <div className="hm-marquee__track">
          {[...VAULTS, ...VAULTS].map((v, i) => (
            <span className="hm-marquee__item mono" key={i}>
              <span
                className="hm-marquee__dot"
                style={{
                  background: v.liveQueried
                    ? "var(--accent)"
                    : "var(--text-3)",
                }}
              ></span>
              <span style={{ color: "var(--text-2)" }}>{v.name}</span>
              <span className="t3">&middot;</span>
              <span className="t3">{fmt(v.queries)} queries</span>
              <span className="t3">&middot;</span>
              <span style={{ color: "var(--accent)" }}>
                {fmt(v.price)} IP
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="hm-bottom">
        <span className="mono t3">&copy; 2026 Nullspace</span>
        <span className="mono t3">Confidential Data Rails</span>
      </div>
    </div>
  )
}
