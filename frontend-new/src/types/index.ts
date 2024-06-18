import { Option } from 'bymax-react-select'
export interface Language {
  [key: string]: string
}
export interface Order {
  id: string
  side: 'buy' | 'sell'
  amount: number
  price: number
}
export interface Trade {
  id: string
  price: number
  amount: number
  time: string
  type: 'buy' | 'sell'
}
export interface TokenMetadata {
  symbol: string
  name: string
  decimals: number
  logo: string
  fee: string
}
export interface TokensState {
  tokens: TokenMetadata[]
  loading: boolean
  error: string | null
  selectedSymbol: Option | Option[] | null
}
