import { Actor } from '@dfinity/agent'
import { HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import {
  _SERVICE as IcrcxActor,
  PriceHistoryItem,
} from '../../../declarations/icrc1_auction/icrc1_auction.did'
import { idlFactory as IcrcxIDLFactory } from '../../../declarations/icrc1_auction/icrc1_auction.did.js'

const usePriceHistory = () => {
  const getPriceHistory = async (
    userAgent: HttpAgent,
    token: string,
  ): Promise<PriceHistoryItem[]> => {
    try {
      const serviceActor = Actor.createActor<IcrcxActor>(IcrcxIDLFactory, {
        agent: userAgent,
        canisterId: `${process.env.CANISTER_ID_ICRC1_AUCTION}`,
      })

      const prices = await serviceActor.queryPriceHistory(
        [Principal.fromText(token)],
        BigInt(10000),
        BigInt(0),
      )

      return prices
    } catch (error) {
      console.error('Error fetching prices:', error)
      return []
    }
  }

  return { getPriceHistory }
}

export default usePriceHistory
