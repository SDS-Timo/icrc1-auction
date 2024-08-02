import { Option as OptionBymax } from 'bymax-react-select'

import {
  CancelOrderError,
  PlaceOrderError,
} from '../../../declarations/icrc1_auction/icrc1_auction.did'

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
}
export interface DataItem {
  id?: bigint
  datetime: string
  time?: string
  price: number
  type?: string
  volume: number
  volumeInBase: number
  volumeInQuote: number
  priceDecimals?: number
  volumeDecimals?: number
  volumeInBaseDecimals?: number
  volumeInQuoteDecimals?: number
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
  pricesHistory: DataItem[] | []
  headerInformation: HeaderInformation | null
}
export interface TokenDataItem extends DataItem, TokenMetadata {
  action?: boolean
  [key: string]: any
}
export interface TokenDataItemState {
  isRefreshOpenOrders: boolean
  openOrders: TokenDataItem[] | []
}
export interface BalancesState {
  balances: TokenDataItem[] | []
}
export interface CancelOrder {
  Ok?: any
  Err?: CancelOrderError
  [key: string]: any
}
export interface PlaceOrder {
  Ok?: any
  Err?: PlaceOrderError
  [key: string]: any
}
export interface NotifyResult {
  Ok?: any
  Err?: any
  [key: string]: any
}
export interface Order {
  volume: bigint
  price: number
  type: string
}
export interface TrackedDeposit {
  Ok?: bigint
  Err?: { NotAvailable: { message: string } }
}
