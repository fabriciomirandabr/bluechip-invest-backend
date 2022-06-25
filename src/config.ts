import * as dotenv from 'dotenv'
dotenv.config()

interface ChainConfig {
  chainId: number
  name: string
  subgraphUrl: string
  reservoirUrl: string
}

const chains: ChainConfig[] = [
  {
    chainId: 1,
    name: 'mainnet',
    subgraphUrl: process.env.SUBGRAPH_INVESTMENTS,
    reservoirUrl: process.env.RESERVOIR_API
  },
  {
    chainId: 4,
    name: 'rinkeby',
    subgraphUrl: process.env.SUBGRAPH_INVESTMENTS_TESTNET,
    reservoirUrl: process.env.RESERVOIR_API_TESTNET
  }
]

export const chainConfig = (chainId: number): ChainConfig => {
  const chain = chains.find(c => c.chainId === chainId)

  if (!chain) {
    throw new Error(`Chain ${chainId} not found`)
  }

  return chain
}
