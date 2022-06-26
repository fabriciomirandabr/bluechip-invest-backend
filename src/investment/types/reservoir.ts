export interface ReservoirCollection {
  id: string
  slug: string
  name: string
  image?: string
  sampleImages?: string[]
  description?: string
  floorAskPrice: number
  rank: {
    '1day': number
  }
  volume: {
    '1day': number
  }
  volumeChange: {
    '1day': number
  }
  floorSaleChange: {
    '1day': number
  }
}

export interface ReservoirToken {
  contract: string
  tokenId: string
  source: string
  image?: string
  price: number
}

export interface OpenseaConsideration {
  token: string
  itemType: number
  endAmount: string
  startAmount: string
  recipient: string
  identifierOrCriteria: string
}
export interface OpenseaOffer {
  token: string
  itemType: number
  endAmount: string
  startAmount: string
  identifierOrCriteria: string
}

export interface OpenseaListing {
  offerer: string
  zone: string
  signature: string
  conduitKey: string
  zoneHash: string
  orderType: number
  startTime: number
  endTime: number
  salt: string
  consideration: OpenseaConsideration[]
  offer: OpenseaOffer[]
}

export interface ReservoirAskOrder {
  kind: string
  rawData: OpenseaListing
}
