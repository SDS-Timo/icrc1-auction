import { DataItem } from '../types'

export function convertPrice(
  price: number,
  decimalsPrice: number,
  decimalsQuote: number,
) {
  const decimalFactor = Math.pow(10, -decimalsPrice)
  const decimalQuote = Math.pow(10, -decimalsQuote)
  const convertedPrice = (price * decimalQuote) / decimalFactor
  return convertedPrice
}

export function convertVolume(volume: number, decimals: number, price: number) {
  const decimalFactor = Math.pow(10, -decimals)
  const volumeInBase = volume * decimalFactor

  const volumeInQuote = volumeInBase * price

  return { volumeInQuote, volumeInBase }
}

export function getDecimals(option: any): number {
  if (option && !Array.isArray(option) && typeof option.decimals === 'number') {
    return option.decimals
  }
  return 20
}

export function addDecimal(objects: DataItem[]) {
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
