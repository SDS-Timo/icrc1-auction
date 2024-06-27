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

export const getDecimals = (option: any): number => {
  if (option && !Array.isArray(option) && typeof option.decimals === 'number') {
    return option.decimals
  }
  return 6
}
