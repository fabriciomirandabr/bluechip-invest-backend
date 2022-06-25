import { gql } from 'apollo-server-express'
import { Listing } from '../models/listing'

export interface ActiveListingByTargetQueryVars {
  contractAndTokenId: string
}

export interface ActiveListingByTargetQueryData {
  listings: Listing[]
}

export const ACTIVE_LISTING_BY_TARGET_QUERY = gql`
  query ActiveListingByTarget($contractAndTokenId: String!) {
    listings(where: { status_not: "ENDED", target_contains: $contractAndTokenId }) {
      id
      amount
      sellerNetAmount
      sellerFeeAmount
      fee
      reservePrice
      timestamp
      buyersCount
      fractions
      fractionsCount
      target {
        id
        tokenId
        tokenURI
        collection {
          id
          name
          symbol
        }
      }
      buyers {
        buyer
        amount
        ownership
        fractionsCount
      }
    }
  }
`
