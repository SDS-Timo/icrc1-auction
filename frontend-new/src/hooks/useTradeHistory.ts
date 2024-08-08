import { HttpAgent } from '@dfinity/agent'

import { TokenDataItem, TokenMetadata } from '../types'
import { getActor } from '../utils/authUtils'
import {
  convertPriceFromCanister,
  convertVolumeFromCanister,
  getDecimals,
  addDecimal,
} from '../utils/calculationsUtils'
import { getToken } from '../utils/tokenUtils'

/**
 * Custom hook for fetching and managing transaction history.
 */
const useTransactionHistory = () => {
  /**
   * Fetches and returns the transaction history.
   *
   * @param userAgent - The HTTP agent to interact with the canister.
   * @param tokens - An array of token objects.
   * @param selectedQuote - The selected token metadata for the quote currency.
   * @returns A promise that resolves to an array of TokenDataItem objects representing the transaction history.
   */
  const getTransactionHistory = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
    selectedQuote: TokenMetadata,
  ): Promise<TokenDataItem[]> => {
    try {
      if (!tokens || tokens.length === 0) return []

      const serviceActor = getActor(userAgent)
      const transactions = await serviceActor.queryTransactionHistory(
        [],
        BigInt(10000),
        BigInt(0),
      )
      const formattedData: TokenDataItem[] = (transactions ?? []).map(
        (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          [ts, _sessionNumber, kind, principal, volume, price],
          index,
        ) => {
          const date = new Date(Number(ts) / 1_000_000)
          const optionsDateTime: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          }
          const formattedDateTime = date.toLocaleDateString(
            'en-US',
            optionsDateTime,
          )
          const optionsTime: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }
          const formattedTime = date.toLocaleTimeString('en-US', optionsTime)

          const token = getToken(tokens, principal)

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
            id: BigInt(index),
            datetime: formattedDateTime,
            time: formattedTime,
            price: formattedPrice,
            type: 'ask' in kind ? 'buy' : 'sell',
            volume: volumeInQuote,
            volumeInQuote,
            volumeInBase,
            ...token,
          }
        },
      )

      const data = addDecimal(formattedData)

      return data
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

  return { getTransactionHistory }
}

export default useTransactionHistory
