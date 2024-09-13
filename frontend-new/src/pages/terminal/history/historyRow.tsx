import React from 'react'

import { Td, Tr, Text, Tooltip } from '@chakra-ui/react'

import { DataItem, Option } from '../../../types'
import { fixDecimal } from '../../../utils/calculationsUtils'
interface HistoryRowProps {
  data: DataItem
  symbol: Option | null
  toggleVolume: string
}

const HistoryRow: React.FC<HistoryRowProps> = ({
  data,
  symbol,
  toggleVolume,
}) => {
  const priceFormatted = Number(fixDecimal(data.price, data.priceDigitsLimit))

  return (
    <Tr key={data.id}>
      <Td textAlign="center">{priceFormatted.toLocaleString('en-US')}</Td>
      <Td textAlign="center">
        {toggleVolume === 'quote' ? (
          <Tooltip
            label={`${fixDecimal(data.volumeInQuote, data.quoteDecimals)} ${symbol?.quote}`}
            aria-label="Quote value"
          >
            <Text as="span">
              {fixDecimal(data.volumeInQuote, data.volumeInQuoteDecimals)}{' '}
            </Text>
          </Tooltip>
        ) : (
          <Tooltip
            label={`${fixDecimal(data.volumeInBase, symbol?.decimals)} ${symbol?.base}`}
            aria-label="Base value"
          >
            <Text as="span">
              {Number(data.volumeInBase.toFixed(data.volumeInBaseDecimals)) > 0
                ? fixDecimal(data.volumeInBase, data.volumeInBaseDecimals)
                : fixDecimal(data.volumeInBase, symbol?.decimals)}{' '}
            </Text>
          </Tooltip>
        )}
      </Td>
      <Td textAlign="center" whiteSpace="nowrap">
        <Text fontSize="14px">{data.date}</Text>
        <Text fontSize="11px" color="grey.400">
          {data.time}
        </Text>
      </Td>
    </Tr>
  )
}

export default HistoryRow
