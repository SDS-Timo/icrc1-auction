import { HttpAgent } from '@dfinity/agent'
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc'
import { Principal } from '@dfinity/principal'

import { TokenDataItem, TokenMetadata, TrackedDeposit } from '../types'
import { getActor } from '../utils/authUtils'
import {
  convertVolumeFromCanister,
  getDecimals,
  addDecimal,
} from '../utils/calculationsUtils'
import {
  hexToUint8Array,
  getSubAccountFromPrincipal,
} from '../utils/convertionsUtils'
import { getToken } from '../utils/tokenUtils'

/**
 * Custom hook for fetching and managing user wallet.
 */
const useWallet = () => {
  /**
   * Fetches and processes balances for the user.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param tokens - An array of token objects.
   * @returns A promise that resolves to an array of TokenDataItem objects containing the user's token balances.
   */
  const getBalances = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
  ): Promise<TokenDataItem[]> => {
    try {
      if (!tokens || tokens.length === 0) return []

      const serviceActor = getActor(userAgent)

      const balancesRaw = await serviceActor.icrc84_all_credits()

      const balances: TokenDataItem[] = await Promise.all(
        (balancesRaw ?? []).map(([principal, volume], index) => {
          const token = getToken(tokens, principal)

          const { volumeInBase } = convertVolumeFromCanister(
            Number(volume),
            getDecimals(token),
            0,
          )

          return {
            id: BigInt(index),
            datetime: '',
            price: 0,
            volume: 0,
            volumeInQuote: 0,
            volumeInBase,
            ...token,
          }
        }),
      )

      const data = addDecimal(balances)

      return data
    } catch (error) {
      console.error('Error fetching balances:', error)
      return []
    }
  }

  /**
   * Fetches the balance for a given owner and subaccount.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param tokens - An array of token objects.
   * @param owner - The principal ID of the owner as a string.
   * @param subaccount - The subaccount identifier as a hexadecimal string.
   * @returns The balance or an empty array in case of an error.
   */
  const getBalance = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
    owner: string,
    subaccount: string,
  ): Promise<number | []> => {
    try {
      if (!tokens || tokens.length === 0) return []

      const principal = Principal.fromText(owner)
      const hexSubAccountId =
        getSubAccountFromPrincipal(subaccount).subAccountId

      const { balance } = IcrcLedgerCanister.create({
        agent: userAgent,
        canisterId: principal,
      })

      const myBalance = await balance({
        owner: Principal.fromText(`${process.env.CANISTER_ID_ICRC_AUCTION}`),
        subaccount: new Uint8Array(hexToUint8Array(hexSubAccountId)),
        certified: false,
      })

      const token = getToken(tokens, principal)

      const { volumeInBase } = convertVolumeFromCanister(
        Number(myBalance),
        getDecimals(token),
        0,
      )

      return volumeInBase
    } catch (error) {
      console.error('Error fetching balance:', error)
      return []
    }
  }

  /**
   * Fetches the tracked deposit for a given principal.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param tokens - An array of token objects.
   * @param principal - The principal ID as a string.
   * @returns The tracked deposit data or an empty array in case of an error.
   */
  const getTrackedDeposit = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
    owner: string,
  ): Promise<number | TrackedDeposit> => {
    try {
      if (!tokens || tokens.length === 0) return 0

      const principal = Principal.fromText(owner)

      const serviceActor = getActor(userAgent)
      const deposit: TrackedDeposit =
        await serviceActor.icrc84_trackedDeposit(principal)

      if (deposit.Ok !== undefined) {
        const token = getToken(tokens, principal)

        const { volumeInBase } = convertVolumeFromCanister(
          Number(deposit.Ok),
          getDecimals(token),
          0,
        )

        return volumeInBase
      } else {
        return deposit
      }
    } catch (error) {
      console.error('Error fetching tracked deposit:', error)
      return {
        Err: { NotAvailable: { message: 'Error fetching tracked deposit' } },
      }
    }
  }

  /**
   * Notifies the service actor to update the balance information for a specific token.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param principal - The principal identifier of the token.
   * @returns A promise that resolves to the result of the notification operation.
   */
  const balanceNotify = async (
    userAgent: HttpAgent,
    principal: string | undefined,
  ) => {
    try {
      if (!principal) return []

      const serviceActor = getActor(userAgent)
      const result = await serviceActor.icrc84_notify({
        token: Principal.fromText(principal),
      })

      return result
    } catch (error) {
      console.error('Error balance notify:', error)
      return []
    }
  }

  return { getBalances, getBalance, getTrackedDeposit, balanceNotify }
}

export default useWallet