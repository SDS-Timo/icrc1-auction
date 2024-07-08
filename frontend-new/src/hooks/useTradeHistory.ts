import { HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { DataItem, Option, TokenMetadata } from '../types'
import { getActor } from '../utils/authUtils'
import {
  convertPrice,
  convertVolume,
  getDecimals,
  addDecimal,
} from '../utils/chartUtils'

const useTransactionHistory = () => {
  const getTransactionHistory = async (
    userAgent: HttpAgent,
    selectedSymbol: Option,
    selectedQuote: TokenMetadata,
  ): Promise<DataItem[]> => {
    try {
      const serviceActor = getActor(userAgent)

      const principal = Array.isArray(selectedSymbol)
        ? selectedSymbol[0]?.principal
        : selectedSymbol?.principal

      if (!principal) return []

      const transactions = await serviceActor.queryTransactionHistory(
        [Principal.fromText(principal)],
        BigInt(10000),
        BigInt(0),
      )

      const formattedData: DataItem[] = (transactions ?? [])
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(([ts, _sessionNumber, kind, _ledger, volume, price], index) => {
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
            id: index,
            datetime: formattedDateTime,
            time: formattedTime,
            price: formattedPrice,
            type: 'ask' in kind ? 'buy' : 'sell',
            volume: volumeInQuote,
            volumeInQuote,
            volumeInBase,
          }
        })

      const data = addDecimal(formattedData)
      data.reverse()

      return data
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

  return { getTransactionHistory }
}

export default useTransactionHistory
