import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client/core'
import { Injectable } from '@nestjs/common'
import fetch from 'cross-fetch'
import { chainConfig } from '../../config'

@Injectable()
export class SubgraphClientProvider {
  connect(chainId: number): ApolloClient<NormalizedCacheObject> {
    const cache = new InMemoryCache()
    const config = chainConfig(chainId)

    return new ApolloClient({
      uri: config.subgraphUrl,
      cache,
      link: new HttpLink({
        uri: config.subgraphUrl,
        fetch
      })
    })
  }
}
