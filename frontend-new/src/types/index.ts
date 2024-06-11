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
