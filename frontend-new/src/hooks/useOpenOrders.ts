import { HttpAgent } from '@dfinity/agent'

import { Option, TokenMetadata } from '../types'
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
    selectedSymbol: Option,
    selectedQuote: TokenMetadata,
  ): Promise<any> => {
    try {
      const serviceActor = getActor(userAgent)

      const bids = await serviceActor.queryBids()
      const asks = await serviceActor.queryAsks()

      const buy = await Promise.all(
        asks.map(async (ask) => {
          const { token, logo } = await getTokenInfo(
            userAgent,
            ask[1].icrc1Ledger,
          )

          const formattedPrice = convertPrice(
            Number(ask[1].price),
            getDecimals(selectedSymbol),
            getDecimals(selectedQuote),
          )

          const { volumeInQuote, volumeInBase } = convertVolume(
            Number(ask[1].volume),
            getDecimals(selectedSymbol),
            formattedPrice,
          )

          return {
            ...token,
            logo,
            price: formattedPrice,
            volume: volumeInQuote,
            volumeInQuote,
            volumeInBase,
          }
        }),
      )

      const data = addDecimal(buy)

      return { bids, asks, data }
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  return { getOpenOrders }
}

export default useOpenOrders
