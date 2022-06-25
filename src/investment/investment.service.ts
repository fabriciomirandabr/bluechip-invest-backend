import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { chainConfig } from '../config'
import { ReservoirCollection } from './dto/reservoir-collection'
import { ReservoirToken } from './dto/reservoir-token'
import {
  ActiveListingByTargetQueryData,
  ActiveListingByTargetQueryVars,
  ACTIVE_LISTING_BY_TARGET_QUERY
} from './graphql/ActiveListingByTargetQuery'
import { Investment } from './models/investment'
import { Listing } from './models/listing'
import { SubgraphClientProvider } from './providers/subgraph-client.provider'

@Injectable()
export class InvestmentService {
  constructor(private subgraph: SubgraphClientProvider) {}

  async getInvestment(collectionAddress: string, chainId: number): Promise<Investment | undefined> {
    const config = chainConfig(chainId)

    const { data } = await axios.get<{
      collections: ReservoirCollection[]
    }>(`${config.reservoirUrl}/collections/v4`, {
      params: {
        contract: collectionAddress
      }
    })

    const getAvailableListing = async (): Promise<Listing | undefined> => {
      const { data: tokensData } = await axios.get<{
        tokens: ReservoirToken[]
      }>(`${config.reservoirUrl}/tokens/bootstrap/v1`, {
        params: {
          contract: collectionAddress
        }
      })

      // Search only on the found items from OpenSea
      const openseaTokens = tokensData.tokens.filter(token => token.source === 'OpenSea')

      if (openseaTokens.length === 0) {
        return undefined
      }

      // Gets only the first one if there aren't more than one item in the array
      const foundItem = openseaTokens.length === 1 ? openseaTokens[0] : openseaTokens.splice(0, 1)[0]

      const { data, error } = await this.subgraph.connect(chainId).query<ActiveListingByTargetQueryData, ActiveListingByTargetQueryVars>({
        query: ACTIVE_LISTING_BY_TARGET_QUERY,
        variables: {
          contractAndTokenId: `${foundItem.contract.toLowerCase()}#${foundItem.tokenId}`
        }
      })

      if (error) {
        throw error
      }

      if (!data || !data.listings || data.listings.length === 0) {
        return undefined
      }

      return data.listings[0]
    }

    if (!data.collections) {
      return undefined
    }

    const collection = data.collections[0]

    const activeRound = await getAvailableListing()

    return {
      contractAddress: collection.id,
      name: collection.name,
      description: collection.description,
      floorPrice: collection.floorAskPrice,
      floorSaleChangeToday: collection.floorSaleChange['1day'],
      image: collection.image,
      slug: collection.slug,
      volumeToday: collection.volume['1day'],
      whalesRankToday: collection.rank['1day'],
      activeRound
    }
  }
}
