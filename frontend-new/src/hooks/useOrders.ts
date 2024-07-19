import { HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { TokenDataItem, TokenMetadata, Option } from '../types'
import { getActor } from '../utils/authUtils'
import {
  convertPrice,
  convertVolume,
  getDecimals,
  addDecimal,
} from '../utils/calculationsUtils'
import { getTokenInfo } from '../utils/tokenUtils'

const useOrders = () => {
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

  interface Order {
    volume: number
    price: number
    type: string
  }

  const placeOrders = async (
    userAgent: HttpAgent,
    selectedSymbol: Option | null,
    order: Order,
  ) => {
    try {
      const serviceActor = getActor(userAgent)

      const principal = Array.isArray(selectedSymbol)
        ? selectedSymbol[0]?.principal
        : selectedSymbol?.principal

      let result

      if (order.type === 'sell') {
        result = await serviceActor.placeBids([
          [
            Principal.fromText(principal),
            BigInt(order.volume),
            Number(order.price),
          ],
        ])
      } else {
        result = await serviceActor.placeAsks([
          [
            Principal.fromText(principal),
            BigInt(order.volume),
            Number(order.price),
          ],
        ])
      }

      return result
    } catch (error) {
      console.error('Error place order:', error)
      return []
    }
  }

  return { getOpenOrders, placeOrders }
}

export default useOrders
