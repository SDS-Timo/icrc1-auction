import { Option as OptionBymax } from 'bymax-react-select'

export interface Language {
  [key: string]: string
}
export interface Order {
  id: string
  side: 'buy' | 'sell'
  amount: number
  price: number
}
export interface TokenMetadata {
  symbol: string
  name: string
  decimals: number
  logo: string
  fee: string
  principal?: string
}
export interface Option extends OptionBymax {
  decimals?: number
  principal?: string
  lastAuction?: number
  previousChange?: number
  periodVolume?: number
}
export interface HeaderInformation {
  lastAuction: number | string
  previousChange: {
    amount: number | string
    percentage: number | string
  }
  periodVolume: number | string
}
export interface TokensState {
  selectedSymbol: Option | Option[] | null
  selectedQuote: TokenMetadata
}
export interface PricesHistoryState {
  pricesHistory: DataItem[] | []
  headerInformation: HeaderInformation | null
}
export interface DataItem {
  id?: number
  datetime: string
  time?: string
  price: number
  type?: 'buy' | 'sell'
  volume: number
  volumeInBase: number
  volumeInQuote: number
  priceDecimals?: number
  volumeDecimals?: number
  volumeInBaseDecimals?: number
  volumeInQuoteDecimals?: number
}
