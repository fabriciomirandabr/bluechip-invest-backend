import { Injectable } from '@nestjs/common'
import axios from 'axios'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { chainConfig, globalConfig } from '../config'
import {
  ActiveListingByTargetQueryData,
  ActiveListingByTargetQueryVars,
  ACTIVE_LISTING_BY_TARGET_QUERY
} from './graphql/ActiveListingByTargetQuery'
import { ListingByIdQueryData, ListingByIdQueryVars, LISTING_BY_ID_QUERY } from './graphql/ListingByIdQuery'
import { Investment } from './models/investment'
import { Listing } from './models/listing'
import { SubgraphClientProvider } from './providers/subgraph-client.provider'
import { ReservoirAskOrder, ReservoirCollection, ReservoirToken } from './types/reservoir'

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

    const obtainAvailableItem = async () => {
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

      return foundItem
    }

    const getLastRounds = async (): Promise<Listing[]> => {
      // Change implementation in case the IPFS initialization don't work
      try {
        const { data } = await axios.get(
          `https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"chainId":{"value":${chainId},"op":"eq"},"collection":{"value":"${buyableItem.contract.toLowerCase()}","op":"eq"}}`,
          {
            headers: {
              Authorization: `Bearer ${globalConfig.pinataKey}`
            }
          }
        )

        const listingsPromises = data.rows
          .filter(row => row.date_unpinned === null)
          .map(async row => {
            const { data, error } = await this.subgraph.connect(chainId).query<ListingByIdQueryData, ListingByIdQueryVars>({
              query: LISTING_BY_ID_QUERY,
              variables: {
                listingId: `${row.metadata.keyvalues.listingId}`
              }
            })

            const { data: dataMetadata } = await axios.get<string, { data: { image: string } }>(data.listing.target.tokenURI)
            const { image } = dataMetadata

            return { ...data.listing, image }
          })

        return await Promise.all(listingsPromises)
      } catch (error) {
        console.log(error)
        return []
      }
    }

    const getActiveRound = async (contractAddress: string, tokenId: string): Promise<Listing | undefined> => {
      const obtainListing = async (): Promise<Listing | undefined> => {
        const { data, error } = await this.subgraph.connect(chainId).query<ActiveListingByTargetQueryData, ActiveListingByTargetQueryVars>({
          query: ACTIVE_LISTING_BY_TARGET_QUERY,
          variables: {
            contractAndTokenId: `${contractAddress.toLowerCase()}#${tokenId}`
          }
        })

        if (error) {
          throw error
        }

        if (!data || !data.listings || data.listings.length === 0) {
          return undefined
        }

        const { data: dataMetadata } = await axios.get<string, { data: { image: string } }>(data.listings[0].target.tokenURI)
        const { image } = dataMetadata

        return { ...data.listings[0], image }
      }

      const obtainAcquiringData = async (contractAddress: string, tokenId: string): Promise<string | undefined> => {
        const { data } = await axios.get<{
          orders: ReservoirAskOrder[]
        }>(`${config.reservoirUrl}/orders/asks/v2`, {
          params: {
            token: `${contractAddress.toLowerCase()}:${tokenId}`
          }
        })

        const seaportOrders = data.orders.filter(order => order.kind.toLowerCase() === 'seaport')

        if (seaportOrders.length === 0) {
          return undefined
        }

        const foundOrder = seaportOrders[0]

        const web3 = new Web3()
        const abi: AbiItem = {
          type: 'function',
          inputs: [
            {
              type: 'tuple',
              name: 'parameters',
              components: [
                { type: 'address', name: 'considerationToken' },
                { type: 'uint256', name: 'considerationIdentifier' },
                { type: 'uint256', name: 'considerationAmount' },
                { type: 'address', name: 'offerer' },
                { type: 'address', name: 'zone' },
                { type: 'address', name: 'offerToken' },
                { type: 'uint256', name: 'offerIdentifier' },
                { type: 'uint256', name: 'offerAmount' },
                { type: 'uint8', name: 'basicOrderType' },
                { type: 'uint256', name: 'startTime' },
                { type: 'uint256', name: 'endTime' },
                { type: 'bytes32', name: 'zoneHash' },
                { type: 'uint256', name: 'salt' },
                { type: 'bytes32', name: 'offererConduitKey' },
                { type: 'bytes32', name: 'fulfillerConduitKey' },
                { type: 'uint256', name: 'totalOriginalAdditionalRecipients' },
                {
                  type: 'tuple[]',
                  name: 'additionalRecipients',
                  components: [
                    { type: 'uint256', name: 'amount' },
                    { type: 'address', name: 'recipient' }
                  ]
                },
                { type: 'bytes', name: 'signature' }
              ]
            }
          ],
          name: 'fulfillBasicOrder',
          stateMutability: 'payable',
          outputs: [{ type: 'bool', name: 'fulfilled' }]
        }

        const { rawData: parameters } = foundOrder
        const { consideration: considerationItem, offer: offerItem } = parameters

        const params: Param[] = [
          [
            considerationItem[0].token,
            BigInt(considerationItem[0].identifierOrCriteria),
            BigInt(considerationItem[0].startAmount),
            parameters.offerer,
            parameters.zone,
            offerItem[0].token,
            BigInt(offerItem[0].identifierOrCriteria),
            BigInt(offerItem[0].startAmount),
            parameters.orderType,
            BigInt(parameters.startTime),
            BigInt(parameters.endTime),
            parameters.zoneHash,
            BigInt(parameters.salt),
            parameters.conduitKey,
            parameters.conduitKey,
            parameters.consideration.length - 1,
            parameters.consideration.slice(1).map(({ startAmount, recipient }) => [BigInt(startAmount), recipient]),
            parameters.signature
          ]
        ]

        // Seaport contract address on Rinkeby
        const spender = '0x00000000006c3852cbef3e08e8df289169ede581'
        const target = '0x00000000006c3852cbef3e08e8df289169ede581'

        const _calldata = web3.eth.abi.encodeFunctionCall(abi, params as any) // type is incorrect on Web3
        return web3.eth.abi.encodeParameters(['address', 'address', 'bytes'], [spender, target, _calldata])
      }

      const round = await obtainListing()

      if (!round) {
        console.log(`No round found for ${buyableItem.contract}#${buyableItem.tokenId}`)
        return undefined
      }

      const acquiringData = await obtainAcquiringData(buyableItem.contract, buyableItem.tokenId)
      const roundWithAcquiringData = {
        ...round,
        acquiringData
      }

      return roundWithAcquiringData
    }

    if (!data.collections) {
      return undefined
    }

    const buyableItem = await obtainAvailableItem()

    if (!buyableItem) {
      console.log(`No available item found for ${collectionAddress}`)
      return undefined
    }

    const collection = data.collections[0]

    const activeRound = await getActiveRound(buyableItem.contract, buyableItem.tokenId)

    const lastRounds = await getLastRounds()

    return {
      contractAddress: collection.id,
      availableTokenId: buyableItem.tokenId,
      name: collection.name,
      description: collection.description,
      floorPrice: collection.floorAskPrice,
      floorSaleChangeToday: collection.floorSaleChange['1day'],
      image: collection.image,
      slug: collection.slug,
      volumeToday: collection.volume['1day'],
      whalesRankToday: collection.rank['1day'],
      activeRound,
      lastRounds
    }
  }

  async saveFinishedListing(listingId: string, chainId: number): Promise<void> {
    const { data, error } = await this.subgraph.connect(chainId).query<ListingByIdQueryData, ListingByIdQueryVars>({
      query: LISTING_BY_ID_QUERY,
      variables: {
        listingId
      }
    })

    if (error) {
      throw error
    }

    if (!data?.listing) {
      throw new Error(`Listing ${chainId}_${listingId} not found`)
    }

    await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataOptions: {
          cidVersion: 1
        },
        pinataMetadata: {
          name: `${chainId}.${data.listing.target.collection.id.toLowerCase()}.${data.listing.target.tokenId}.${data.listing.id}`,
          keyvalues: {
            chainId,
            collection: data.listing.target.collection.id.toLowerCase(),
            tokenId: data.listing.target.tokenId,
            listingId: data.listing.id
          }
        },
        pinataContent: JSON.stringify(data.listing)
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${globalConfig.pinataKey}`
        }
      }
    )

    const { data: pinnedMetadata } = await axios.get(
      `https://api.pinata.cloud/data/pinList?metadata[name]=${chainId}.${data.listing.target.collection.id.toLowerCase()}.${
        data.listing.target.tokenId
      }.${data.listing.id}`,
      {
        headers: {
          Authorization: `Bearer ${globalConfig.pinataKey}`
        }
      }
    )

    return pinnedMetadata
  }
}
