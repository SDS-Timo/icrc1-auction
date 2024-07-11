import { HttpAgent } from '@dfinity/agent'
import {
  IcrcTokenMetadataResponse,
  IcrcMetadataResponseEntries,
  IcrcLedgerCanister,
} from '@dfinity/ledger-icrc'
import { Principal } from '@dfinity/principal'

import defSymbolLogo from '../assets/img/coins/default.svg'
import { TokenMetadata } from '../types'

const parseMetadata = (metadata: IcrcTokenMetadataResponse): TokenMetadata => {
  let symbol = 'unknown'
  let name = 'unknown'
  let decimals = 0
  let logo = ''
  let fee = ''

  metadata.forEach((entry) => {
    switch (entry[0]) {
      case IcrcMetadataResponseEntries.SYMBOL:
        symbol = (entry[1] as { Text: string }).Text
        break
      case IcrcMetadataResponseEntries.NAME:
        name = (entry[1] as { Text: string }).Text
        break
      case IcrcMetadataResponseEntries.DECIMALS:
        decimals = Number((entry[1] as unknown as { Nat: string }).Nat)
        break
      case IcrcMetadataResponseEntries.LOGO:
        logo = (entry[1] as { Text: string }).Text
        break
      case IcrcMetadataResponseEntries.FEE:
        fee = (entry[1] as unknown as { Nat: string }).Nat.toString()
        break
    }
  })

  if (symbol.includes('ck') || name.includes('ck')) {
    symbol = symbol.replace('ck', '')
    name = name.replace('ck', '')
  }

  return { symbol, name, decimals, logo, fee, base: symbol, quote: 'USDC' }
}

const findLogo = async (token: TokenMetadata): Promise<string> => {
  let logo =
    token.logo ||
    new URL(
      `../assets/img/coins/${token.symbol.toLowerCase()}.svg`,
      import.meta.url,
    ).href

  if (!token.logo) {
    try {
      const response = await fetch(logo)
      const blob = await response.blob()
      if (blob.size === 0 || !blob.type.startsWith('image')) {
        throw new Error('Image not found or not an image')
      }
    } catch (error) {
      logo = defSymbolLogo
    }
  }

  return logo
}

export async function getTokenInfo(
  userAgent: HttpAgent,
  canisterId: Principal,
) {
  const { metadata } = IcrcLedgerCanister.create({
    agent: userAgent,
    canisterId: canisterId,
  })

  const principalData = await metadata({ certified: false })
  const token = parseMetadata(principalData)
  const logo = await findLogo(token)

  return { token, logo }
}
