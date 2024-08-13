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
 * @param price - The price in the quote currency.
 * @param decimalsPrice - The number of decimal places for the price.
 * @param decimalsQuote - The number of decimal places for the quote currency.
 * @returns The price in the smallest unit of the quote currency.
 */
export function convertPriceToCanister(
  price: number,
  decimalsPrice: number,
  decimalsQuote: number,
): number {
  const priceInSmallestUnitBase =
    price * Math.pow(10, decimalsQuote - decimalsPrice)
  return priceInSmallestUnitBase
}

/**
 * Convert the volume in the smallest units of the base currency.
 * @param baseAmount - The amount in the base currency.
 * @param decimalsBase - The number of decimal places for the base currency.
 * @returns The volume in the smallest unit of the base currency.
 */
export function convertVolumeToCanister(
  baseAmount: number,
  decimalsBase: number,
): bigint {
  const smallestUnitBase = Math.pow(10, decimalsBase)
  const volume = baseAmount * smallestUnitBase
  return BigInt(Math.round(volume))
}

/**
 * Retrieves the decimal places from the provided symbol object.
 *
 * @param symbol - The object containing the decimals property. If the property is not found or the input is invalid, a default value is returned.
 * @returns The number of decimal places specified in the symbol object, or a default value of 20 if the property is not found or the input is invalid.
 */
export function getDecimals(symbol: any): number {
  if (symbol && !Array.isArray(symbol) && typeof symbol.decimals === 'number') {
    return symbol.decimals
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
  significantDigits: number,
): T[] {
  function getDecimalPlaces(num: { toString: () => string }) {
    // Convert the number to a string and handle exponential notation
    let numStr = num.toString()
    if (numStr.includes('e')) {
      numStr = Number(num)
        .toFixed(20)
        .replace(/\.?0+$/, '')
    }

    const decimalPart = numStr.split('.')[1] || ''
    const firstSignificantDigitIndex = decimalPart.search(/[^0]/)

    if (firstSignificantDigitIndex === -1) {
      return 0
    }

    return firstSignificantDigitIndex + significantDigits
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
