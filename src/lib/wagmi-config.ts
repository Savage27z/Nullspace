import { http, createConfig, createStorage } from "wagmi"
import { defineChain } from "viem"
import { injected } from "wagmi/connectors"

export const storyAeneid = defineChain({
  id: 1315,
  name: "Story Aeneid Testnet",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://aeneid.storyrpc.io"] },
  },
  blockExplorers: {
    default: { name: "Story Explorer", url: "https://aeneid.storyscan.xyz" },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [storyAeneid],
  connectors: [injected()],
  multiInjectedProviderDiscovery: true,
  ssr: true,
  storage: createStorage({ storage: typeof window !== "undefined" ? window.localStorage : undefined }),
  transports: {
    [storyAeneid.id]: http(),
  },
})
