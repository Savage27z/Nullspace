export type Category = "Medical" | "Financial" | "Environmental" | "Other"
export type ConditionType = "price" | "time" | "whitelist" | "deadman"
export type VaultStatus = "active" | "expired" | "paused"

export interface Vault {
  id: string
  name: string
  desc: string
  category: Category
  schema: string[]
  price: number
  provider: string
  queries: number
  earnings: number
  status: VaultStatus
  lastQueried: string
  liveQueried: boolean
  conditions: ConditionType[]
}

export interface ConditionMeta {
  icon: string
  label: string
  desc: string
}

export interface Query {
  q: string
  hash: string
  when: string
}

export interface VaultStats {
  totalVaults: number
  queriesToday: number
  totalVolumeIP: number
}
