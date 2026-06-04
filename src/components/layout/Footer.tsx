"use client"

export default function Footer() {
  return (
    <footer className="app-footer mono">
      <span>&copy; 2026 Nullspace</span>
      <span className="t3">
        <a href="https://docs.story.foundation/developers/cdr-sdk/overview" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
          Confidential Data Rails
        </a>
        {" "}&middot;{" "}
        <a href="https://www.story.foundation" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
          Story Protocol
        </a>
      </span>
    </footer>
  )
}
