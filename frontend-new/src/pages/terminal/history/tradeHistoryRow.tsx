import React from 'react'

import { Td, Tr, Tooltip } from '@chakra-ui/react'

import { DataItem, Option } from '../../../types'

interface TradeHistoryRowProps {
  trade: DataItem
  selectedSymbol: Option | null
}

const TradeHistoryRow: React.FC<TradeHistoryRowProps> = ({
  trade,
  selectedSymbol,
}) => {
  return (
    <Tr key={trade.id}>
      <Td
        textAlign="center"
        color={trade.type === 'buy' ? 'green.500' : 'red.500'}
      >
        {trade.price.toLocaleString('en-US', {
          minimumFractionDigits: trade.priceDecimals,
          maximumFractionDigits: trade.priceDecimals,
        })}
      </Td>
      <Td textAlign="center">
        <Tooltip
          label={`${trade.volumeInBase.toFixed(trade.volumeInBaseDecimals)} ${selectedSymbol?.base}`}
        >
          {trade.volume.toFixed(trade.volumeDecimals)}
        </Tooltip>
      </Td>
      <Td textAlign="center" whiteSpace="nowrap">
        <Tooltip label={trade.datetime}>{trade.time?.toUpperCase()}</Tooltip>
      </Td>
    </Tr>
  )
}

export default TradeHistoryRow
