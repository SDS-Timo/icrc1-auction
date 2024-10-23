import { Option as OptionBymax } from 'bymax-react-select'

export interface Language {
  [key: string]: string
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
  priceDigitsLimit: number
}
export interface DataItem {
  id?: bigint
  datetime: string
  date?: string
  time?: string
  price: number
  type?: string
  volume: number
  volumeInBase: number
  volumeInQuote: number
  volumeInAvailable?: number
  volumeInAvailableNat?: string
  volumeInLocked?: number
  volumeInLockedNat?: string
  volumeInTotal?: number
  volumeInTotalNat?: string
  priceDecimals?: number
  volumeDecimals?: number
  quoteDecimals?: number
  volumeInBaseDecimals?: number
  volumeInQuoteDecimals?: number
  priceDigitsLimit?: number
}
export interface TokenMetadata {
  symbol: string
  name: string
  decimals: number
  logo: string
  fee: string
  quote: string
  base: string
  principal?: string
}
export interface TokensState {
  tokens: TokenMetadata[] | []
  selectedSymbol: Option | Option[] | null
  selectedQuote: TokenMetadata
}
export interface PricesHistoryState {
  isRefreshPrices: boolean
  pricesHistory: DataItem[] | []
  headerInformation: HeaderInformation | null
}
export interface TokenDataItem extends DataItem, TokenMetadata {
  [key: string]: any
}
export interface TokenDataItemState {
  isRefreshUserData: boolean
  orderSettings: SettingsState
  openOrders: TokenDataItem[] | []
}
export interface BalancesState {
  balances: TokenDataItem[] | []
}
export interface SettingsState {
  orderQuoteVolumeMinimum: number
  orderQuoteVolumeMinimumNat: string
  orderPriceDigitsLimit: number
  orderPriceDigitsLimitNat: string
  orderQuoteVolumeStep: number
  orderQuoteVolumeStepNat: string
}
export interface Result {
  Ok?: any
  Err?: any
  [key: string]: any
}
export interface Order {
  volume: bigint
  price: number
  type: string
}
export interface Statistics {
  clearingPrice: number
  clearingVolume: number
  totalAskVolume: number
  totalBidVolume: number
}
export interface NextSession {
  nextSession: string
  datetime: number
  counter: string
}
