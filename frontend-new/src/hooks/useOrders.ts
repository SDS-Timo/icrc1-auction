import { HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { TokenDataItem, TokenMetadata, Option, Order } from '../types'
import { getActor } from '../utils/authUtils'
import {
  convertPriceFromCanister,
  convertVolumeFromCanister,
  getDecimals,
  addDecimal,
} from '../utils/calculationsUtils'
import { getToken } from '../utils/tokenUtils'

/**
 * Custom hook for managing orders.
 */
const useOrders = () => {
  /**
   * Fetches and returns the open orders.
   *
   * @param userAgent - The HTTP agent to interact with the canister.
   * @param tokens - An array of token objects.
   * @param selectedQuote - The selected token metadata for the quote currency.
   * @returns A promise that resolves to an array of open TokenDataItem orders.
   */
  const getOpenOrders = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
    selectedQuote: TokenMetadata,
  ): Promise<TokenDataItem[]> => {
    try {
      if (!tokens || tokens.length === 0) return []

      const serviceActor = getActor(userAgent)

      const bidsRaw = await serviceActor.queryBids()
      const asksRaw = await serviceActor.queryAsks()

      const openOrdersRaw = [
        ...bidsRaw.map(([id, bid]) => ({ ...bid, id, type: 'buy' })),
        ...asksRaw.map(([id, ask]) => ({ ...ask, id, type: 'sell' })),
      ]

      const openOrders: TokenDataItem[] = (openOrdersRaw ?? []).map((order) => {
        const { id, icrc1Ledger, price, volume, type } = order

        const token = getToken(tokens, icrc1Ledger)

        const formattedPrice = convertPriceFromCanister(
          Number(price),
          getDecimals(token),
          getDecimals(selectedQuote),
        )

        const { volumeInQuote, volumeInBase } = convertVolumeFromCanister(
          Number(volume),
          getDecimals(token),
          formattedPrice,
        )

        return {
          id,
          datetime: '',
          price: formattedPrice,
          type,
          volume: volumeInQuote,
          volumeInQuote,
          volumeInBase,
          ...token,
        }
      })

      const data = addDecimal(openOrders)

      return data
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  /**
   * Fetches and returns the minimum order size.
   *
   * @param userAgent - The HTTP agent to interact with the canister.
   * @param selectedQuote - The selected token metadata for the quote currency.
   * @returns A promise that resolves to a minimum order size.
   */
  const getMinimumOrderSize = async (
    userAgent: HttpAgent,
    selectedQuote: TokenMetadata,
  ): Promise<number> => {
    try {
      const serviceActor = getActor(userAgent)

      const minimumOrderSize = await serviceActor.minimumOrder()

      const { volumeInBase } = convertVolumeFromCanister(
        Number(minimumOrderSize),
        getDecimals(selectedQuote),
        0,
      )

      return volumeInBase
    } catch (error) {
      console.error('Error fetching orders:', error)
      return 0
    }
  }

  /**
   * Places an order on the canister.
   *
   * @param userAgent - The HTTP agent to interact with the canister.
   * @param selectedSymbol - The selected token option, which may include the principal.
   * @param order - The order details including volume, price, and type.
   * @returns A promise that resolves to the result of the order placement.
   */
  const placeOrder = async (
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

      if (order.type === 'buy') {
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

  /**
   * Cancels an order based on its type and ID.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param id - The ID of the order to be cancelled. Must be a bigint.
   * @param type - The type of the order to be cancelled, either 'buy' or 'sell'.
   * @returns A promise that resolves to the result of the cancellation operation.
   * @throws An error if the order ID or type is not provided.
   */
  const cancelOrder = async (
    userAgent: HttpAgent,
    id: bigint | undefined,
    type: string | undefined,
  ) => {
    try {
      const serviceActor = getActor(userAgent)

      if (id === undefined) {
        throw new Error('Order ID is required')
      }
      if (type === undefined) {
        throw new Error('Type is required')
      }

      let result

      if (type === 'buy') {
        result = await serviceActor.cancelBids([id])
      } else {
        result = await serviceActor.cancelAsks([id])
      }

      return result
    } catch (error) {
      console.error('Error cancel order:', error)
      return []
    }
  }

  return { getOpenOrders, getMinimumOrderSize, placeOrder, cancelOrder }
}

export default useOrders
