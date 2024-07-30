import { HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { TokenDataItem, TokenMetadata } from '../types'
import { getActor } from '../utils/authUtils'
import {
  convertVolumeFromCanister,
  getDecimals,
  addDecimal,
} from '../utils/calculationsUtils'
import { getToken } from '../utils/tokenUtils'

/**
 * Custom hook for fetching and managing user wallet.
 */
const useWallet = () => {
  /**
   * Fetches and processes balances for the user.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param tokens - An array of token objects.
   * @returns A promise that resolves to an array of TokenDataItem objects containing the user's token balances.
   */
  const getBalances = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
  ): Promise<TokenDataItem[]> => {
    try {
      if (!tokens || tokens.length === 0) return []

      const serviceActor = getActor(userAgent)

      const balancesRaw = await serviceActor.icrc84_all_credits()

      const balances: TokenDataItem[] = await Promise.all(
        (balancesRaw ?? []).map(async ([principal, volume], index) => {
          const token = getToken(tokens, principal)

          const { volumeInBase } = convertVolumeFromCanister(
            Number(volume),
            getDecimals(token),
            0,
          )

          return {
            id: BigInt(index),
            datetime: '',
            price: 0,
            volume: 0,
            volumeInQuote: 0,
            volumeInBase,
            ...token,
          }
        }),
      )

      const data = addDecimal(balances)

      return data
    } catch (error) {
      console.error('Error fetching balances:', error)
      return []
    }
  }

  /**
   * Notifies the service actor to update the balance information for a specific token.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param principal - The principal identifier of the token.
   * @returns A promise that resolves to the result of the notification operation.
   */
  const balanceNotify = async (
    userAgent: HttpAgent,
    principal: string | undefined,
  ) => {
    try {
      if (!principal) return []

      const serviceActor = getActor(userAgent)
      const result = await serviceActor.icrc84_notify({
        token: Principal.fromText(principal),
      })

      return result
    } catch (error) {
      console.error('Error balance notify:', error)
      return []
    }
  }

  return { getBalances, balanceNotify }
}

export default useWallet
