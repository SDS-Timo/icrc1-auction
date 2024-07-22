import { DataItem, TokenDataItem } from '../types'

/**
 * Convert the price received from the canister.
 * @param price - The price in the smallest unit received from the canister.
 * @param decimalsPrice - The number of decimal places for the price.
 * @param decimalsQuote - The number of decimal places for the quote currency.
 * @returns The converted price unit of the quote currency.
 */
export function convertPriceFromCanister(
  price: number,
  decimalsPrice: number,
  decimalsQuote: number,
) {
  const decimalFactor = Math.pow(10, -decimalsPrice)
  const decimalQuote = Math.pow(10, -decimalsQuote)
  const convertedPrice = (price * decimalQuote) / decimalFactor
  return convertedPrice
}

/**
 * Convert the volume received from the canister.
 * @param volume - The volume in the smallest unit received from the canister.
 * @param decimals - The number of decimal places for the base currency.
 * @param price - The price in the smallest unit of the quote currency.
 * @returns An object containing the volume in quote currency and base currency.
 */
export function convertVolumeFromCanister(
  volume: number,
  decimals: number,
  price: number,
) {
  const decimalFactor = Math.pow(10, -decimals)
  const volumeInBase = volume * decimalFactor

  const volumeInQuote = volumeInBase * price

  return { volumeInQuote, volumeInBase }
}

/**
 * Convert the price in the smallest units of the base and quote currencies.
 * @param baseAmount - The amount in the base currency.
 * @param quoteAmount - The amount in the quote currency.
 * @param decimalsPrice - The number of decimal places for the price.
 * @param decimalsQuote - The number of decimal places for the quote currency.
 * @returns The price in the smallest unit of the quote currency.
 */
export function convertPriceToCanister(
  baseAmount: number,
  quoteAmount: number,
  decimalsPrice: number,
  decimalsQuote: number,
): number {
  const smallestUnitBase = Math.pow(10, -decimalsPrice)
  const smallestUnitQuote = Math.pow(10, -decimalsQuote)

  const baseAmountInSmallestUnit = baseAmount / smallestUnitBase
  const quoteAmountInSmallestUnit = quoteAmount / smallestUnitQuote

  const price = Math.round(quoteAmountInSmallestUnit / baseAmountInSmallestUnit)
  return price
}

/**
 * Convert the volume in the smallest units of the base currency.
 * @param quoteAmount - The amount in the quote currency.
 * @param priceInQuote - The price in quote unit.
 * @param decimalsPrice - The number of decimal places for the price.
 * @returns The volume in the smallest unit of the base currency.
 */
export function convertVolumeToCanister(
  quoteAmount: number,
  priceInQuote: number,
  decimalsPrice: number,
): number {
  const smallestUnitBase = Math.pow(10, -decimalsPrice)

  const baseAmount = quoteAmount / priceInQuote

  const volume = Math.round(baseAmount / smallestUnitBase)
  return volume
}

export function getDecimals(option: any): number {
  if (option && !Array.isArray(option) && typeof option.decimals === 'number') {
    return option.decimals
  }
  return 20
}

/**
 * Add decimal information to the objects.
 * This function calculates and assigns the number of decimal places for price,
 * volume in base currency, and volume in quote currency for each object.
 *
 * @param objects - An array of objects containing price, volumeInBase, and volumeInQuote.
 * @returns The modified array of objects with decimal information added.
 */
export function addDecimal<T extends DataItem | TokenDataItem>(
  objects: T[],
): T[] {
  function getDecimalPlaces(num: { toString: () => string }) {
    const numStr = num.toString().split('.')[1] || ''
    const firstSignificantDigitIndex = numStr.search(/[^0]/)

    if (firstSignificantDigitIndex === -1) {
      return 0
    }
    if (firstSignificantDigitIndex + 1 < numStr.length) {
      return firstSignificantDigitIndex + 2
    } else {
      return firstSignificantDigitIndex + 1
    }
  }

  let maxPriceDecimals = 0
  let maxVolumeInBaseDecimals = 0
  let maxVolumeInQuoteDecimals = 0

  objects.forEach((obj) => {
    const priceDecimals = getDecimalPlaces(obj.price)
    const volumeInBaseDecimals = getDecimalPlaces(obj.volumeInBase)
    const volumeInQuoteDecimals = getDecimalPlaces(obj.volumeInQuote)

    obj.priceDecimals = priceDecimals
    obj.volumeInBaseDecimals = volumeInBaseDecimals
    obj.volumeInQuoteDecimals = volumeInQuoteDecimals

    maxPriceDecimals = Math.max(maxPriceDecimals, priceDecimals)
    maxVolumeInBaseDecimals = Math.max(
      maxVolumeInBaseDecimals,
      volumeInBaseDecimals,
    )
    maxVolumeInQuoteDecimals = Math.max(
      maxVolumeInQuoteDecimals,
      volumeInQuoteDecimals,
    )
  })

  objects.forEach((obj) => {
    obj.priceDecimals = maxPriceDecimals
    obj.volumeDecimals = maxVolumeInQuoteDecimals
    obj.volumeInBaseDecimals = maxVolumeInBaseDecimals
    obj.volumeInQuoteDecimals = maxVolumeInQuoteDecimals
  })

  return objects
}
