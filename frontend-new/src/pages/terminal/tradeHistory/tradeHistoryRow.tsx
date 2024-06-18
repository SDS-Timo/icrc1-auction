import React from 'react'

import { Td, Tr } from '@chakra-ui/react'

import { Trade } from '../../../types'

interface TradeHistoryRowProps {
  trade: Trade
}

const TradeHistoryRow: React.FC<TradeHistoryRowProps> = ({ trade }) => {
  return (
    <Tr key={trade.id} textAlign="center">
      <Td
        fontSize="12px"
        color={trade.type === 'buy' ? 'green.500' : 'red.500'}
      >
        {trade.price}
      </Td>
      <Td textAlign="center" fontSize="12px">
        {trade.amount}
      </Td>
      <Td fontSize="12px" whiteSpace="nowrap">
        {trade.time}
      </Td>
    </Tr>
  )
}

export default TradeHistoryRow
