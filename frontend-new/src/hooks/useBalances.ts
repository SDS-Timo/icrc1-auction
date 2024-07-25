import { HttpAgent } from '@dfinity/agent'

import { TokenDataItem } from '../types'
import { getActor } from '../utils/authUtils'
import {
  convertVolumeFromCanister,
  getDecimals,
  addDecimal,
} from '../utils/calculationsUtils'
import { getTokenInfo } from '../utils/tokenUtils'

/**
 * Custom hook for fetching and managing user balances.
 */
const useBalances = () => {
  /**
   * Fetches and processes balances for the user.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @returns A promise that resolves to an array of TokenDataItem objects containing the user's token balances.
   */
  const getBalances = async (
    userAgent: HttpAgent,
  ): Promise<TokenDataItem[]> => {
    try {
      const serviceActor = getActor(userAgent)

      const balancesRaw = await serviceActor.icrc84_all_credits()

      const balances: TokenDataItem[] = await Promise.all(
        (balancesRaw ?? []).map(async ([principal, volume], index) => {
          const { token, logo } = await getTokenInfo(userAgent, principal)

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
            logo,
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

  return { getBalances }
}

export default useBalances
