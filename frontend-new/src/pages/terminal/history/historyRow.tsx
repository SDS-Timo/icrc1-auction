import React from 'react'

import { Td, Tr, Text } from '@chakra-ui/react'

import { DataItem } from '../../../types'

interface HistoryRowProps {
  data: DataItem
  toggleVolume: string
}

const HistoryRow: React.FC<HistoryRowProps> = ({ data, toggleVolume }) => {
  return (
    <Tr key={data.id}>
      <Td textAlign="center">
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
        <Text fontSize="14px">{data.date}</Text>
        <Text fontSize="11px" color="grey.400">
          {data.time}
        </Text>
      </Td>
    </Tr>
  )
}

export default HistoryRow
