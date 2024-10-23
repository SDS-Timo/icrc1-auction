import { HttpAgent } from '@dfinity/agent'
import { IcrcLedgerCanister, decodeIcrcAccount } from '@dfinity/ledger-icrc'
import { Principal } from '@dfinity/principal'

import { TokenDataItem, TokenMetadata, Result } from '../types'
import {
  convertVolumeFromCanister,
  getDecimals,
  addDecimal,
} from '../utils/calculationsUtils'
import { getActor } from '../utils/canisterUtils'
import { getAuctionCanisterId } from '../utils/canisterUtils'
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
   * Fetches and processes balances with credits details for the user.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param tokens - An array of token objects.
   * @returns A promise that resolves to an array of TokenDataItem objects containing the user's token balances with credits details.
   */
  const getBalancesCredits = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
  ): Promise<TokenDataItem[]> => {
    try {
      if (!tokens || tokens.length === 0) return []

      const serviceActor = getActor(userAgent)

      const balancesRaw = await serviceActor.queryCredits()

      const creditsMap = (balancesRaw ?? []).reduce(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (acc, [principal, credits, _sessionNumber]) => {
          acc[principal.toText()] = credits
          return acc
        },
        {} as Record<string, any>,
      )

      const balances: TokenDataItem[] = tokens.map((token, index) => {
        const principal = token.principal || ''
        const credits = creditsMap[principal] || {
          available: 0,
          locked: 0,
          total: 0,
        }

        const { volumeInBase: volumeInAvailable } = convertVolumeFromCanister(
          Number(credits.available),
          getDecimals(token),
          0,
        )

        const { volumeInBase: volumeInLocked } = convertVolumeFromCanister(
          Number(credits.locked),
          getDecimals(token),
          0,
        )

        const { volumeInBase: volumeInTotal } = convertVolumeFromCanister(
          Number(credits.total),
          getDecimals(token),
          0,
        )

        return {
          id: BigInt(index),
          datetime: '',
          price: 0,
          volume: 0,
          volumeInQuote: 0,
          volumeInBase: volumeInAvailable,
          volumeInAvailable,
          volumeInAvailableNat: String(credits.available),
          volumeInLocked,
          volumeInLockedNat: String(credits.locked),
          volumeInTotal,
          volumeInTotalNat: String(credits.total),
          ...token,
        }
      })

      const data = addDecimal(balances, 4)

      return data
    } catch (error) {
      console.error('Error fetching balances with credits:', error)
      return []
    }
  }

  /**
   * Fetches the balance for a given token and account.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param tokens - An array of token objects.
   * @param principal - The principal ID of the token as a string.
   * @param account - The account identifier as a string.
   * @param action - Action to identify which account should be monitored
   * @returns The balance or an empty array in case of an error.
   */
  const getBalance = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
    principal: string,
    account: string,
    action: string,
  ): Promise<number | []> => {
    try {
      if (!tokens || tokens.length === 0) return []

      const tokenCanisterId = Principal.fromText(principal)

      const auctionCanisterId = getAuctionCanisterId()

      const { balance } = IcrcLedgerCanister.create({
        agent: userAgent,
        canisterId: tokenCanisterId,
      })

      const decodeAccount = decodeIcrcAccount(account)
      let owner = decodeAccount.owner
      let subaccount = decodeAccount.subaccount

      if (action === 'claim') {
        owner = Principal.fromText(auctionCanisterId)
        const hexSubAccountId = getSubAccountFromPrincipal(account).subAccountId
        subaccount = new Uint8Array(hexToUint8Array(hexSubAccountId))
      }

      const myBalance = await balance({
        owner: owner,
        subaccount: subaccount,
        certified: false,
      })

      const token = getToken(tokens, tokenCanisterId)

      const { volumeInBase } = convertVolumeFromCanister(
        Number(myBalance),
        getDecimals(token),
        0,
      )

      return volumeInBase
    } catch (error) {
      return []
    }
  }

  /**
   * Fetches the tracked deposit for a given principal.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param tokens - An array of token objects.
   * @param principal - The principal ID as a string.
   * @returns The tracked deposit data or 0 in case of an error.
   */
  const getTrackedDeposit = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
    principal: string,
  ): Promise<number | Result> => {
    try {
      if (!tokens || tokens.length === 0) return 0

      const tokenCanisterId = Principal.fromText(principal)

      const serviceActor = getActor(userAgent)
      const deposit: Result =
        await serviceActor.icrc84_trackedDeposit(tokenCanisterId)

      if (deposit.Ok !== undefined) {
        const token = getToken(tokens, tokenCanisterId)

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
      return 0
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

  /**
   * Withdraws credit from the user's account using the ICRC-84 protocol.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param principal - The principal identifier of the token.
   * @param account - The account identifier as a hexadecimal string.
   * @param amount - The amount of credit to withdraw.
   * @returns The result of the withdrawal transaction.
   */
  const withdrawCredit = async (
    userAgent: HttpAgent,
    principal: string | undefined,
    account: string | undefined,
    amount: number,
  ) => {
    try {
      if (!principal || !account) return null

      const decodeAccount = decodeIcrcAccount(account)

      const serviceActor = getActor(userAgent)
      const result = await serviceActor.icrc84_withdraw({
        token: Principal.fromText(principal),
        to: {
          owner: decodeAccount.owner,
          subaccount: decodeAccount?.subaccount
            ? [decodeAccount.subaccount]
            : [],
        },
        amount: BigInt(amount),
        expected_fee: [],
      })

      return result
    } catch (error) {
      console.error('Error withdraw credit:', error)
      return null
    }
  }

  /**
   * Get Deposit Allowance info from the user's account using the ICRC-84 protocol.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param principal - The principal identifier of the token.
   * @param account - The account identifier as a hexadecimal string.
   * @returns The info of the deposit allowance.
   */
  const getDepositAllowanceInfo = async (
    userAgent: HttpAgent,
    principal: string | undefined,
    account: string | undefined,
  ) => {
    try {
      if (!principal || !account) return null

      const decodeAccount = decodeIcrcAccount(account)

      const auctionCanisterId = getAuctionCanisterId()

      const userPrincipal = await userAgent.getPrincipal()
      const hexSubAccountId = getSubAccountFromPrincipal(
        userPrincipal.toText(),
      ).subAccountId

      const ledgerActor = IcrcLedgerCanister.create({
        agent: userAgent,
        canisterId: Principal.fromText(principal),
      })
      const result = await ledgerActor.allowance({
        account: {
          owner: decodeAccount.owner,
          subaccount: decodeAccount?.subaccount
            ? [decodeAccount.subaccount]
            : [],
        },
        spender: {
          owner: Principal.fromText(auctionCanisterId),
          subaccount: [new Uint8Array(hexToUint8Array(hexSubAccountId))],
        },
        certified: false,
      })

      return result
    } catch (error) {
      return null
    }
  }

  /**
   * Deposit credit from the user's account using the ICRC-84 protocol.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param principal - The principal identifier of the token.
   * @param account - The account identifier as a hexadecimal string.
   * @param amount - The amount of credit to withdraw.
   * @returns The result of the deposit transaction.
   */
  const deposit = async (
    userAgent: HttpAgent,
    principal: string | undefined,
    account: string | undefined,
    amount: number,
  ) => {
    try {
      if (!principal || !account) return null

      const decodeAccount = decodeIcrcAccount(account)

      const serviceActor = getActor(userAgent)
      const result = await serviceActor.icrc84_deposit({
        token: Principal.fromText(principal),
        from: {
          owner: decodeAccount.owner,
          subaccount: decodeAccount?.subaccount
            ? [decodeAccount.subaccount]
            : [],
        },
        amount: BigInt(amount),
        expected_fee: [],
      })

      return result
    } catch (error) {
      console.error('Error deposit credit:', error)
      return null
    }
  }

  return {
    getBalancesCredits,
    getBalance,
    getTrackedDeposit,
    balanceNotify,
    withdrawCredit,
    getDepositAllowanceInfo,
    deposit,
  }
}

export default useWallet
