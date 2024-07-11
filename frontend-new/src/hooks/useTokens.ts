import { HttpAgent } from '@dfinity/agent'

import { TokenMetadata } from '../types'
import { getActor } from '../utils/authUtils'
import { getTokenInfo } from '../utils/tokenUtils'

const useTokens = () => {
  const getTokens = async (userAgent: HttpAgent): Promise<TokenMetadata[]> => {
    try {
      const serviceActor = getActor(userAgent)

      const principals = await serviceActor.icrc84_supported_tokens()
      const tokens = await Promise.all(
        principals.map(async (principal) => {
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

  return { getTokens }
}

export default useTokens
