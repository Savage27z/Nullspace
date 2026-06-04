# Nullspace

**Query the dark. Never touch the data.**

A private data marketplace built on [Story Protocol's Confidential Data Rails (CDR)](https://docs.story.foundation/developers/cdr-sdk/overview). Data providers monetize sensitive datasets while keeping them fully encrypted — consumers run queries through Trusted Execution Environments (TEEs) and only receive computed results.

## Architecture

```
                     +-----------------+
                     |   Nullspace UI  |
                     |   (Next.js 16)  |
                     +--------+--------+
                              |
                   +----------+----------+
                   |                     |
            +------v------+      +------v------+
            |  wagmi/viem |      |  CDR SDK    |
            |  (wallet)   |      | @piplabs/   |
            +------+------+      +------+------+
                   |                     |
            +------v------+      +------v------+
            | Story Aeneid|      |  DKG / TEE  |
            | Testnet     |      |  Validators |
            | (chain 1315)|      |  (TDH2)     |
            +-------------+      +-------------+
```

### CDR Integration Points

| Flow | SDK Method | Status |
|------|-----------|--------|
| Create vault | `uploader.allocate()` + `uploader.write()` | Wallet signature demo |
| Encrypt data | `uploader.encryptDataKey()` | Simulated client-side |
| Unlock vault | `consumer.accessCDR()` | Wallet signature demo |
| Query result | TEE decryption via `consumer.decryptDataKey()` | Mock result display |
| Access conditions | `OwnerWriteCondition` / `LicenseReadCondition` | Contract addresses wired |

### Key Contracts (Aeneid Testnet)

- **DKG**: `0xCcCcCC0000000000000000000000000000000004`
- **CDR**: `0xCcCcCC0000000000000000000000000000000005`
- **OwnerWriteCondition**: `0x4C9bFC96d7092b590D497A191826C3dA2277c34B`
- **LicenseReadCondition**: `0xC0640AD4CF2CaA9914C8e5C44234359a9102f7a3`

## Pages

- **/** — Landing page with generative art hero
- **/marketplace** — Browse encrypted vaults with category filters and sorting
- **/vault/[id]** — Vault detail with schema, conditions, and query panel (wallet-connected unlock)
- **/publish** — 3-step wizard to create and publish a new vault (wallet-signed)
- **/dashboard** — Manage your published vaults

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- wagmi + viem (Story Aeneid Testnet, chain 1315)
- @piplabs/cdr-sdk (Confidential Data Rails)
- Generative algorithmic SVG art (deterministic per vault)
- Dark/light theme with CSS custom properties

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Connect MetaMask to Story Aeneid Testnet (auto-prompted on connect).

## Environment

```
NEXT_PUBLIC_RPC_URL=https://aeneid.storyrpc.io
NEXT_PUBLIC_STORY_API_URL=http://172.192.41.96:1317
NEXT_PUBLIC_CHAIN_ID=1315
```

## CDR SDK Usage

```typescript
import { CDRClient, initWasm } from "@piplabs/cdr-sdk"

await initWasm()

// Upload (provider)
const { uuid } = await client.uploader.allocate({
  writeConditionAddr: CDR_CONTRACTS.OwnerWriteCondition,
  readConditionAddr: CDR_CONTRACTS.LicenseReadCondition,
  writeConditionData: encodeWriteCondition(ownerAddress),
  readConditionData: encodeReadCondition(ipId),
})

// Access (consumer)
const { dataKey } = await client.consumer.accessCDR({
  uuid,
  accessAuxData: encodeAccessAuxData([licenseTokenId]),
  timeoutMs: 120_000,
})
```

## License

MIT
