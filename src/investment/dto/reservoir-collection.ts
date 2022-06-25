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
