import React from 'react'

import { Td, Tr, Tooltip } from '@chakra-ui/react'

import { DataItem } from '../../../types'

interface HistoryRowProps {
  data: DataItem
  toggleVolume: string
}

const HistoryRow: React.FC<HistoryRowProps> = ({ data, toggleVolume }) => {
  return (
    <Tr key={data.id}>
      <Td
        textAlign="center"
        color={
          data.type && data.type === 'buy'
            ? 'green.500'
            : data.type && 'red.500'
        }
      >
        {data.price.toLocaleString('en-US', {
          minimumFractionDigits: data.priceDecimals,
          maximumFractionDigits: data.priceDecimals,
        })}
      </Td>
      <Td textAlign="center">
        {toggleVolume === 'quote'
          ? data.volumeInQuote.toFixed(data.volumeInQuoteDecimals)
          : data.volumeInBase.toFixed(data.volumeInBaseDecimals)}
      </Td>
      <Td textAlign="center" whiteSpace="nowrap">
        <Tooltip label={data.datetime}>{data.time?.toUpperCase()}</Tooltip>
      </Td>
    </Tr>
  )
}

export default HistoryRow
