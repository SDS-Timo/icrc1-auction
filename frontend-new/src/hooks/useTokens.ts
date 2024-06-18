import { Actor } from '@dfinity/agent'
import { HttpAgent } from '@dfinity/agent'
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc'

import { _SERVICE as IcrcxActor } from '../../../declarations/icrc1_auction/icrc1_auction.did'
import { idlFactory as IcrcxIDLFactory } from '../../../declarations/icrc1_auction/icrc1_auction.did.js'
import { TokenMetadata } from '../types'
import { parseMetadata, findLogo } from '../utils/tokenUtils'

const useTokens = () => {
  const getTokens = async (userAgent: HttpAgent): Promise<TokenMetadata[]> => {
    try {
      const serviceActor = Actor.createActor<IcrcxActor>(IcrcxIDLFactory, {
        agent: userAgent,
        canisterId: `${process.env.CANISTER_ID_ICRC1_AUCTION}`,
      })

      const principals = await serviceActor.icrcX_supported_tokens()
      const tokens = await Promise.all(
        principals.map(async (principal) => {
          const { metadata } = IcrcLedgerCanister.create({
            agent: userAgent,
            canisterId: principal,
          })
          const principalData = await metadata({ certified: true })
          const token = parseMetadata(principalData)

          if (token.symbol.includes('ck') || token.name.includes('ck')) {
            token.symbol = token.symbol.replace('ck', '')
            token.name = token.name.replace('ck', '')
          }

          const logo = await findLogo(token)
          return { ...token, logo }
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
