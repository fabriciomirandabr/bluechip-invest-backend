import { gql } from 'apollo-server-express'
import { Listing } from '../models/listing'

export interface ListingByIdQueryVars {
  listingId: string
}

export interface ListingByIdQueryData {
  listing: Listing
}

export const LISTING_BY_ID_QUERY = gql`
  query ListingById($listingId: String!) {
    listing(id: $listingId) {
      id
      status
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
