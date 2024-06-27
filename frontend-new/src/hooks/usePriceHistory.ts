import { Actor } from '@dfinity/agent'
import { HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { _SERVICE as IcrcxActor } from '../../../declarations/icrc1_auction/icrc1_auction.did'
import { idlFactory as IcrcxIDLFactory } from '../../../declarations/icrc1_auction/icrc1_auction.did.js'
import { DataItem, Option, TokenMetadata } from '../types'
import { convertPrice, convertVolume, getDecimals } from '../utils/chartUtils'

const usePriceHistory = () => {
  const getPriceHistory = async (
    userAgent: HttpAgent,
    selectedSymbol: Option,
    selectedQuote: TokenMetadata,
  ): Promise<DataItem[]> => {
    try {
      const serviceActor = Actor.createActor<IcrcxActor>(IcrcxIDLFactory, {
        agent: userAgent,
        canisterId: `${process.env.CANISTER_ID_ICRC1_AUCTION}`,
      })

      const principal = Array.isArray(selectedSymbol)
        ? selectedSymbol[0]?.principal
        : selectedSymbol?.principal

      if (!principal) return []

      const prices = await serviceActor.queryPriceHistory(
        [Principal.fromText(principal)],
        BigInt(10000),
        BigInt(0),
      )

      const formattedData: DataItem[] = (prices ?? [])
        .filter(
          ([ts, sessionNumber, ledger, volume, price]) => Number(price) !== 0,
        )
        .map(([ts, sessionNumber, ledger, volume, price]) => {
          const date = new Date(Number(ts) / 1_000_000)
          const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
          }
          const formattedDate = date.toLocaleDateString('en-GB', options)

          const formattedPrice = convertPrice(
            Number(price),
            getDecimals(selectedSymbol),
            getDecimals(selectedQuote),
          )

          const { volumeInQuote, volumeInBase } = convertVolume(
            Number(volume),
            getDecimals(selectedSymbol),
            formattedPrice,
          )

          return {
            label: formattedDate,
            price: formattedPrice,
            volume: volumeInQuote,
            volumeInQuote,
            volumeInBase,
          }
        })

      return formattedData
    } catch (error) {
      console.error('Error fetching prices:', error)
      return []
    }
  }

  return { getPriceHistory }
}

export default usePriceHistory
