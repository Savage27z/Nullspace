"use client"

import { useMemo, useCallback, useRef } from "react"
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  encodeAbiParameters,
} from "viem"

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://aeneid.storyrpc.io"
const STORY_API_URL = process.env.NEXT_PUBLIC_STORY_API_URL || "http://172.192.41.96:1317"

export const CDR_CONTRACTS = {
  DKG: "0xCcCcCC0000000000000000000000000000000004" as const,
  CDR: "0xCcCcCC0000000000000000000000000000000005" as const,
  OwnerWriteCondition: "0x4C9bFC96d7092b590D497A191826C3dA2277c34B" as const,
  LicenseReadCondition: "0xC0640AD4CF2CaA9914C8e5C44234359a9102f7a3" as const,
  LicenseToken: "0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC" as const,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let wasmReady = false
let wasmPromise: Promise<void> | null = null

async function ensureWasm() {
  if (wasmReady) return
  if (wasmPromise) return wasmPromise
  wasmPromise = (async () => {
    const { initWasm } = await import("@piplabs/cdr-sdk")
    await initWasm()
    wasmReady = true
  })()
  return wasmPromise
}

export function useCDRClient() {
  const publicClient = useMemo(
    () => createPublicClient({ transport: http(RPC_URL) }),
    []
  )

  // Cache the write client so we don't re-init per call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writeClientRef = useRef<any>(null)
  const lastAccountRef = useRef<string>("")

  const getWriteClient = useCallback(
    async (walletProvider: unknown, address: string) => {
      if (writeClientRef.current && lastAccountRef.current === address) {
        return writeClientRef.current
      }

      await ensureWasm()
      const { CDRClient } = await import("@piplabs/cdr-sdk")

      const walletClient = createWalletClient({
        transport: custom(walletProvider as Parameters<typeof custom>[0]),
        account: address as `0x${string}`,
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = new (CDRClient as any)({
        network: "testnet",
        publicClient,
        walletClient,
        apiUrl: STORY_API_URL,
      })

      writeClientRef.current = client
      lastAccountRef.current = address
      return client
    },
    [publicClient]
  )

  return { getWriteClient, publicClient }
}

// ── Condition encoders ──

export function encodeOwnerWrite(ownerAddress: string) {
  return encodeAbiParameters(
    [{ type: "address" }],
    [ownerAddress as `0x${string}`]
  )
}

export function encodeOwnerRead(ownerAddress: string) {
  return encodeAbiParameters(
    [{ type: "address" }],
    [ownerAddress as `0x${string}`]
  )
}

// ── CDR vault operations ──

export interface VaultResult {
  uuid: number
  allocateTxHash: string
  writeTxHash: string
}

export interface AccessResult {
  data: string
  txHash: string
}

/**
 * Create a CDR vault with owner-only read/write.
 * Calls: allocate() → encryptDataKey() → write() (2 on-chain txns)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createVault(
  cdrClient: any,
  ownerAddress: string,
  secretData: string,
  onStatus?: (msg: string) => void
): Promise<VaultResult> {
  const { uploader, observer } = cdrClient

  onStatus?.("Fetching DKG global public key…")
  const globalPubKey = await observer.getGlobalPubKey()

  onStatus?.("Allocating CDR vault on-chain…")
  const { uuid, txHash: allocateTxHash } = await uploader.allocate({
    updatable: false,
    writeConditionAddr: ownerAddress as `0x${string}`,
    readConditionAddr: ownerAddress as `0x${string}`,
    writeConditionData: "0x",
    readConditionData: "0x",
    skipConditionValidation: true,
  })

  onStatus?.(`Vault allocated (UUID: ${uuid}). Encrypting data key…`)
  const dataKey = new TextEncoder().encode(secretData)

  const { uuidToLabel } = await import("@piplabs/cdr-sdk")
  const label = uuidToLabel(uuid)
  const ciphertext = await uploader.encryptDataKey({
    dataKey,
    globalPubKey,
    label,
  })

  onStatus?.("Writing encrypted data to chain…")
  const { toHex } = await import("viem")
  const { txHash: writeTxHash } = await uploader.write({
    uuid,
    accessAuxData: "0x",
    encryptedData: toHex(ciphertext.raw),
  })

  onStatus?.("Vault published successfully!")
  return { uuid, allocateTxHash, writeTxHash }
}

/**
 * Access a CDR vault and decrypt its contents.
 * Calls: accessCDR() which internally does read() → collectPartials() → decrypt
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function accessVault(
  cdrClient: any,
  uuid: number,
  onStatus?: (msg: string) => void
): Promise<AccessResult> {
  const { consumer } = cdrClient

  onStatus?.("Submitting read request to CDR…")
  const { dataKey, txHash } = await consumer.accessCDR({
    uuid,
    accessAuxData: "0x",
    timeoutMs: 120_000,
  })

  onStatus?.("Decrypted successfully!")
  const data = new TextDecoder().decode(dataKey)
  return { data, txHash }
}
