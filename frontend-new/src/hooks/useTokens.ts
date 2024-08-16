import { HttpAgent } from '@dfinity/agent'

import { TokenMetadata } from '../types'
import { getActor } from '../utils/authUtils'
import { getTokenInfo, getToken } from '../utils/tokenUtils'

/**
 * Custom hook for fetching and managing tokens.
 */
const useTokens = () => {
  /**
   * Fetches and returns the supported tokens.
   *
   * @param userAgent - The HTTP agent to interact with the canister.
   * @returns A promise that resolves to an array of TokenMetadata objects representing the supported tokens.
   */
  const getTokens = async (userAgent: HttpAgent): Promise<TokenMetadata[]> => {
    try {
      const serviceActor = getActor(userAgent)

      const principals = await serviceActor.icrc84_supported_tokens()
      const tokens = await Promise.all(
        (principals ?? []).map(async (principal) => {
          const { token, logo } = await getTokenInfo(userAgent, principal)
          return { ...token, logo, principal: principal.toText() }
        }),
      )
      tokens.sort((a, b) => a.symbol.localeCompare(b.symbol))
      return tokens
    } catch (error) {
      console.error('Error fetching tokens:', error)
      return []
    }
  }

  /**
   * Fetches and returns the quote token.
   *
   * @param userAgent - The HTTP agent to interact with the canister.
   * @param tokens - An array of token objects.
   * @returns A promise that resolves to the quote token.
   */
  const getQuoteToken = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
  ): Promise<TokenMetadata | null> => {
    try {
      if (!tokens || tokens.length === 0) return null

      const serviceActor = getActor(userAgent)

      const principal = await serviceActor.getQuoteLedger()

      const token = getToken(tokens, principal)

      return token
    } catch (error) {
      console.error('Error fetching quote token:', error)
      return null
    }
  }

  return { getTokens, getQuoteToken }
}

export default useTokens
