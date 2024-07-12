import { HttpAgent } from '@dfinity/agent'

import { TokenDataItem, TokenMetadata } from '../types'
import { getActor } from '../utils/authUtils'
import {
  convertPrice,
  convertVolume,
  getDecimals,
  addDecimal,
} from '../utils/calculationsUtils'
import { getTokenInfo } from '../utils/tokenUtils'

const useOpenOrders = () => {
  const getOpenOrders = async (
    userAgent: HttpAgent,
    selectedQuote: TokenMetadata,
  ): Promise<TokenDataItem[]> => {
    try {
      const serviceActor = getActor(userAgent)

      const bidsRaw = await serviceActor.queryBids()
      const asksRaw = await serviceActor.queryAsks()

      const openOrdersRaw = [
        ...bidsRaw.map(([, bid]) => ({ ...bid, type: 'sell' })),
        ...asksRaw.map(([, ask]) => ({ ...ask, type: 'buy' })),
      ]

      const openOrders: TokenDataItem[] = await Promise.all(
        openOrdersRaw.map(async (order, index) => {
          const { icrc1Ledger, price, volume, type } = order

          const { token, logo } = await getTokenInfo(userAgent, icrc1Ledger)

          const formattedPrice = convertPrice(
            Number(price),
            getDecimals(token),
            getDecimals(selectedQuote),
          )

          const { volumeInQuote, volumeInBase } = convertVolume(
            Number(volume),
            getDecimals(token),
            formattedPrice,
          )

          return {
            id: index,
            datetime: '',
            price: formattedPrice,
            type,
            volume: volumeInQuote,
            volumeInQuote,
            volumeInBase,
            ...token,
            logo,
          }
        }),
      )

      const data = addDecimal(openOrders)

      return data
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  return { getOpenOrders }
}

export default useOpenOrders
