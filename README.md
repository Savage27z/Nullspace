<p align="center">
  <img src="https://img.shields.io/badge/Story_Protocol-CDR-00D4A4?style=for-the-badge" alt="CDR" />
  <img src="https://img.shields.io/badge/Chain-Aeneid_1315-8892A0?style=for-the-badge" alt="Aeneid" />
  <img src="https://img.shields.io/badge/Next.js-16-000?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TS" />
</p>

<h1 align="center">Nullspace</h1>
<p align="center"><strong>Query the dark. Never touch the data.</strong></p>
<p align="center">A private data marketplace built on Story Protocol's Confidential Data Rails (CDR).<br/>Data providers monetize sensitive datasets while keeping them fully encrypted.<br/>Consumers run queries through Trusted Execution Environments and only receive computed results.</p>

---

## The Problem

Sensitive data (medical records, financial flows, environmental telemetry) is locked away because sharing it means losing control of it. Data providers can't monetize what they can't expose, and consumers can't access what they can't trust. The result: trillions of dollars in data value sits dormant behind compliance walls.

## The Solution

Nullspace uses **Story Protocol's Confidential Data Rails** to create a marketplace where:

1. **Providers** seal encrypted datasets into on-chain vaults with programmable access conditions (price gates, time locks, wallet whitelists, dead man's switches)
2. **Consumers** pay to query vaults — their queries execute inside a **Trusted Execution Environment (TEE)** and only computed results are returned
3. **Raw data never leaves the enclave** — not to the consumer, not to us, not to anyone

The entire flow is cryptographically enforced through Story's DKG (Distributed Key Generation) network using TDH2 threshold decryption. No single party can decrypt the data — it requires a threshold of validators to cooperate.

## Architecture

```
 Consumer (browser)                          Provider (browser)
      |                                           |
      |  1. Connect wallet                        |  1. Connect wallet
      |  2. Browse marketplace                    |  2. Upload encrypted dataset
      |  3. Click "Unlock & Query"                |  3. Set access conditions
      |  4. Sign CDR read txn                     |  4. Sign CDR allocate + write txns
      |                                           |
      v                                           v
+------------------------------------------------------------------+
|                        Nullspace UI                               |
|                     Next.js 16 + wagmi                            |
+------------------+----------------------------+------------------+
                   |                            |
            +------v------+              +------v------+
            |   CDR SDK   |              |   CDR SDK   |
            |  consumer   |              |  uploader   |
            +------+------+              +------+------+
                   |                            |
                   |    accessCDR()             |    allocate()
                   |    read() ->              |    encryptDataKey()
                   |    collectPartials() ->   |    write()
                   |    decryptDataKey()        |
                   |                            |
            +------v----------------------------v------+
            |          Story Aeneid Testnet             |
            |          Chain ID: 1315                   |
            |                                          |
            |  DKG: 0xCcCc...0004                      |
            |  CDR: 0xCcCc...0005                      |
            |  OwnerWriteCondition: 0x4C9b...c34B      |
            |  LicenseReadCondition: 0xC064...f7a3     |
            +------------------+-----------------------+
                               |
                    +----------v----------+
                    |   DKG Validators    |
                    |   (TDH2 Threshold)  |
                    |                     |
                    |  Partial 1 ------+  |
                    |  Partial 2 ------+-->  Combine = Decrypted Key
                    |  Partial 3 ------+  |
                    |  ...             |  |
                    +---------------------+
```

## CDR Integration

This is not a mock — the CDR SDK is installed and wired to real on-chain operations.

### Vault Creation Flow (`/publish`)

```
initWasm()
    |
    v
observer.getGlobalPubKey()          -- Fetch the DKG network's public key
    |
    v
uploader.allocate({                 -- On-chain TX #1: reserve a vault UUID
  writeConditionAddr,                  with read/write access conditions
  readConditionAddr,
  skipConditionValidation: true
})
    |
    v
uploader.encryptDataKey({           -- Client-side TDH2 encryption using
  dataKey, globalPubKey, label         the DKG public key (WASM)
})
    |
    v
uploader.write({                    -- On-chain TX #2: write the encrypted
  uuid, encryptedData                  ciphertext to the vault
})
    |
    v
Returns: { uuid, allocateTxHash, writeTxHash }
```

### Vault Access Flow (`/vault/[uuid]`)

```
initWasm()
    |
    v
consumer.accessCDR({                -- On-chain TX: submit read request
  uuid,                                then collect threshold partial
  accessAuxData: "0x",                 decryptions from DKG validators,
  timeoutMs: 120_000                   combine them locally to recover
})                                     the original data key
    |
    v
Returns: { dataKey (Uint8Array), txHash }
    |
    v
new TextDecoder().decode(dataKey)   -- The decrypted secret
```

### Access Condition Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| DKG | `0xCcCcCC0000000000000000000000000000000004` | Distributed Key Generation coordination |
| CDR | `0xCcCcCC0000000000000000000000000000000005` | Vault storage and access control |
| OwnerWriteCondition | `0x4C9bFC96d7092b590D497A191826C3dA2277c34B` | Only vault owner can write |
| LicenseReadCondition | `0xC0640AD4CF2CaA9914C8e5C44234359a9102f7a3` | License token holders can read |
| LicenseToken | `0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC` | ERC-721 license token contract |

### Condition Encoding

```typescript
// Owner-only writes
encodeAbiParameters([{ type: "address" }], [ownerAddress])

// License-gated reads
encodeAbiParameters(
  [{ type: "address" }, { type: "address" }],
  [LicenseTokenAddress, ipId]
)

// Access with license token
encodeAbiParameters([{ type: "uint256[]" }], [[licenseTokenId]])
```

## Pages

### `/` — Landing

Full-screen immersive hero with the word "NULLSPACE" rendered in 180px type with generative algorithmic art clipped through the letterforms. Scrolling marquee shows live vault activity. Animated transition into the marketplace.

### `/marketplace` — Browse Vaults

Gallery grid of encrypted data vaults with generative cover art (deterministic per vault ID — same seed always produces the same visual). Stats bar showing total vaults, queries today, and IP volume. Client-side filtering by category (Medical, Financial, Environmental, Other) and sorting (Newest, Price, Most Queried).

### `/vault/[id]` — Vault Detail

Hero banner with vault-specific generative art. Two-column layout: left side shows description, schema columns (names visible, values encrypted), and access conditions. Right side shows the query panel with price, condition checklist, "Unlock & Query" button (triggers real CDR `accessCDR()` or wallet signature), SQL query editor, and blurred result panel that reveals on unlock.

For **real CDR vaults** (numeric UUID in URL): calls `consumer.accessCDR()` for actual threshold decryption.
For **mock vaults** (string ID): falls back to wallet signature with simulated CDR pipeline status updates.

### `/publish` — Create Vault

Three-step wizard:
1. **Upload** — drag-drop zone for encrypted dataset + metadata (name, category, description)
2. **Access Conditions** — toggle switches for price gate, time lock, wallet whitelist, and dead man's switch, each with expandable configuration
3. **Confirm** — summary card with all settings, then "Publish to CDR" fires real `createVault()` (allocate + encrypt + write = 2 on-chain transactions)

Returns the real CDR vault UUID and transaction hash on success.

### `/dashboard` — My Vaults

Stats (published count, total IP earned, query count) and a list of your published vaults with status badges (active/expired/paused), hover-reveal actions (pause/renew), and links to vault detail pages.

## Design System

Every design decision was made in the original prototype and preserved exactly:

- **No gradients, no shadows, no glassmorphism** (except the topbar backdrop-blur)
- **Teal (#00D4A4)** is the only accent color in the entire app
- **IBM Plex Mono** for all numbers, addresses, hashes, and data
- **Instrument Serif italic** for vault names only
- **DM Sans** for everything else
- **Dark theme** is default, with a full light theme toggle
- **Generative art** — deterministic per-vault duotone SVG (teal x magenta oklch blobs under fractal noise grain), computed algorithmically with no external assets
- **Subtle grain overlay** via SVG noise filter on `body::before`
- **CSS custom properties** for all colors — theme switching is instant

## Wallet Support

Multi-wallet support via wagmi's EIP-6963 provider discovery:

- **MetaMask**
- **Rabby**
- **Zerion**
- **Coinbase Wallet**
- **Brave Wallet**
- **Frame**
- Any other EIP-6963 compliant wallet

If multiple wallets are detected, a dropdown picker appears. If only one is installed, it connects directly. Wrong network detection shows an amber "Wrong Network" badge with a one-click switch to Story Aeneid Testnet.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, route groups, server components) |
| Language | TypeScript (strict, zero build errors) |
| Styling | CSS custom properties + Tailwind CSS base |
| Wallet | wagmi v2 + viem (EIP-6963 multi-provider) |
| CDR | @piplabs/cdr-sdk (WASM TDH2 encryption) |
| Chain | Story Aeneid Testnet (chain 1315) |
| Fonts | DM Sans, IBM Plex Mono, Instrument Serif (Google Fonts) |
| Art | Algorithmic SVG generation (oklch color space, fractal noise) |

## Project Structure

```
src/
  app/
    layout.tsx              Root layout (fonts, providers)
    page.tsx                Landing page (/)
    globals.css             All styles (900+ lines, no Tailwind utilities)
    (app)/
      layout.tsx            App shell (topbar + footer)
      marketplace/page.tsx  Vault gallery with filters
      vault/[id]/page.tsx   Vault detail + CDR access
      publish/page.tsx      3-step publish wizard + CDR create
      dashboard/page.tsx    My vaults management
  components/
    layout/
      Topbar.tsx            Nav + wallet picker + theme toggle
      Footer.tsx            Footer bar
      Providers.tsx         WagmiProvider + QueryClientProvider
    shared/
      Home.tsx              Full-screen landing hero
      VaultArt.tsx          Generative SVG art component
      Icons.tsx             28 hand-crafted SVG icons (Lucide-style)
  lib/
    cdr-client.ts           CDR SDK hook + createVault + accessVault
    wagmi-config.ts         Chain definition + multi-wallet config
    mock-data.ts            8 vaults, conditions, query history
    genart.ts               Algorithmic art generation (vault + hero)
    utils.ts                cn(), truncAddr(), fmt()
  types/
    index.ts                Vault, Condition, Query types
```

## Getting Started

```bash
git clone https://github.com/Savage27z/Nullspace.git
cd Nullspace
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_RPC_URL=https://aeneid.storyrpc.io
NEXT_PUBLIC_STORY_API_URL=http://172.192.41.96:1317
NEXT_PUBLIC_CHAIN_ID=1315
```

### Requirements

- Node.js 18+
- A funded wallet on Story Aeneid Testnet (for CDR transactions)
- Any EVM wallet extension (MetaMask, Rabby, Zerion, etc.)

## How It Works (End to End)

**As a data provider:**
1. Connect your wallet at the top right
2. Go to `/publish`
3. Drop your dataset, name it, set a price and conditions
4. Click "Publish to CDR" — signs 2 transactions (allocate vault + write encrypted data)
5. Get back a CDR vault UUID and tx hash
6. Your vault appears in the marketplace for consumers to query

**As a data consumer:**
1. Browse `/marketplace`, filter by category
2. Click a vault to see its schema and conditions
3. Connect wallet, click "Unlock & Query"
4. Sign the CDR read transaction
5. The DKG validators provide threshold partial decryptions
6. Your browser combines the partials to recover the data key
7. Query results appear — raw data never left the enclave

## Built For

[CDR Hackathon](https://build.usecdr.dev/) by Story Protocol

## License

MIT
