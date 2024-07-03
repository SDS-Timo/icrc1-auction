import { HttpAgent } from '@dfinity/agent'
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc'

import { TokenMetadata } from '../types'
import { getActor } from '../utils/authUtils'
import { parseMetadata, findLogo } from '../utils/tokenUtils'

const useTokens = () => {
  const getTokens = async (userAgent: HttpAgent): Promise<TokenMetadata[]> => {
    try {
      const serviceActor = getActor(userAgent)

      const principals = await serviceActor.icrc84_supported_tokens()
      const tokens = await Promise.all(
        principals.map(async (principal) => {
          const { metadata } = IcrcLedgerCanister.create({
            agent: userAgent,
            canisterId: principal,
          })

          const principalData = await metadata({ certified: false })
          const token = parseMetadata(principalData)
          const logo = await findLogo(token)

          return { ...token, logo, principal: principal.toText() }
        }),
      )

      return tokens
    } catch (error) {
      console.error('Error fetching tokens:', error)
      return []
    }
  }

  return { getTokens }
}

export default useTokens
